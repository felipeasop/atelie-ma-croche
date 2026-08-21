export function iniciarAnimacoes(): void {
  const cards = document.querySelectorAll<HTMLElement>(".card");
  if (!("IntersectionObserver" in window)) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("is-visible");
        observador.unobserve(entrada.target);
      });
    },
    { rootMargin: "0px 0px -30px", threshold: 0.08 },
  );

  cards.forEach((card) => {
    card.classList.add("is-reveal-pending");
    observador.observe(card);
  });
}
