const CHAVE_TEMA = "atelie-tema";

type Tema = "dark" | "light";

function temaAtual(): Tema {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function aplicarTema(tema: Tema): void {
  document.documentElement.dataset.theme = tema;
  const botao = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  const icone = botao?.querySelector<HTMLElement>("[data-theme-icon]");
  const escuro = tema === "dark";

  if (botao) botao.ariaLabel = escuro ? "Usar tema claro" : "Usar tema escuro";
  if (icone) icone.textContent = escuro ? "☀️" : "🌙";
}

export function iniciarTema(): void {
  aplicarTema(temaAtual());

  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    const novoTema: Tema = temaAtual() === "dark" ? "light" : "dark";
    aplicarTema(novoTema);
    localStorage.setItem(CHAVE_TEMA, novoTema);
  });
}
