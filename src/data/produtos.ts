import type { Produto, Categoria, ConfigSite } from "./types";
import metadados from "./produtos.json";

// ==========================================
// CONFIGURAÇÕES & TIPOS
// ==========================================
export const CONFIG: ConfigSite = {
  nomeAtelie: "Ateliê Ma-Crochê",
  whatsapp: "554399792859",
  instagram: "maely__croche",
  descricaoSite:
    "Peças artesanais de crochê feitas à mão com carinho. Tapetes, jogos de banheiro, decoração e muito mais.",
};

type Meta = { preco?: number; descricao?: string };
const meta: Record<string, Meta> = metadados;

// Glob de todas as imagens por categoria
const arquivos = import.meta.glob<string>(
  "/public/imagens/**/*.{jpeg,jpg,png,webp}",
  { eager: true, query: "?url", import: "default" },
);

// ==========================================
// FUNÇÕES UTILITÁRIAS (HELPERS)
// ==========================================
// Extrai slug base removendo sufixo numérico: "janice-2" → "janice"
function slugBase(nomeArquivo: string): string {
  return nomeArquivo
    .replace(/\.[^.]+$/, "") // remove extensão
    .replace(/-\d+$/, ""); // remove -2, -3, etc.
}

// "bolsa-bella" → "Bolsa Bella"
function slugParaNome(slug: string): string {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

// ==========================================
// PROCESSAMENTO DOS DADOS
// ==========================================
// Agrupa arquivos por categoria/slug
const grupos = new Map<string, { categoria: Categoria; imagens: string[] }>();

for (const caminho of Object.keys(arquivos)) {
  // caminho vira: /public/imagens/banheiro/jogo-flor.jpeg
  const partes = caminho.split("/");
  // partes: ["", "public", "imagens", "banheiro", "jogo-flor.jpeg"]
  const categoria = partes.at(-2) as Categoria;
  const arquivo = partes.at(-1)!;
  const slug = slugBase(arquivo);
  const chave = `${categoria}/${slug}`;

  if (!grupos.has(chave)) {
    grupos.set(chave, { categoria, imagens: [] });
  }

  // ✨ CORREÇÃO AQUI:
  // Em vez de remover apenas "/public", removemos "/public/imagens/"
  // O array agora vai guardar apenas "banheiro/jogo-flor.jpeg"
  const caminhoLimpo = caminho.replace("/public/imagens/", "");
  grupos.get(chave)!.imagens.push(caminhoLimpo);
}

// Monta o array final de produtos
export const PRODUTOS: Produto[] = [...grupos.entries()].map(
  ([chave, { categoria, imagens }], index) => {
    const slug = chave.split("/")[1];
    const m = meta[slug] ?? {};

    return {
      id: index,
      nome: slugParaNome(slug),
      descricao: m.descricao ?? "",
      preco: m.preco ?? 0,
      categoria,
      imagens: imagens.sort(), // ordem consistente: foto base antes das numeradas
      cor_personalizavel: true,
      sob_medida: categoria === "roupa",
    };
  },
);
