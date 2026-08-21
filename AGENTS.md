# Contexto: reestruturação de dados de produto — Ateliê Ma-Crochê

> Cole este arquivo inteiro como contexto inicial para o Codex (ou qualquer
> outro agente) antes de pedir novos ajustes neste repo. Ele explica o que
> mudou, por quê, e onde estão as peças, para o agente não precisar
> redescobrir a arquitetura do zero.

## Repo
`felipeasop/atelie-ma-croche` — catálogo estático (Astro 6 + TS, sem
framework de UI), publicado no GitHub Pages, com pedidos via link do
WhatsApp. Sem backend, sem carrinho.

## O que existia antes (e por quê mudou)

O catálogo é **gerado automaticamente a partir de imagens**: cada pasta em
`public/imagens/<categoria>/<slug>[-2, -3...].ext` vira um produto. Um
arquivo `src/data/produtos.json` opcionalmente enriquece cada `slug` com
nome customizado, preço, tamanho etc.

Esse vínculo por string (`slug` da imagem == chave do JSON) era feito **sem
nenhuma validação**, e isso gerou 3 bugs reais que foram corrigidos:

1. **Slug com erro de digitação ficava silencioso.** A entrada
   `jogo-de-banheiro-oval-com-tulipa-tapete` no JSON não batia com a pasta
   de imagens `jogo-de-banheiro-oval-com-tulipa` (sem `-tapete`). O produto
   caía no fallback: preço R$0, nome derivado automaticamente do slug.
   Ninguém percebia porque não existia nenhum aviso.

2. **Preço embutido dentro de texto livre.** O produto "Jogo de Cozinha
   Janice" tinha na prática duas opções de compra diferentes (Passadeira +
   2 Tapetes por R$110, ou +3 Tapetes por R$160), mas isso estava
   codificado como `itens: ["Passadeira + 2 Tapetes (R$ 110)", ...]` com
   `preco: 0` no campo oficial. Resultado: o card mostrava "Grátis"/R$0,00,
   e o link do WhatsApp saía com preço errado.

3. **Contagem de peças incorreta.** O array `itens: string[]` era usado
   tanto para listar peças físicas quanto, no caso acima, para variantes.
   Além disso, quando um item dizia `"Dois tapetes"`, o sistema contava
   isso como **1 item** (`itens.length`), não 2 peças — o card mostrava "2
   peças" para um jogo que na real tem 3 peças físicas (1 passadeira + 2
   tapetes).

## O que foi mudado

### Modelo de dados novo (`src/data/types.ts`)

```ts
export interface Componente {
  nome: string;
  quantidade?: number; // default 1 quando omitido
}

export interface Variante {
  descricao: string;
  preco: number;
}

export interface Produto {
  id: number;
  nome: string;
  categoria: Categoria;
  imagens: string[];
  sob_medida: boolean;
  tamanho?: string;

  // Um produto tem OU preco (+ opcionalmente componentes),
  // OU variantes. Nunca os dois — validado via Zod no build.
  preco?: number;
  componentes?: Componente[];
  variantes?: Variante[];
}

export function totalPecas(produto: Pick<Produto, "componentes">): number;
export function menorPrecoVariante(variantes: Variante[]): number;
```

- **`componentes`** = peças físicas que compõem o produto (não afeta
  preço). `{ nome: "Tapete", quantidade: 2 }` em vez da string solta
  `"Dois tapetes"`. `totalPecas()` soma as quantidades corretamente.
- **`variantes`** = opções de compra alternativas do mesmo produto, cada
  uma com **preço próprio**. Usado quando o mesmo item pode ser comprado
  em configurações diferentes (ex: Passadeira+2 vs Passadeira+3 tapetes).

### Validação em build-time (`src/data/schema.ts`, novo arquivo)

Schema Zod que valida `produtos.json` inteiro antes do build:
- Erro se `preco` e `variantes` aparecerem juntos no mesmo produto.
- Erro se nenhum dos dois estiver presente.
- Erro se `preco`, `quantidade` ou preço de variante forem `<= 0`.
- Mensagem de erro **aponta o slug exato** do produto problemático.

### Validação cruzada imagens ↔ metadados (`src/data/produtos.ts`)

- Se um slug existe em `produtos.json` mas não tem pasta de imagem
  correspondente → **build falha** (pega erro de digitação, como o
  `oval-com-tulipa-tapete`).
- Se uma pasta de imagem existe mas não tem entrada no JSON → apenas
  **warning** no console (comportamento válido: nome/preço são inferidos).
- O glob de imagens foi restrito de `/public/imagens/**/*` para
  `/public/imagens/*/*` (um nível), porque o `**` estava capturando
  arquivos soltos na raiz (`logo.png`, `whatsapp.png` — ícones de UI, não
  produtos) como se fossem produtos órfãos.

### UI (`ProductCard.astro`, `modal.ts`, `modal.css`, `catalog.ts`, `helpers.ts`)

- `helpers.ts`: `precoExibicao(produto)` mostra preço fixo, ou
  `"A partir de R$ X"` (menor variante) quando há `variantes`.
  `wppLink(produto, whatsapp, varianteEscolhida?)` agora aceita a variante
  escolhida e monta a mensagem do WhatsApp com a descrição e preço certos.
- `ProductCard.astro`: `infoResumida` agora distingue "N peças"
  (componentes, somando quantidade) de "N opções" (variantes) — antes
  usava `itens.length` para tudo, o que causava a contagem errada.
  Produto com variantes mostra botão "Ver opções" (abre modal) em vez de
  "Encomendar" (link direto), porque a variante precisa ser escolhida
  antes de gerar o link do WhatsApp.
- `modal.ts`: renderiza lista de componentes com quantidade (`2x Tapete`),
  ou — se o produto tem `variantes` — um seletor por radio buttons. Ao
  trocar a variante selecionada, preço e link do WhatsApp no rodapé do
  modal atualizam via JS (`ligarSeletorDeVariantes`).
- `modal.css`: estilos novos para `.modal-variante-opcao` (radio como card
  clicável, destaca a opção marcada).
- `catalog.ts`: botão do card sem `data-wpp` (produto com variantes) abre
  o modal em vez de tentar um link direto.

### `produtos.json`

Migrado para o novo formato. Também corrigidos:
- `jogo-de-banheiro-oval-com-tulipa-tapete` → `jogo-de-banheiro-oval-com-tulipa`
- `jogo-de-cozinha-janice`: `itens` com preço embutido em texto →
  `variantes: [{ descricao, preco }, ...]`
- `jogo-de-banheiro-flor-de-laranjeira`, `jerusa`, `jogo-de-cozinha-basico`,
  `maria`, `quadrado-com-coracoes`: `itens: string[]` →
  `componentes: [{ nome, quantidade? }]`

## Como validar que está tudo certo

```bash
npm run build
```

Deve completar **sem nenhum warning** relacionado a produtos. Se você
editar `produtos.json` e cometer um erro de slug ou misturar
`preco`+`variantes`, o build vai falhar com uma mensagem apontando
exatamente qual produto e qual campo está errado — isso é intencional.

## Arquivos tocados (para referência rápida)

```
src/data/types.ts                  — tipos Componente, Variante, Produto; totalPecas, menorPrecoVariante
src/data/schema.ts                 — NOVO: validação Zod de produtos.json
src/data/produtos.json             — migrado + bugs de dados corrigidos
src/data/produtos.ts               — usa Zod; valida cruzamento imagens/metadados; glob restrito a 1 nível
src/utils/helpers.ts               — precoExibicao(), wppLink() aceita variante
src/components/ProductCard/ProductCard.astro — infoResumida correta; botão "Ver opções" quando há variantes
src/scripts/catalog.ts             — botão sem data-wpp abre modal
src/components/Modal/modal.ts      — renderiza componentes com quantidade + seletor de variantes
src/components/Modal/modal.css     — estilos do seletor de variantes
package.json / package-lock.json   — dependência zod adicionada
```

## Possíveis próximos passos (não feitos ainda, ideias em aberto)

- Extrair um script `npm run check-produtos` que roda só a validação (sem
  precisar fazer build completo) — útil pra rodar em CI antes do deploy.
- Se aparecerem mais casos de produto com variantes no futuro, considerar
  se `componentes` também deveria poder variar por variante (hoje
  `componentes` e `variantes` são mutuamente exclusivos por design; se
  isso deixar de fazer sentido, revisar o schema).
- Nenhum teste automatizado existe no repo hoje (nem antes, nem depois
  dessa mudança) — se for prioridade, dá pra adicionar Vitest cobrindo
  `schema.ts`, `totalPecas`, `menorPrecoVariante`.
