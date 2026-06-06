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

// --- Mude apenas a definição do 'Meta' ---
type Meta = {
  nome?: string;
  preco?: number;
  descricao?: string;
  itens?: string[]; // Adicionado
  tamanho?: string; // Adicionado
};

const meta: Record<string, Meta> = metadados;

// Glob de todas as imagens por categoria
const arquivos = import.meta.glob<string>(
  "/public/imagens/**/*.{jpeg,jpg,png,webp}",
  { eager: true, query: "?url", import: "default" },
);

// ==========================================
// FUNÇÕES UTILITÁRIAS (HELPERS)
// ==========================================
function slugBase(nomeArquivo: string): string {
  return nomeArquivo
    .replace(/\.[^.]+$/, "") // remove extensão
    .replace(/-\d+$/, ""); // remove -2, -3, etc.
}

// Melhora a formatação e respeita conectores em minúsculo
function slugParaNome(slug: string): string {
  const conectores = ["de", "com", "para", "em", "do", "da", "o", "a", "e"];
  return slug
    .split("-")
    .map((palavra, index) => {
      // Se for um conector e não for a primeira palavra, mantém minúscula
      if (index > 0 && conectores.includes(palavra.toLowerCase())) {
        return palavra.toLowerCase();
      }
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(" ");
}

// ==========================================
// PROCESSAMENTO DOS DADOS
// ==========================================
const grupos = new Map<string, { categoria: Categoria; imagens: string[] }>();

for (const caminho of Object.keys(arquivos)) {
  const partes = caminho.split("/");
  const categoria = partes.at(-2) as Categoria;
  const arquivo = partes.at(-1)!;
  const slug = slugBase(arquivo);
  const chave = `${categoria}/${slug}`;

  if (!grupos.has(chave)) {
    grupos.set(chave, { categoria, imagens: [] });
  }

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
      nome: m.nome ?? slugParaNome(slug),
      preco: m.preco ?? 0,
      categoria,
      imagens: imagens.sort(),
      sob_medida: categoria === "roupa",
      itens: m.itens ?? [],
      tamanho: m.tamanho ?? "",
    };
  },
);
