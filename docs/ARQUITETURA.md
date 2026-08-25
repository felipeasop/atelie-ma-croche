# Arquitetura

## Objetivo

Manter um catálogo pequeno, rápido e simples de publicar. Toda informação é
conhecida no build; JavaScript no navegador é usado somente para modal,
galeria, navegação e tema.

## Fluxo dos dados

1. As fotos ficam em `public/imagens/<categoria>/`.
2. Cada produto possui um arquivo em
   `src/content/produtos/<categoria>/<slug>.json`.
3. `content.config.ts` registra a Content Collection e usa `schema.ts` para
   validar campos, preços, componentes e variantes.
4. `carregar.ts` lê a Collection, exige correspondência exata entre dados e fotos e cria os
   produtos com IDs estáveis no formato `categoria/slug`.
5. Astro renderiza todo o catálogo como HTML estático.
6. Apenas os dados necessários ao modal são serializados para o navegador.

## Responsabilidades

- `config/site.ts`: nome, textos institucionais e contatos.
- `content.config.ts`: configuração da Content Collection `produtos`.
- `content/produtos/`: dados comerciais, um arquivo por produto.
- `catalogo/tipos.ts`: modelo de domínio e categorias permitidas.
- `catalogo/schema.ts`: schema compartilhado de cada produto.
- `catalogo/carregar.ts`: descoberta e ordenação das imagens.
- `catalogo/produto.ts`: preço, contagem de peças e link do WhatsApp.
- `scripts/validar-imagens.mjs`: integridade, dimensões e tamanho das fotos.
- `scripts/otimizar-imagens.mjs`: compressão conservadora das imagens.
- `components/`: marcação e estilos de cada bloco visual.
- `scripts/`: interações progressivas, sem serem necessárias para ler o
  conteúdo principal.

## Decisões importantes

- Produto simples possui `preco`; produto com opções possui `variantes`. Os
  dois formatos não podem ser misturados.
- Componentes de uma variante pertencem à própria variante, pois a quantidade
  de peças pode mudar entre opções.
- A categoria e o slug vêm do caminho do arquivo da Collection, por exemplo
  `content/produtos/mesa/souplast-basico.json` gera `mesa/souplast-basico`.
- O caminho do GitHub Pages usa `BASE_URL`; componentes não repetem
  `/atelie-ma-croche` manualmente.
- Miniaturas usam `object-fit: cover` para preencher os cards. Ao abrir o
  produto, a galeria usa `contain` e mostra a peça inteira sem cortes.
- IDs não dependem da ordem retornada pelo sistema de arquivos.

## Garantias de publicação

`npm run check` executa os testes de domínio, valida imagens e gera o build
estático. O workflow de CI executa esse comando em todo push e pull request; o
workflow de deploy também o executa antes de publicar no GitHub Pages.

## Limites intencionais

Não há estoque, pagamento, frete, autenticação ou banco de dados. Caso essas
necessidades apareçam, elas devem ser tratadas como uma mudança de produto, e
não acrescentadas informalmente ao catálogo estático.
