export function inicializarFallbacks(): void {
  document.querySelectorAll<HTMLImageElement>(".card-img").forEach((img) => {
    const wrap = img.closest<HTMLElement>(".card-img-wrap");
    if (!wrap) return;
    const marcar = () => wrap.classList.add("loaded");
    if (img.complete && img.naturalWidth > 0) marcar();
    else img.addEventListener("load", marcar);
  });
}
