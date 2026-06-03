import type { Produto, ConfigSite } from "./types";

export const CONFIG: ConfigSite = {
  nomeAtelie: "Ateliê Ma-Crochê",
  whatsapp: "554399792859", // ex: "5541999999999"
  instagram: "", // ex: "@atelie.ma.croche"
  descricaoSite:
    "Peças artesanais de crochê feitas à mão com carinho. Tapetes, jogos de banheiro, decoração e muito mais.",
};

// ─────────────────────────────────────────────────────────────
//  PRODUTOS
//  - "imagens" aceita quantas fotos quiser
//  - a primeira foto é a capa do card
//  - todas aparecem no carrossel do modal
// ─────────────────────────────────────────────────────────────
export const PRODUTOS_BASE: Omit<Produto, "id">[] = [
  {
    nome: "Lorem Ipsum Dolor",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    preco: 85,
    categoria: "banheiro",
    imagens: ["banheiro/tapete-redondo.jpg", "banheiro/tapete-redondo-2.jpg"],
    cor_personalizavel: true,
    sob_medida: true,
  },
  {
    nome: "Top Mosaico",
    descricao: "",
    preco: 0,
    categoria: "roupa",
    imagens: [
      "roupa/top-mosaico.jpeg",
      "roupa/top-mosaico-2.jpeg",
      "roupa/top-mosaico-3.jpeg",
    ],
    cor_personalizavel: true,
    sob_medida: true,
  },
  {
    nome: "Shorts de Crochê",
    descricao: "",
    preco: 0,
    categoria: "roupa",
    imagens: ["roupa/shorts-de-croche.jpeg"],
    cor_personalizavel: false,
    sob_medida: false,
  },
  {
    nome: "Jogo de Cozinha Janice",
    descricao: "",
    preco: 0,
    categoria: "cozinha",
    imagens: [
      "cozinha/jogo-de-cozinha-janice.jpeg",
      "cozinha/jogo-de-cozinha-janice-2.jpeg",
      "cozinha/jogo-de-cozinha-janice-3.jpeg",
    ],
    cor_personalizavel: false,
    sob_medida: false,
  },
  {
    nome: "Trilho de Mesa Modelo Folha",
    descricao: "",
    preco: 0,
    categoria: "mesa",
    imagens: [
      "mesa/trilho-de-mesa-modelo-folha.jpeg",
      "mesa/trilho-de-mesa-modelo-folha-2.jpeg",
    ],
    cor_personalizavel: false,
    sob_medida: false,
  },
  {
    nome: "Bolsa Square de Corações",
    descricao: "",
    preco: 0,
    categoria: "acessorio",
    imagens: ["acessorio/bolsa-square-de-coracoes.jpeg"],
    cor_personalizavel: false,
    sob_medida: false,
  },
  {
    nome: "Bolsa de Ombro Coração",
    descricao: "",
    preco: 0,
    categoria: "acessorio",
    imagens: ["acessorio/bolsa-de-ombro-coracao.jpeg"],
    cor_personalizavel: false,
    sob_medida: false,
  },
];

export const PRODUTOS: Produto[] = PRODUTOS_BASE.map((produto, index) => ({
  id: index,
  ...produto,
}));
