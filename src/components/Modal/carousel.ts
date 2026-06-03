import { imgPath } from "../../utils/helpers";

interface CarrosselState {
  indice: number;
  total: number;
  track: HTMLElement;
  dots: HTMLElement[];
  btnPrev: HTMLButtonElement;
  btnNext: HTMLButtonElement;
}

export function criarCarrossel(
  imagens: string[],
  nomeAlt: string,
): { html: string; init: (root: HTMLElement) => void } {
  const slides = imagens
    .map(
      (img, i) => `
    <div class="carousel-slide">
      <img
        src="${imgPath(img)}"
        alt="${nomeAlt}${imagens.length > 1 ? ` — foto ${i + 1}` : ""}"
        loading="${i === 0 ? "eager" : "lazy"}"
      />
    </div>
  `,
    )
    .join("");

  const dots =
    imagens.length > 1
      ? `
    <div class="carousel-dots" role="tablist" aria-label="Navegar entre fotos">
      ${imagens
        .map(
          (_, i) => `
        <button
          class="carousel-dot${i === 0 ? " active" : ""}"
          role="tab"
          aria-label="Foto ${i + 1}"
          aria-selected="${i === 0}"
          data-dot="${i}"
        ></button>
      `,
        )
        .join("")}
    </div>
  `
      : "";

  const setas =
    imagens.length > 1
      ? `
    <button class="carousel-btn prev" aria-label="Foto anterior" hidden>‹</button>
    <button class="carousel-btn next" aria-label="Próxima foto">›</button>
  `
      : "";

  const html = `
    <div class="carousel" data-carousel>
      <div class="carousel-track">${slides}</div>
      ${setas}
      ${dots}
    </div>
  `;

  function init(root: HTMLElement): void {
    const el = root.querySelector<HTMLElement>("[data-carousel]");
    if (!el || imagens.length <= 1) return;

    const track = el.querySelector<HTMLElement>(".carousel-track")!;
    const dotEls = Array.from(
      el.querySelectorAll<HTMLElement>(".carousel-dot"),
    );
    const btnPrev = el.querySelector<HTMLButtonElement>(".carousel-btn.prev")!;
    const btnNext = el.querySelector<HTMLButtonElement>(".carousel-btn.next")!;

    const state: CarrosselState = {
      indice: 0,
      total: imagens.length,
      track,
      dots: dotEls,
      btnPrev,
      btnNext,
    };

    function ir(novoIndice: number): void {
      state.indice = Math.max(0, Math.min(novoIndice, state.total - 1));
      state.track.style.transform = `translateX(-${state.indice * 100}%)`;
      state.dots.forEach((d, i) => {
        d.classList.toggle("active", i === state.indice);
        d.setAttribute("aria-selected", String(i === state.indice));
      });
      state.btnPrev.hidden = state.indice === 0;
      state.btnNext.hidden = state.indice === state.total - 1;
    }

    btnPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      ir(state.indice - 1);
    });
    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      ir(state.indice + 1);
    });
    dotEls.forEach((d, i) =>
      d.addEventListener("click", (e) => {
        e.stopPropagation();
        ir(i);
      }),
    );

    // Swipe
    let touchStartX = 0;
    el.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
    el.addEventListener("touchend", (e) => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40)
        ir(delta > 0 ? state.indice + 1 : state.indice - 1);
    });

    // Teclado
    el.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") ir(state.indice - 1);
      if (e.key === "ArrowRight") ir(state.indice + 1);
    });
  }

  return { html, init };
}
