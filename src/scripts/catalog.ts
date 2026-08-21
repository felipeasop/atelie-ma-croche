import type { Produto } from "../catalogo/tipos.ts";
import {
  abrirModalProduto,
  iniciarModalProduto,
} from "../components/Modal/modal.ts";
import { iniciarAnimacoes } from "./modules/animations.ts";
import { iniciarNavegacaoCategorias } from "./modules/navigation.ts";
import { iniciarTema } from "./modules/theme.ts";

interface DadosCliente {
  produtos: Produto[];
  whatsapp: string;
}

function lerDadosCliente(): DadosCliente | null {
  const elemento = document.getElementById("catalog-data");
  if (!elemento?.textContent) return null;

  try {
    return JSON.parse(elemento.textContent) as DadosCliente;
  } catch (erro) {
    console.error("Não foi possível carregar os dados do catálogo.", erro);
    return null;
  }
}

export function iniciarCatalogo(): void {
  const dados = lerDadosCliente();
  if (!dados) return;

  const produtos = new Map(dados.produtos.map((produto) => [produto.id, produto]));

  document.addEventListener("click", (evento) => {
    const alvo = evento.target as Element | null;
    const gatilho = alvo?.closest<HTMLElement>("[data-open-product]");
    if (!gatilho) return;

    const produto = produtos.get(gatilho.dataset.openProduct ?? "");
    if (produto) abrirModalProduto(produto, dados.whatsapp);
  });

  iniciarModalProduto();
  iniciarNavegacaoCategorias();
  iniciarAnimacoes();
  iniciarTema();
}
