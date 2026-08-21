# Manutenção do catálogo

## Adicionar um produto

1. Escolha uma categoria já existente.
2. Crie a foto principal em
   `public/imagens/<categoria>/<slug>.jpeg`.
3. Para outras fotos, use `<slug>-2.jpeg`, `<slug>-3.jpeg` e assim por diante.
4. Adicione o mesmo `slug` dentro da categoria em
   `src/catalogo/catalogo.json`.
5. Execute `npm run check`.

Use slugs minúsculos, sem acentos, separados por hífen. Não coloque logos ou
ícones dentro das pastas de categorias.

## Produto com preço único

```json
"tapete-exemplo": {
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

```json
"jogo-exemplo": {
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

Não informe `preco` ou `componentes` no nível do produto quando houver
variantes.

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
