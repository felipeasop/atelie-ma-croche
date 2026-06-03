import type { Produto } from "../data/types";

export function formatarPreco(preco: number): string {
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function imgPath(caminho: string): string {
  return `/atelie-ma-croche/imagens/${caminho}`;
}

export function wppLink(produto: Produto, whatsapp: string): string {
  const msg = encodeURIComponent(
    `Olá! Gostaria de encomendar: *${produto.nome}* — ${formatarPreco(produto.preco)}`,
  );
  return `https://wa.me/${whatsapp}?text=${msg}`;
}
