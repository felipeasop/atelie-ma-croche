const STORAGE_KEY = "tema";
const ATTR = "data-theme";

function aplicarTema(escuro: boolean): void {
  document.documentElement.setAttribute(ATTR, escuro ? "dark" : "light");
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = escuro ? "☀️" : "🌙";
}

export function initTheme(): void {
  const escuro = localStorage.getItem(STORAGE_KEY) === "dark";
  aplicarTema(escuro);

  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const novoEscuro = document.documentElement.getAttribute(ATTR) !== "dark";
    aplicarTema(novoEscuro);
    localStorage.setItem(STORAGE_KEY, novoEscuro ? "dark" : "light");
  });
}
