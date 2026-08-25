import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const ROOT = "public/imagens";
const CATEGORIAS = [
  "cozinha",
  "mesa",
  "banheiro",
  "tapetes",
  "decoracao",
  "roupa",
  "chaveiro",
  "acessorio",
];
const EXTENSOES = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const ASSETS_RAIZ = new Set(["logo.png", "whatsapp.png"]);
const TAMANHO_MINIMO = 300;
const TAMANHO_MAXIMO = 2 * 1024 * 1024;

function dimensoesJpeg(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marcador = buffer[offset + 1];
    offset += 2;
    if (marcador === 0xd9 || marcador === 0xda) break;
    if (marcador >= 0xd0 && marcador <= 0xd7) continue;
    if (offset + 2 > buffer.length) break;

    const tamanho = buffer.readUInt16BE(offset);
    const ehSof = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marcador);
    if (ehSof && offset + 7 < buffer.length) {
      return { width: buffer.readUInt16BE(offset + 5), height: buffer.readUInt16BE(offset + 3) };
    }
    offset += tamanho;
  }

  return null;
}

function dimensoes(buffer) {
  if (buffer.length >= 24 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.length >= 10 && (buffer.subarray(0, 6).toString() === "GIF89a" || buffer.subarray(0, 6).toString() === "GIF87a")) {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }
  if (buffer.length >= 30 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") {
    if (buffer.subarray(12, 16).toString() === "VP8X") {
      return {
        width: 1 + buffer[24] + (buffer[25] << 8) + (buffer[26] << 16),
        height: 1 + buffer[27] + (buffer[28] << 8) + (buffer[29] << 16),
      };
    }
  }
  const ispe = buffer.indexOf(Buffer.from("ispe"));
  if (ispe >= 0 && ispe + 16 <= buffer.length) {
    return { width: buffer.readUInt32BE(ispe + 8), height: buffer.readUInt32BE(ispe + 12) };
  }
  return dimensoesJpeg(buffer);
}

function slugDaImagem(nome) {
  return nome.replace(/\.[^.]+$/, "").replace(/-\d+$/, "");
}

async function carregarCatalogo() {
  const catalogo = Object.fromEntries(CATEGORIAS.map((categoria) => [categoria, {}]));

  for (const categoria of CATEGORIAS) {
    const pasta = join("src/content/produtos", categoria);
    let entradas;
    try {
      entradas = await readdir(pasta, { withFileTypes: true });
    } catch (erro) {
      if (erro.code === "ENOENT") continue;
      throw erro;
    }

    for (const entrada of entradas) {
      if (!entrada.isFile() || extname(entrada.name) !== ".json") continue;
      const slug = entrada.name.replace(/\.json$/, "");
      catalogo[categoria][slug] = JSON.parse(await readFile(join(pasta, entrada.name), "utf8"));
    }
  }

  return catalogo;
}

const catalogo = await carregarCatalogo();
const erros = [];
const produtosComImagem = new Set();

async function validarArquivo(caminho, relativo, exigirProduto) {
  const extensao = extname(caminho).toLowerCase();
  if (!EXTENSOES.has(extensao)) {
    erros.push(`${relativo}: extensão não permitida`);
    return;
  }

  const buffer = await readFile(caminho);
  if (buffer.length > TAMANHO_MAXIMO) {
    erros.push(`${relativo}: arquivo maior que 2 MB`);
  }

  const tamanho = dimensoes(buffer);
  if (!tamanho) {
    erros.push(`${relativo}: formato não reconhecido ou dimensões ilegíveis`);
  } else if (tamanho.width < TAMANHO_MINIMO || tamanho.height < TAMANHO_MINIMO) {
    erros.push(`${relativo}: ${tamanho.width}×${tamanho.height}, mínimo ${TAMANHO_MINIMO}×${TAMANHO_MINIMO}`);
  }

  if (exigirProduto) {
    const categoria = relativo.split("/")[1];
    const nome = relativo.split("/").at(-1);
    const slug = slugDaImagem(nome);
    const id = `${categoria}/${slug}`;
    if (!catalogo[categoria] || !catalogo[categoria][slug]) {
      erros.push(`${relativo}: não existe produto correspondente em src/content/produtos`);
    } else {
      produtosComImagem.add(id);
    }
  }
}

const entradasRaiz = await readdir(ROOT, { withFileTypes: true });
for (const entrada of entradasRaiz) {
  if (entrada.isFile()) {
    if (!ASSETS_RAIZ.has(entrada.name)) {
      erros.push(`${relative("public", join(ROOT, entrada.name))}: arquivo de interface não reconhecido`);
    } else {
      await validarArquivo(join(ROOT, entrada.name), join("imagens", entrada.name), false);
    }
  } else if (!CATEGORIAS.includes(entrada.name)) {
    erros.push(`${join(ROOT, entrada.name)}: categoria desconhecida`);
  }
}

for (const categoria of CATEGORIAS) {
  const pasta = join(ROOT, categoria);
  let entradas;
  try {
    entradas = await readdir(pasta, { withFileTypes: true });
  } catch (erro) {
    if (erro.code === "ENOENT" && Object.keys(catalogo[categoria] ?? {}).length === 0) continue;
    erros.push(`${pasta}: pasta da categoria não encontrada`);
    continue;
  }
  for (const entrada of entradas) {
    const caminho = join(pasta, entrada.name);
    const relativo = join("imagens", categoria, entrada.name);
    if (!entrada.isFile()) {
      erros.push(`${relativo}: subpastas não são permitidas`);
      continue;
    }
    await validarArquivo(caminho, relativo, true);
  }

  for (const slug of Object.keys(catalogo[categoria] ?? {})) {
    if (!produtosComImagem.has(`${categoria}/${slug}`)) {
      erros.push(`${categoria}/${slug}: produto sem imagem correspondente`);
    }
  }
}

if (erros.length > 0) {
  console.error("\nImagens inválidas:\n" + erros.map((erro) => `  • ${erro}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Imagens válidas: formatos, dimensões, tamanho e catálogo conferidos.");
}
