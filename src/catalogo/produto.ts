import type { Componente, Produto, Variante } from "./tipos.ts";
import { produtoTemVariantes } from "./tipos.ts";

const FORMATO_MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarPreco(preco: number): string {
  return FORMATO_MOEDA.format(preco);
}

export function formatarFaixaPreco(inicial: number, maximo: number): string {
  return `${formatarPreco(inicial)}–${formatarPreco(maximo)}`;
}

export function totalPecas(componentes: readonly Componente[] = []): number {
  return componentes.reduce(
    (total, componente) => total + (componente.quantidade ?? 1),
    0,
  );
}

export function menorPreco(produto: Produto): number {
  if (!produtoTemVariantes(produto)) return produto.preco;
  return Math.min(...produto.variantes.map((variante) => variante.preco));
}

export function precoExibicao(produto: Produto): string {
  if (!produtoTemVariantes(produto) && produto.precoMaximo) {
    return formatarFaixaPreco(produto.preco, produto.precoMaximo);
  }
  const prefixo = produtoTemVariantes(produto) || produto.sobMedida
    ? "A\u00A0partir\u00A0de "
    : "";
  return `${prefixo}${formatarPreco(menorPreco(produto))}`;
}

function intervaloPecas(variantes: readonly Variante[]): string | null {
  const totais = variantes
    .map((variante) => totalPecas(variante.componentes))
    .filter((total) => total > 0);

  if (totais.length !== variantes.length) return null;

  const minimo = Math.min(...totais);
  const maximo = Math.max(...totais);
  return minimo === maximo ? `${minimo} peças` : `${minimo}–${maximo} peças`;
}

export function resumoProduto(produto: Produto): string | null {
  if (produto.medidas) return produto.medidas;

  if (produtoTemVariantes(produto)) {
    const pecas = intervaloPecas(produto.variantes);
    return `${produto.variantes.length} opções${pecas ? ` · ${pecas}` : ""}`;
  }

  const pecas = totalPecas(produto.componentes);
  return pecas > 1 ? `${pecas} peças` : null;
}

export function criarLinkWhatsApp(
  produto: Produto,
  whatsapp: string,
  variante?: Variante,
): string {
  const preco = variante
    ? formatarPreco(variante.preco)
    : !produtoTemVariantes(produto) && produto.precoMaximo
      ? formatarFaixaPreco(produto.preco, produto.precoMaximo)
      : formatarPreco(menorPreco(produto));
  const opcao = variante ? ` — ${variante.descricao}` : "";
  const observacao = produto.sobMedida ? " (valor base)" : "";
  const mensagem = `Olá! Gostaria de encomendar *${produto.nome}*${opcao} — ${preco}${observacao}.`;

  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export function caminhoPublico(caminho: string): string {
  const base = import.meta.env?.BASE_URL ?? "/";
  const prefixo = base.endsWith("/") ? base : `${base}/`;
  return `${prefixo}${caminho.replace(/^\/+/, "")}`;
}

export function caminhoImagem(caminho: string): string {
  return caminhoPublico(`imagens/${caminho}`);
}
