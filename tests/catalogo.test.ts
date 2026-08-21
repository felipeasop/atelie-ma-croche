import assert from "node:assert/strict";
import test from "node:test";
import {
  formatarPreco,
  precoExibicao,
  resumoProduto,
  totalPecas,
} from "../src/catalogo/produto.ts";
import { validarCatalogo } from "../src/catalogo/schema.ts";
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

test("resume variantes com intervalo de peças", () => {
  const produto: Produto = {
    ...produtoBase,
    variantes: [
      { descricao: "2 tapetes", preco: 110, componentes: [{ nome: "Peça", quantidade: 3 }] },
      { descricao: "3 tapetes", preco: 160, componentes: [{ nome: "Peça", quantidade: 4 }] },
    ],
  };

  assert.equal(resumoProduto(produto), "2 opções · 3–4 peças");
  assert.equal(precoExibicao(produto), `A partir de ${formatarPreco(110)}`);
});

test("schema rejeita preço e variantes no mesmo produto", () => {
  assert.throws(() =>
    validarCatalogo({
      cozinha: {
        teste: {
          nome: "Inválido",
          preco: 10,
          variantes: [
            { descricao: "A", preco: 10 },
            { descricao: "B", preco: 20 },
          ],
        },
      },
      mesa: {},
      banheiro: {},
      decoracao: {},
      roupa: {},
      chaveiro: {},
      acessorio: {},
    }),
  );
});
