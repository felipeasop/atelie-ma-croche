import { readdir, rename, stat, unlink } from "node:fs/promises";
import { extname, join } from "node:path";
import sharp from "sharp";

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
const EXTENSOES = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);
const ARQUIVOS_RAIZ = new Set(["logo.png", "whatsapp.png"]);

async function listarArquivos() {
  const arquivos = [];
  for (const entrada of await readdir(ROOT, { withFileTypes: true })) {
    if (entrada.isFile() && ARQUIVOS_RAIZ.has(entrada.name)) {
      arquivos.push(join(ROOT, entrada.name));
      continue;
    }
    if (!entrada.isDirectory() || !CATEGORIAS.includes(entrada.name)) continue;
    for (const item of await readdir(join(ROOT, entrada.name), { withFileTypes: true })) {
      if (item.isFile()) arquivos.push(join(ROOT, entrada.name, item.name));
    }
  }
  return arquivos.filter((arquivo) => EXTENSOES.has(extname(arquivo).toLowerCase()));
}

async function processar(arquivo) {
  const original = await stat(arquivo);
  const extensao = extname(arquivo).toLowerCase();
  const temporario = `${arquivo}.otimizado`;
  const imagem = sharp(arquivo).rotate();

  if (extensao === ".jpeg" || extensao === ".jpg") {
    await imagem.jpeg({ quality: 82, progressive: true, mozjpeg: true }).toFile(temporario);
  } else if (extensao === ".png") {
    await imagem.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(temporario);
  } else if (extensao === ".webp") {
    await imagem.webp({ quality: 82, effort: 5 }).toFile(temporario);
  } else if (extensao === ".avif") {
    await imagem.avif({ quality: 55, effort: 5 }).toFile(temporario);
  } else {
    return null;
  }

  const otimizado = await stat(temporario);
  if (otimizado.size < original.size) {
    await rename(temporario, arquivo);
    return { antes: original.size, depois: otimizado.size };
  }

  await unlink(temporario);
  return { antes: original.size, depois: original.size };
}

function formatarBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

let totalAntes = 0;
let totalDepois = 0;
let alteradas = 0;

for (const arquivo of await listarArquivos()) {
  const resultado = await processar(arquivo);
  if (!resultado) continue;
  totalAntes += resultado.antes;
  totalDepois += resultado.depois;
  if (resultado.depois < resultado.antes) {
    alteradas += 1;
    console.log(`${arquivo}: ${formatarBytes(resultado.antes)} → ${formatarBytes(resultado.depois)}`);
  }
}

const economia = totalAntes === 0 ? 0 : ((1 - totalDepois / totalAntes) * 100).toFixed(1);
console.log(`\n${alteradas} imagens otimizadas. Economia: ${economia}% (${formatarBytes(totalAntes - totalDepois)}).`);
