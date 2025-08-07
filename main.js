import { splitTextIntoPages, cleanText } from "./utils.js";
import {
  saveProgress,
  loadProgress,
  saveText,
  loadText,
  listSavedTexts,
} from "./storage.js";
import { initAudio, playSoundForKey } from "./audio.js";

document.addEventListener("DOMContentLoaded", () => {
  initAudio();
});

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
const fileInput = document.getElementById("fileInput");
const savedTextsSelect = document.getElementById("savedTexts");
const loadSavedButton = document.getElementById("loadSaved");

let typingStartTime = null;
let currentKey = "";
let fullText = "";
let pages = [];
let currentPage = 0;
let userInputs = {};

function generateImagePrompt(text) {
  return `illustration for: ${text}`;
}

function getPollinationsImage(prompt) {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}`;
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result;
    const name = file.name;
    saveText(name, text);
    updateSavedTexts();
    savedTextsSelect.value = name;
    startTyping(name, text);
  };
  reader.readAsText(file);
});

function updateSavedTexts() {
  const saved = listSavedTexts();
  savedTextsSelect.innerHTML = `<option disabled selected>Выберите...</option>`;
  saved.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    savedTextsSelect.appendChild(option);
  });
}

loadSavedButton.addEventListener("click", () => {
  const name = savedTextsSelect.value;
  if (!name || name === "Выберите...") {
    alert("Сначала выбери текст из списка.");
    return;
  }
  const text = loadText(name);
  if (!text) {
    alert("Не удалось загрузить текст.");
    return;
  }
  startTyping(name, text);
});

function startTyping(key, rawText) {
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
  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("typingScreen").classList.remove("hidden");
  updateDisplay();
}

function updateDisplay() {
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

updateSavedTexts();
