export function iniciarNavegacaoCategorias(): void {
  if (!("IntersectionObserver" in window)) return;

  const links = new Map(
    [...document.querySelectorAll<HTMLAnchorElement>("[data-category-link]")].map(
      (link) => [link.hash.slice(1), link],
    ),
  );
  const secoes = document.querySelectorAll<HTMLElement>("[data-category-section]");

  const ativar = (id: string): void => {
    links.forEach((link, chave) => {
      const ativo = chave === id;
      link.classList.toggle("is-active", ativo);
      if (ativo) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const observador = new IntersectionObserver(
    (entradas) => {
      const visivel = entradas
        .filter((entrada) => entrada.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visivel?.target.id) ativar(visivel.target.id);
    },
    { rootMargin: "-22% 0px -62%", threshold: [0, 0.15, 0.35] },
  );

  secoes.forEach((secao) => observador.observe(secao));
}
