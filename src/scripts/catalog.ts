import type { Produto } from "../data/types";
import { abrirModal, initModal } from "../components/Modal/modal";
import { animarCards } from "./modules/animations";
import { inicializarFallbacks } from "./modules/fallbacks";
import { initTheme } from "./modules/theme";

interface AppConfig {
  whatsapp: string;
}

export function initCatalog(): void {
  const appData = document.getElementById("app-data");
  if (!appData) return;

  const produtos: Produto[] = JSON.parse(appData.dataset.produtos ?? "[]");
  const config: AppConfig = JSON.parse(appData.dataset.config ?? "{}");

  // Cards → abre modal ao clicar
  document.querySelectorAll<HTMLElement>(".card").forEach((card) => {
    const produto = produtos.find((p) => p.id === Number(card.dataset.id));
    if (!produto) return;

    const abrir = () => abrirModal(produto, config.whatsapp);
    card.addEventListener("click", abrir);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir();
      }
    });
  });

  // Botão "Encomendar" no card — abre WhatsApp direto sem modal
  document.querySelectorAll<HTMLButtonElement>(".btn-order").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const link = btn.dataset.wpp;
      if (link) window.open(link, "_blank");
    });
  });

  initModal();
  animarCards();
  inicializarFallbacks();
  initTheme();
}
