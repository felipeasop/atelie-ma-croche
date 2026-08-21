import catalogoRaw from "./catalogo.json";
import { validarCatalogo, type ProdutoMeta } from "./schema.ts";
import {
  CATEGORIAS,
  CATEGORIAS_ORDEM,
  type Categoria,
  type Produto,
} from "./tipos.ts";

const catalogo = validarCatalogo(catalogoRaw);

const arquivos = import.meta.glob<string>(
  "/public/imagens/*/*.{avif,gif,jpeg,jpg,png,webp}",
  { eager: true, query: "?url", import: "default" },
);

interface GrupoImagens {
  categoria: Categoria;
  slug: string;
  imagens: string[];
}

function categoriaValida(valor: string): valor is Categoria {
  return CATEGORIAS.some((categoria) => categoria === valor);
}

function decomporArquivo(caminho: string): {
  categoria: Categoria;
  arquivo: string;
  slug: string;
} {
  const partes = caminho.split("/");
  const categoria = partes.at(-2) ?? "";
  const arquivo = partes.at(-1) ?? "";

  if (!categoriaValida(categoria)) {
    throw new Error(`Categoria desconhecida na imagem: ${caminho}`);
  }

  const slug = arquivo.replace(/\.[^.]+$/, "").replace(/-\d+$/, "");
  return { categoria, arquivo, slug };
}

function indiceDaImagem(caminho: string): number {
  const nome = caminho.replace(/\.[^.]+$/, "");
  const sufixo = nome.match(/-(\d+)$/)?.[1];
  return sufixo ? Number(sufixo) : 0;
}

function compararImagens(a: string, b: string): number {
  return indiceDaImagem(a) - indiceDaImagem(b) || a.localeCompare(b, "pt-BR");
}

function listarMetadados(): Map<string, ProdutoMeta> {
  const itens = new Map<string, ProdutoMeta>();

  for (const categoria of CATEGORIAS) {
    for (const [slug, metadado] of Object.entries(catalogo[categoria])) {
      itens.set(`${categoria}/${slug}`, metadado);
    }
  }

  return itens;
}

function agruparImagens(): Map<string, GrupoImagens> {
  const grupos = new Map<string, GrupoImagens>();

  for (const caminho of Object.keys(arquivos)) {
    const { categoria, slug } = decomporArquivo(caminho);
    const id = `${categoria}/${slug}`;
    const imagem = caminho.replace("/public/imagens/", "");
    const grupo = grupos.get(id) ?? { categoria, slug, imagens: [] };

    grupo.imagens.push(imagem);
    grupos.set(id, grupo);
  }

  return grupos;
}

function validarCorrespondencia(
  metadados: ReadonlyMap<string, ProdutoMeta>,
  imagens: ReadonlyMap<string, GrupoImagens>,
): void {
  const semImagem = [...metadados.keys()].filter((id) => !imagens.has(id));
  const semMetadado = [...imagens.keys()].filter((id) => !metadados.has(id));

  if (semImagem.length === 0 && semMetadado.length === 0) return;

  const erros = [
    ...semImagem.map((id) => `  • metadado sem imagem: ${id}`),
    ...semMetadado.map((id) => `  • imagem sem metadado: ${id}`),
  ];

  throw new Error(`\nCatálogo e imagens não correspondem:\n${erros.join("\n")}\n`);
}

const metadados = listarMetadados();
const imagens = agruparImagens();
validarCorrespondencia(metadados, imagens);

const ordemCategoria = new Map(
  CATEGORIAS_ORDEM.map((categoria, indice) => [categoria, indice]),
);

export const PRODUTOS: Produto[] = [...imagens.entries()]
  .map(([id, grupo]) => {
    const meta = metadados.get(id)!;
    const base = {
      id,
      slug: grupo.slug,
      nome: meta.nome,
      categoria: grupo.categoria,
      imagens: grupo.imagens.sort(compararImagens),
      descricao: meta.descricao,
      medidas: meta.medidas,
      sobMedida: meta.sobMedida ?? false,
      corPersonalizavel: meta.corPersonalizavel ?? true,
    };

    return meta.variantes
      ? { ...base, variantes: meta.variantes }
      : { ...base, preco: meta.preco!, componentes: meta.componentes };
  })
  .sort(
    (a, b) =>
      ordemCategoria.get(a.categoria)! - ordemCategoria.get(b.categoria)! ||
      a.nome.localeCompare(b.nome, "pt-BR"),
  );
