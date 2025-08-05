import {
  translateWord,
  showTranslation,
  hideTranslation,
  resetCurrentWord,
  updateCurrentWord,
} from "./translation.js";

import { cleanText, splitTextIntoPages, charactersPerPage } from "./utils.js";

import {
  saveProgress,
  loadProgress,
  saveText,
  loadText,
  listSavedTexts,
} from "./storage.js";

import { playSoundForKey } from "./audio.js";
import { startTyping, updateDisplay } from "./typing.js";

const fileInput = document.getElementById("fileInput");
const savedTexts = document.getElementById("savedTexts");
const loadSavedBtn = document.getElementById("loadSaved");
const backBtn = document.getElementById("backBtn");
const pageInput = document.getElementById("pageInput");
const goToPage = document.getElementById("goToPage");

const homeScreen = document.getElementById("homeScreen");
const typingScreen = document.getElementById("typingScreen");
const hiddenInput = document.getElementById("hiddenInput");
const resetBtn = document.getElementById("resetProgressBtn");

function updateSavedTextsList() {
  savedTexts.innerHTML = "<option disabled selected>Выберите...</option>";
  listSavedTexts().forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    savedTexts.appendChild(opt);
  });
}

function showTypingScreen() {
  homeScreen.classList.add("hidden");
  typingScreen.classList.remove("hidden");
  hiddenInput.focus();
}

function showHomeScreen() {
  typingScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  updateSavedTextsList();
}

goToPage.addEventListener("click", () => {
  const n = parseInt(pageInput.value);
  if (!isNaN(n)) {
    window.currentPage = Math.max(0, Math.min(n - 1, window.pages.length - 1));
    updateDisplay();
    saveProgress(window.currentKey, {
      page: window.currentPage,
      inputs: window.userInputs,
    });
    hiddenInput.focus();
  }
});

pageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") goToPage.click();
});

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const key = file.name;
  saveText(key, text);
  startTyping(key, text);
  showTypingScreen();
});

loadSavedBtn.addEventListener("click", () => {
  const key = savedTexts.value;
  const text = loadText(key);
  if (text) {
    startTyping(key, text);
    showTypingScreen();
  }
});

backBtn.addEventListener("click", () => {
  saveProgress(window.currentKey, {
    page: window.currentPage,
    inputs: window.userInputs,
  });
  showHomeScreen();
});

resetBtn.addEventListener("click", () => {
  if (!window.currentKey) return;
  const confirmed = confirm("Сбросить прогресс и начать заново?");
  if (confirmed) {
    localStorage.removeItem("progress_" + window.currentKey);
    window.userInputs = {};
    window.currentPage = 0;
    updateDisplay();
    saveProgress(window.currentKey, {
      page: 0,
      inputs: {},
    });
    hiddenInput.focus();
  }
});

updateSavedTextsList();
