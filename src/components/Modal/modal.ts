import {
  CATEGORIAS_INFO,
  produtoTemVariantes,
  type Componente,
  type Produto,
  type Variante,
} from "../../catalogo/tipos.ts";
import {
  criarLinkWhatsApp,
  formatarPreco,
  menorPreco,
  totalPecas,
} from "../../catalogo/produto.ts";
import { criarCarrossel } from "./carousel.ts";

function selecionar<T extends Element>(raiz: ParentNode, seletor: string): T {
  const elemento = raiz.querySelector<T>(seletor);
  if (!elemento) throw new Error(`Elemento obrigatório não encontrado: ${seletor}`);
  return elemento;
}

function preencherComponentes(
  modal: HTMLDialogElement,
  componentes: readonly Componente[] | undefined,
): void {
  const secao = selecionar<HTMLElement>(modal, "[data-modal-components]");
  const titulo = selecionar<HTMLElement>(modal, "[data-modal-components-title]");
  const lista = selecionar<HTMLUListElement>(modal, "[data-modal-components-list]");

  lista.replaceChildren();
  secao.hidden = !componentes?.length;
  if (!componentes?.length) return;

  const total = totalPecas(componentes);
  titulo.textContent = `Este produto contém ${total} ${total === 1 ? "peça" : "peças"}`;

  componentes.forEach((componente) => {
    const item = document.createElement("li");
    const quantidade = componente.quantidade ?? 1;
    item.textContent = quantidade > 1 ? `${quantidade}× ${componente.nome}` : componente.nome;
    lista.append(item);
  });
}

function atualizarCompra(
  modal: HTMLDialogElement,
  produto: Produto,
  whatsapp: string,
  variante?: Variante,
): void {
  const preco = selecionar<HTMLElement>(modal, "[data-modal-price]");
  const link = selecionar<HTMLAnchorElement>(modal, "[data-modal-whatsapp]");
  const valor = variante?.preco ?? menorPreco(produto);

  preco.textContent = produto.sobMedida && !variante
    ? `A partir de ${formatarPreco(valor)}`
    : formatarPreco(valor);
  link.href = criarLinkWhatsApp(produto, whatsapp, variante);
  preencherComponentes(
    modal,
    variante?.componentes ?? (produtoTemVariantes(produto) ? undefined : produto.componentes),
  );
}

function preencherVariantes(
  modal: HTMLDialogElement,
  produto: Produto,
  whatsapp: string,
): void {
  const campo = selecionar<HTMLFieldSetElement>(modal, "[data-modal-variants]");
  const lista = selecionar<HTMLElement>(modal, "[data-modal-variants-list]");
  lista.replaceChildren();

  if (!produtoTemVariantes(produto)) {
    campo.hidden = true;
    atualizarCompra(modal, produto, whatsapp);
    return;
  }

  campo.hidden = false;
  produto.variantes.forEach((variante, indice) => {
    const opcao = document.createElement("label");
    opcao.className = "modal-variant-option";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "product-variant";
    radio.value = String(indice);
    radio.checked = indice === 0;

    const descricao = document.createElement("span");
    descricao.textContent = variante.descricao;
    const preco = document.createElement("strong");
    preco.textContent = formatarPreco(variante.preco);

    radio.addEventListener("change", () => {
      if (radio.checked) atualizarCompra(modal, produto, whatsapp, variante);
    });

    opcao.append(radio, descricao, preco);
    lista.append(opcao);
  });

  atualizarCompra(modal, produto, whatsapp, produto.variantes[0]);
}

export function abrirModalProduto(produto: Produto, whatsapp: string): void {
  const modal = document.getElementById("product-modal") as HTMLDialogElement | null;
  if (!modal) return;

  selecionar<HTMLElement>(modal, "[data-modal-category]").textContent =
    CATEGORIAS_INFO[produto.categoria].nome;
  selecionar<HTMLElement>(modal, "[data-modal-name]").textContent = produto.nome;

  const descricao = selecionar<HTMLElement>(modal, "[data-modal-description]");
  descricao.textContent = produto.descricao ?? "";
  descricao.hidden = !produto.descricao;

  const medidas = selecionar<HTMLElement>(modal, "[data-modal-measures]");
  medidas.hidden = !produto.medidas;
  selecionar<HTMLElement>(modal, "[data-modal-measures-text]").textContent =
    produto.medidas ?? "";

  selecionar<HTMLElement>(modal, "[data-modal-custom-note]").hidden =
    !produto.corPersonalizavel;
  selecionar<HTMLElement>(modal, "[data-modal-warning]").hidden = !produto.sobMedida;

  const galeria = selecionar<HTMLElement>(modal, "[data-modal-gallery]");
  galeria.replaceChildren(criarCarrossel(produto.imagens, produto.nome));
  preencherVariantes(modal, produto, whatsapp);

  if (!modal.open) modal.showModal();
}

export function iniciarModalProduto(): void {
  const modal = document.getElementById("product-modal") as HTMLDialogElement | null;
  if (!modal) return;

  selecionar<HTMLButtonElement>(modal, "[data-modal-close]").addEventListener(
    "click",
    () => modal.close(),
  );
  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) modal.close();
  });
}
