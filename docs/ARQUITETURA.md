# Arquitetura

## Objetivo

Manter um catálogo pequeno, rápido e simples de publicar. Toda informação é
conhecida no build; JavaScript no navegador é usado somente para modal,
galeria, navegação e tema.

## Fluxo dos dados

1. As fotos ficam em `public/imagens/<categoria>/`.
2. Os dados comerciais ficam em `src/catalogo/catalogo.json`.
3. `schema.ts` valida campos, preços, componentes e variantes.
4. `carregar.ts` exige correspondência exata entre dados e fotos e cria os
   produtos com IDs estáveis no formato `categoria/slug`.
5. Astro renderiza todo o catálogo como HTML estático.
6. Apenas os dados necessários ao modal são serializados para o navegador.

## Responsabilidades

- `config/site.ts`: nome, textos institucionais e contatos.
- `catalogo/tipos.ts`: modelo de domínio e categorias permitidas.
- `catalogo/schema.ts`: fronteira de validação do JSON.
- `catalogo/carregar.ts`: descoberta e ordenação das imagens.
- `catalogo/produto.ts`: preço, contagem de peças e link do WhatsApp.
- `components/`: marcação e estilos de cada bloco visual.
- `scripts/`: interações progressivas, sem serem necessárias para ler o
  conteúdo principal.

## Decisões importantes

- Produto simples possui `preco`; produto com opções possui `variantes`. Os
  dois formatos não podem ser misturados.
- Componentes de uma variante pertencem à própria variante, pois a quantidade
  de peças pode mudar entre opções.
- A categoria não é inferida pelo nome: ela vem da pasta e do bloco do JSON.
- O caminho do GitHub Pages usa `BASE_URL`; componentes não repetem
  `/atelie-ma-croche` manualmente.
- Miniaturas usam `object-fit: cover` para preencher os cards. Ao abrir o
  produto, a galeria usa `contain` e mostra a peça inteira sem cortes.
- IDs não dependem da ordem retornada pelo sistema de arquivos.

## Limites intencionais

Não há estoque, pagamento, frete, autenticação ou banco de dados. Caso essas
necessidades apareçam, elas devem ser tratadas como uma mudança de produto, e
não acrescentadas informalmente ao catálogo estático.
