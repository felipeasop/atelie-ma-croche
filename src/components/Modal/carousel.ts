import { caminhoImagem } from "../../catalogo/produto.ts";

function criarBotao(classe: string, rotulo: string, texto: string): HTMLButtonElement {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = classe;
  botao.setAttribute("aria-label", rotulo);
  botao.textContent = texto;
  return botao;
}

export function criarCarrossel(imagens: readonly string[], nome: string): HTMLElement {
  const carrossel = document.createElement("div");
  carrossel.className = "carousel";

  const trilho = document.createElement("div");
  trilho.className = "carousel-track";
  carrossel.append(trilho);

  imagens.forEach((caminho, indice) => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";

    const imagem = document.createElement("img");
    imagem.src = caminhoImagem(caminho);
    imagem.alt = imagens.length > 1 ? `${nome}, foto ${indice + 1}` : nome;
    imagem.loading = indice === 0 ? "eager" : "lazy";
    imagem.decoding = "async";
    slide.append(imagem);
    trilho.append(slide);
  });

  if (imagens.length <= 1) return carrossel;

  carrossel.tabIndex = 0;
  carrossel.setAttribute("aria-label", `Galeria de fotos de ${nome}`);

  const anterior = criarBotao("carousel-button carousel-prev", "Foto anterior", "‹");
  const proxima = criarBotao("carousel-button carousel-next", "Próxima foto", "›");
  const indicadores = document.createElement("div");
  indicadores.className = "carousel-dots";
  indicadores.setAttribute("aria-label", "Selecionar foto");

  const pontos = imagens.map((_, indice) => {
    const ponto = criarBotao("carousel-dot", `Mostrar foto ${indice + 1}`, "");
    indicadores.append(ponto);
    return ponto;
  });

  carrossel.append(anterior, proxima, indicadores);

  let indiceAtual = 0;
  const mostrar = (novoIndice: number): void => {
    indiceAtual = Math.max(0, Math.min(novoIndice, imagens.length - 1));
    trilho.style.transform = `translateX(-${indiceAtual * 100}%)`;
    anterior.disabled = indiceAtual === 0;
    proxima.disabled = indiceAtual === imagens.length - 1;
    pontos.forEach((ponto, indice) => {
      ponto.classList.toggle("is-active", indice === indiceAtual);
      ponto.setAttribute("aria-current", String(indice === indiceAtual));
    });
  };

  anterior.addEventListener("click", () => mostrar(indiceAtual - 1));
  proxima.addEventListener("click", () => mostrar(indiceAtual + 1));
  pontos.forEach((ponto, indice) =>
    ponto.addEventListener("click", () => mostrar(indice)),
  );

  carrossel.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowLeft") mostrar(indiceAtual - 1);
    if (evento.key === "ArrowRight") mostrar(indiceAtual + 1);
  });

  let toqueInicial = 0;
  carrossel.addEventListener(
    "touchstart",
    (evento) => {
      toqueInicial = evento.touches[0]?.clientX ?? 0;
    },
    { passive: true },
  );
  carrossel.addEventListener("touchend", (evento) => {
    const toqueFinal = evento.changedTouches[0]?.clientX ?? toqueInicial;
    const distancia = toqueInicial - toqueFinal;
    if (Math.abs(distancia) > 45) mostrar(indiceAtual + (distancia > 0 ? 1 : -1));
  });

  mostrar(0);
  return carrossel;
}
