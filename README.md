# Ateliê Ma-Crochê

Catálogo estático de peças artesanais em crochê, publicado no GitHub Pages. O
site apresenta os modelos por categoria e encaminha encomendas para o
WhatsApp; não há backend, conta de usuário ou carrinho.

## Tecnologias

- Astro 6 e TypeScript estrito
- CSS sem framework
- Astro Content Collections + Zod para validar o catálogo durante o build
- Nix flake para ambiente e build reproduzíveis

## Desenvolvimento

Entre no ambiente declarado pelo projeto e execute o servidor:

```bash
nix develop
npm run dev
```

O `devShell` cria `node_modules` a partir do `package-lock.json`. Não use
`npm install` para tentar modificar essa pasta, pois os pacotes são links
somente leitura para o Nix Store.

Antes de publicar:

```bash
npm run check
```

Esse comando executa os testes de domínio, valida as imagens e faz o build
estático completo. A saída é gravada em `dist/`. O mesmo comando é executado
automaticamente pelo CI do GitHub em cada push e pull request.

Para comprimir imagens novas mantendo os mesmos nomes e formatos:

```bash
npm run optimize-images
```

O otimizador só substitui um arquivo quando a versão comprimida fica menor.

## Estrutura

```text
src/
├── catalogo/      # dados, tipos, validação e regras de produto
├── components/    # cards, modal, galeria e chamada personalizada
├── config/        # dados institucionais e contatos
├── content/       # um arquivo JSON por produto, separado por categoria
├── content.config.ts # definição e validação das Content Collections
├── layouts/       # documento HTML, SEO e tema
├── pages/         # composição da página
├── scripts/       # comportamento executado no navegador
└── styles/        # tokens, reset e layout global
public/imagens/    # fotos organizadas por categoria
scripts/           # verificações auxiliares, como validação de imagens
tests/             # testes das regras do catálogo
docs/              # arquitetura, manutenção e pendências editoriais
```

## Manutenção do catálogo

Leia [docs/CATALOGO.md](docs/CATALOGO.md) antes de adicionar ou alterar um
produto. Cada item precisa ter uma foto e uma entrada correspondente em
`src/content/produtos/<categoria>/<slug>.json`; divergências interrompem o
build para impedir a publicação de dados incompletos.

As decisões técnicas estão em [docs/ARQUITETURA.md](docs/ARQUITETURA.md) e as
informações que ainda precisam ser fornecidas estão em
[docs/AUDITORIA-CATALOGO.md](docs/AUDITORIA-CATALOGO.md).

## Publicação

O projeto usa `site: https://felipeasop.github.io` e
`base: /atelie-ma-croche` em `astro.config.mjs`. O conteúdo de `dist/` deve ser
publicado pelo GitHub Pages sem alterar esses caminhos.
