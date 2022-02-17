import "../src/css/style.css";
import "./renderStats.ts"

const justEatBtn = document.querySelector<HTMLButtonElement>("#btn-just-eat")!;
const infoBtn = document.querySelector<HTMLLinkElement>("#btn-info")!;
const configBtn = document.querySelector<HTMLLinkElement>("#btn-config")!;

const modalOK = document.querySelector<HTMLButtonElement>("#modal-btn-okay")!;
const modalOK2 = document.querySelector<HTMLButtonElement>(
  "#modal-btn-alsookay"
)!;

function hideModal() {
  const modal = document.querySelector<HTMLDivElement>("#modal")!;
  modal.classList.add("hidden");
}

function showModal() {
  const modal = document.querySelector<HTMLDivElement>("#modal")!;
  modal.classList.remove("hidden");
}

hideModal();

modalOK.onclick = hideModal;
modalOK2.onclick = hideModal;

justEatBtn.onclick = showModal;
infoBtn.onclick = showModal;
configBtn.onclick = showModal;
