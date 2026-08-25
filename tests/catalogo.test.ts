import assert from "node:assert/strict";
import test from "node:test";
import {
  caminhoImagem,
  caminhoPublico,
  criarLinkWhatsApp,
  formatarFaixaPreco,
  formatarPreco,
  menorPreco,
  precoExibicao,
  resumoProduto,
  totalPecas,
} from "../src/catalogo/produto.ts";
import { ProdutoMetaSchema } from "../src/catalogo/schema.ts";
import type { Produto } from "../src/catalogo/tipos.ts";

const produtoBase = {
  id: "cozinha/teste",
  slug: "teste",
  nome: "Produto Teste",
  categoria: "cozinha",
  imagens: ["cozinha/teste.jpeg"],
  sobMedida: false,
  corPersonalizavel: true,
} as const;

test("soma as quantidades físicas dos componentes", () => {
  assert.equal(
    totalPecas([{ nome: "Passadeira" }, { nome: "Tapete", quantidade: 2 }]),
    3,
  );
});

test("considera quantidade omitida como uma peça", () => {
  assert.equal(totalPecas([{ nome: "Tapete" }, { nome: "Passadeira" }]), 2);
  assert.equal(totalPecas(), 0);
});

test("resume variantes com intervalo de peças", () => {
  const produto: Produto = {
    ...produtoBase,
    variantes: [
      { descricao: "2 tapetes", preco: 110, componentes: [{ nome: "Peça", quantidade: 3 }] },
      { descricao: "3 tapetes", preco: 160, componentes: [{ nome: "Peça", quantidade: 4 }] },
    ],
  };

  assert.equal(resumoProduto(produto), "2 opções · 3–4 peças");
  assert.equal(precoExibicao(produto), `A\u00A0partir\u00A0de ${formatarPreco(110)}`);
  assert.equal(menorPreco(produto), 110);
});

test("exibe preço fixo sem o prefixo de valor inicial", () => {
  const produto: Produto = { ...produtoBase, preco: 50 };

  assert.equal(precoExibicao(produto), formatarPreco(50));
  assert.equal(resumoProduto(produto), null);
});

test("exibe preço de produto sob medida como valor inicial", () => {
  const produto: Produto = { ...produtoBase, preco: 80, sobMedida: true };

  assert.equal(precoExibicao(produto), `A\u00A0partir\u00A0de ${formatarPreco(80)}`);
});

test("exibe e envia a faixa de preço completa", () => {
  const produto: Produto = {
    ...produtoBase,
    preco: 470,
    precoMaximo: 600,
    sobMedida: true,
  };

  assert.equal(precoExibicao(produto), formatarFaixaPreco(470, 600));
  assert.match(criarLinkWhatsApp(produto, "554399792859"), /R%24%C2%A0470%2C00%E2%80%93R%24%C2%A0600%2C00/);
});

test("prioriza medidas no resumo do produto", () => {
  const produto: Produto = {
    ...produtoBase,
    preco: 90,
    medidas: "70 × 45 cm",
    componentes: [{ nome: "Tapete", quantidade: 2 }],
  };

  assert.equal(resumoProduto(produto), "70 × 45 cm");
});

test("gera link do WhatsApp com variante, preço e observação", () => {
  const produto: Produto = {
    ...produtoBase,
    sobMedida: true,
    variantes: [
      { descricao: "Passadeira + 2 tapetes", preco: 110 },
      { descricao: "Passadeira + 3 tapetes", preco: 160 },
    ],
  };

  const link = criarLinkWhatsApp(produto, "554399792859", produto.variantes[1]);
  const url = new URL(link);

  assert.equal(url.hostname, "wa.me");
  assert.equal(url.pathname, "/554399792859");
  assert.equal(
    url.searchParams.get("text"),
    `Olá! Gostaria de encomendar *Produto Teste* — Passadeira + 3 tapetes — ${formatarPreco(160)} (valor base).`,
  );
});

test("normaliza a base e remove barras duplicadas nos caminhos públicos", () => {
  assert.equal(caminhoPublico("/imagens/logo.png"), "/imagens/logo.png");
  assert.equal(caminhoImagem("cozinha/tapete.jpeg"), "/imagens/cozinha/tapete.jpeg");
});

test("schema rejeita preço e variantes no mesmo produto", () => {
  assert.throws(() =>
    ProdutoMetaSchema.parse({
      nome: "Inválido",
      preco: 10,
      variantes: [
        { descricao: "A", preco: 10 },
        { descricao: "B", preco: 20 },
      ],
    }),
  );
});

test("schema rejeita produto sem preço nem variantes", () => {
  assert.throws(() => ProdutoMetaSchema.parse({ nome: "Inválido" }));
});

test("schema rejeita variante sem preço positivo", () => {
  assert.throws(() => ProdutoMetaSchema.parse({
    nome: "Inválido",
    variantes: [
      { descricao: "Opção A", preco: 0 },
      { descricao: "Opção B", preco: 20 },
    ],
  }));
});

test("schema aceita produto com preço e componentes válidos", () => {
  const resultado = ProdutoMetaSchema.parse({
    nome: "Produto válido",
    preco: 50,
    componentes: [{ nome: "Tapete", quantidade: 2 }],
  });

  assert.equal(resultado.preco, 50);
});
