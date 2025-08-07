import { splitTextIntoPages, cleanText } from "./utils.js";
import { saveProgress, loadProgress } from "./storage.js";
import { playSoundForKey } from "./audio.js";
import {
  translateWord,
  showTranslation,
  hideTranslation,
  updateCurrentWord,
  resetCurrentWord,
} from "./translation.js";

const hiddenInput = document.getElementById("hiddenInput");
const textDisplay = document.getElementById("textDisplay");
const stats = document.getElementById("stats");
const pageNumberEl = document.getElementById("pageNumber");
const totalPagesEl = document.getElementById("totalPages");
const pageImage = document.getElementById("pageImage");

let typingStartTime = null;
let currentKey = "";
let fullText = "";
let pages = [];
let currentPage = 0;
let userInputs = {}; // pageIndex -> string

function generateImagePrompt(text) {
  return `illustration for: ${text}`;
}

function getPollinationsImage(prompt) {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}`;
}


function startTyping(key, rawText) {

export function startTyping(key, rawText) {

  currentKey = key;
  fullText = cleanText(rawText);
  pages = splitTextIntoPages(fullText);

  if (pages.length === 0) {
    alert("Файл пустой или содержит слишком мало текста.");
    return;
  }

  const { page, inputs } = loadProgress(key);
  currentPage = Math.min(page, pages.length - 1);
  userInputs = inputs || {};
  typingStartTime = null;
  updateDisplay();
}


function updateDisplay() {

export function updateDisplay() {

  if (currentPage < 0 || currentPage >= pages.length) return;

  const expected = pages[currentPage];
  const typed = userInputs[currentPage] || "";
  let html = "";
  let correct = 0;

  for (let i = 0; i < expected.length; i++) {
    const t = typed[i];
    const c = expected[i];
    const displayChar = c === "\n" ? " " : c;

    if (t == null) {
      html += html.includes('class="active"')
        ? displayChar
        : `<span class="active">${displayChar}</span>`;
    } else if (c === "\n") {
      html += `<span class="correct">⏎</span>`;
      correct++;
    } else if (t === c) {
      html += `<span class="correct">${displayChar}</span>`;
      correct++;
    } else {
      html += `<span class="incorrect">${displayChar}</span>`;
    }
  }

  textDisplay.innerHTML = html;

  // Статистика
  const now = Date.now();
  let wpm = 0;
  if (typingStartTime && typed.length > 0) {
    const minutes = (now - typingStartTime) / 60000;
    const words = typed.trim().split(/\s+/).filter(Boolean).length;
    wpm = minutes > 0 ? Math.round(words / minutes) : 0;
  }

  stats.textContent = `Символов: ${typed.length} | Ошибок: ${
    typed.length - correct
  } | Скорость: ${wpm || "—"} WPM`;
  pageNumberEl.textContent = currentPage + 1;
  totalPagesEl.textContent = pages.length;
  pageImage.src = getPollinationsImage(generateImagePrompt(expected));
}

// Ввод текста и перевод
hiddenInput.addEventListener("keydown", async (e) => {
  playSoundForKey(e);

  const expected = pages[currentPage];
  if (!expected) return;

  let typed = userInputs[currentPage] || "";

  if (!typingStartTime && typed.length === 0) {
    typingStartTime = Date.now();
  }

  if (e.key === "Backspace") {
    typed = typed.slice(0, -1);
    userInputs[currentPage] = typed;
    updateDisplay();
    saveProgress(currentKey, { page: currentPage, inputs: userInputs });
    resetCurrentWord();
    hideTranslation();
    return;
  }

  if (e.key === " ") {
    typed += " ";
    userInputs[currentPage] = typed;
    updateDisplay();
    saveProgress(currentKey, { page: currentPage, inputs: userInputs });
    resetCurrentWord();
    hideTranslation();
    return;
  }

  if (e.key.length === 1 && /\S/.test(e.key)) {
    typed += e.key;
    userInputs[currentPage] = typed;
    updateDisplay();
    saveProgress(currentKey, { page: currentPage, inputs: userInputs });

    const nextChar = expected[typed.length];
    const word = updateCurrentWord(e.key);
    const isWordFinished = !nextChar || /\s/.test(nextChar);

    if (isWordFinished && word.length > 1) {
      const translation = await translateWord(word);
      const spans = textDisplay.querySelectorAll("span.correct, span.active");

      const lastSpan = spans[spans.length - 1];

      const lastSpan = spans[typed.length - 1];

      if (translation && lastSpan) {
        const rect = lastSpan.getBoundingClientRect();
        showTranslation(translation, rect);
      }
    }

    if (typed.length === expected.length && currentPage < pages.length - 1) {
      currentPage++;
      resetCurrentWord();
      hideTranslation();
      updateDisplay();
      saveProgress(currentKey, { page: currentPage, inputs: userInputs });
      hiddenInput.focus();
    }
  }
});


export { startTyping, updateDisplay };


