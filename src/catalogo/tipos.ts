export const CATEGORIAS = [
  "cozinha",
  "mesa",
  "banheiro",
  "tapetes",
  "decoracao",
  "roupa",
  "chaveiro",
  "acessorio",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export interface DefinicaoCategoria {
  nome: string;
  icone: string;
}

export const CATEGORIAS_ORDEM: readonly Categoria[] = [
  "cozinha",
  "mesa",
  "banheiro",
  "tapetes",
  "decoracao",
  "roupa",
  "chaveiro",
  "acessorio",
];

export const CATEGORIAS_INFO: Record<Categoria, DefinicaoCategoria> = {
  cozinha: { nome: "Cozinha", icone: "☕" },
  mesa: { nome: "Mesa", icone: "🍽️" },
  banheiro: { nome: "Banheiro", icone: "🛁" },
  tapetes: { nome: "Tapetes", icone: "🧶" },
  decoracao: { nome: "Decoração", icone: "🌸" },
  roupa: { nome: "Roupas", icone: "👚" },
  chaveiro: { nome: "Chaveiros", icone: "🔑" },
  acessorio: { nome: "Acessórios", icone: "👜" },
};

export interface Componente {
  nome: string;
  quantidade?: number;
}

export interface Variante {
  descricao: string;
  preco: number;
  componentes?: Componente[];
}

interface ProdutoBase {
  id: string;
  slug: string;
  nome: string;
  categoria: Categoria;
  imagens: string[];
  descricao?: string;
  medidas?: string;
  sobMedida: boolean;
  corPersonalizavel: boolean;
}

export interface ProdutoPrecoFixo extends ProdutoBase {
  preco: number;
  precoMaximo?: number;
  componentes?: Componente[];
  variantes?: never;
}

export interface ProdutoComVariantes extends ProdutoBase {
  variantes: Variante[];
  preco?: never;
  componentes?: never;
}

export type Produto = ProdutoPrecoFixo | ProdutoComVariantes;

export function produtoTemVariantes(
  produto: Produto,
): produto is ProdutoComVariantes {
  return "variantes" in produto;
}
