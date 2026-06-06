export type Categoria =
  | "cozinha"
  | "banheiro"
  | "mesa"
  | "decoracao"
  | "roupa"
  | "chaveiro"
  | "acessorio";

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: Categoria;
  imagens: string[];
  sob_medida: boolean;
  itens?: string[];
  tamanho?: string;
}

export interface ConfigSite {
  nomeAtelie: string;
  /** DDI+DDD+número sem espaços, ex: "5541999999999" */
  whatsapp: string;
  instagram?: string;
  descricaoSite: string;
}

export const CATEGORIAS_ORDEM: Categoria[] = [
  "cozinha",
  "mesa",
  "banheiro",
  "decoracao",
  "roupa",
  "chaveiro",
  "acessorio",
];

export const LABELS: Record<Categoria, string> = {
  cozinha: "Cozinha",
  banheiro: "Banheiro",
  mesa: "Mesa",
  decoracao: "Decoração",
  roupa: "Roupa",
  acessorio: "Acessório",
  chaveiro: "Chaveiro",
};

export const ICONES: Record<Categoria, string> = {
  banheiro: "🛁",
  cozinha: "☕",
  mesa: "🍽️",
  decoracao: "🌸",
  roupa: "🧶",
  acessorio: "👜",
  chaveiro: "🔑",
};
