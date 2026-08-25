# Manutenção do catálogo

## Estrutura dos produtos

O catálogo usa Astro Content Collections. Cada produto é um arquivo JSON
independente em:

```text
src/content/produtos/<categoria>/<slug>.json
```

Exemplo: o produto `tapete-aninha` fica em
`src/content/produtos/tapetes/tapete-aninha.json`.

A categoria e o slug são definidos pelo caminho do arquivo; não inclua esses
campos dentro do JSON. Use apenas categorias existentes:

- `cozinha`
- `mesa`
- `banheiro`
- `tapetes`
- `decoracao`
- `roupa`
- `chaveiro`
- `acessorio`

## Adicionar um produto

1. Escolha uma categoria e crie o arquivo
   `src/content/produtos/<categoria>/<slug>.json`.
2. Adicione a foto principal em
   `public/imagens/<categoria>/<slug>.jpeg`.
3. Para outras fotos, use `<slug>-2.jpeg`, `<slug>-3.jpeg` e assim por diante.
4. Execute `npm run optimize-images` para comprimir as novas fotos.
5. Execute `npm run check` antes de enviar a alteração.

Use slugs minúsculos, sem acentos, separados por hífen. O slug do arquivo JSON
e o da imagem principal devem ser exatamente iguais. Não coloque logos ou
ícones dentro das pastas de categorias.

## Produto com preço único

Arquivo `src/content/produtos/decoracao/tapete-exemplo.json`:

```json
{
  "nome": "Tapete Exemplo",
  "descricao": "Descrição curta e objetiva.",
  "preco": 80,
  "medidas": "70 × 45 cm",
  "componentes": [{ "nome": "Tapete" }]
}
```

`descricao`, `medidas` e `componentes` são opcionais. `quantidade` pode ser
omitida quando vale 1.

## Produto com variantes

Arquivo `src/content/produtos/cozinha/jogo-exemplo.json`:

```json
{
  "nome": "Jogo Exemplo",
  "variantes": [
    {
      "descricao": "Passadeira + 2 tapetes",
      "preco": 120,
      "componentes": [
        { "nome": "Passadeira" },
        { "nome": "Tapete", "quantidade": 2 }
      ]
    },
    {
      "descricao": "Passadeira + 3 tapetes",
      "preco": 160,
      "componentes": [
        { "nome": "Passadeira" },
        { "nome": "Tapete", "quantidade": 3 }
      ]
    }
  ]
}
```

Um produto precisa ter exatamente um destes formatos:

- `preco`, para preço único;
- `variantes`, para duas ou mais opções de compra.

Não informe `preco` ou `componentes` no nível do produto quando houver
variantes: os componentes pertencem a cada opção.

## Regras das imagens

O comando `npm run check-images` é executado pelo `npm run check` e pelo CI do
GitHub. Ele verifica automaticamente:

- formato permitido (`jpg`, `jpeg`, `png`, `gif`, `webp` ou `avif`);
- dimensões mínimas de `300 × 300 px`;
- tamanho máximo de `2 MB` por arquivo;
- correspondência entre o slug da imagem e o arquivo do produto;
- existência de uma imagem para cada produto;
- ausência de subpastas dentro das categorias.

As imagens dos produtos devem ficar diretamente em
`public/imagens/<categoria>/`, com a imagem principal usando exatamente o slug
do produto. Fotos adicionais usam o sufixo `-2`, `-3` e assim por diante.

Depois de adicionar fotos, execute `npm run optimize-images`. O comando usa
compressão adequada para cada formato, preserva dimensões e nomes dos arquivos
e só substitui a imagem quando consegue reduzir seu tamanho.

## Campos especiais

- `sobMedida: true`: mostra o preço como valor inicial e exibe um aviso.
- `corPersonalizavel: false`: remove a mensagem sobre escolha de cores.
- `medidas`: sempre inclua unidade, por exemplo `30 × 30 cm` ou `1,50 m`.

## Checklist editorial

- A foto principal mostra a peça inteira e está bem iluminada.
- Nome, preço, composição e medidas correspondem ao item fotografado.
- O preço representa unidade, conjunto ou variante de forma inequívoca.
- A descrição não promete prazo, material ou tamanho ainda não confirmado.
- O link do WhatsApp abre com o produto e o preço corretos.
