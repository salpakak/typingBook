const charactersPerPage = 500;

const fileInput = document.getElementById("fileInput");
const savedTexts = document.getElementById("savedTexts");
const loadSavedBtn = document.getElementById("loadSaved");
const backBtn = document.getElementById("backBtn");
const pageNumberEl = document.getElementById("pageNumber");
const totalPagesEl = document.getElementById("totalPages");
const pageInput = document.getElementById("pageInput");
const goToPage = document.getElementById("goToPage");

const homeScreen = document.getElementById("homeScreen");
const typingScreen = document.getElementById("typingScreen");

const hiddenInput = document.getElementById("hiddenInput");
const textDisplay = document.getElementById("textDisplay");
const stats = document.getElementById("stats");
const pageImage = document.getElementById("pageImage");

let currentKey = "";
let fullText = "";
let pages = [];
let currentPage = 0;
let userInputs = {}; // pageIndex -> string

function splitTextIntoPages(text) {
  const chunks = [];
  for (let i = 0; i < text.length; i += charactersPerPage) {
    chunks.push(text.slice(i, i + charactersPerPage));
  }
  return chunks;
}

function generateImagePrompt(text) {
  return `illustration for: ${text}`;
}

function getPollinationsImage(prompt) {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}`;
}

function updateSavedTextsList() {
  savedTexts.innerHTML = "<option disabled selected>Выберите...</option>";
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("text_")) {
      const name = key.slice(5);
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      savedTexts.appendChild(opt);
    }
  });
}

function updateDisplay() {
  if (currentPage < 0 || currentPage >= pages.length) return;
  const expected = pages[currentPage];
  if (!expected) return;

  const typed = userInputs[currentPage] || "";
  let html = "";
  let correct = 0;

  for (let i = 0; i < expected.length; i++) {
    const t = typed[i];
    const c = expected[i];

    // Заменяем перенос строки на пробел, чтобы не давал пустого пространства
    const displayChar = c === "\n" ? " " : c;

    if (t == null) {
      // Подсветим только первый непройденный символ
      if (!html.includes('class="active"')) {
        html += `<span class="active">${displayChar}</span>`;
      } else {
        html += displayChar;
      }
    } else if (t === c) {
      html += `<span class="correct">${displayChar}</span>`;
      correct++;
    } else {
      html += `<span class="incorrect">${displayChar}</span>`;
    }
  }

  textDisplay.innerHTML = html;
  stats.textContent = `Символов: ${typed.length} | Ошибок: ${
    typed.length - correct
  }`;
  pageNumberEl.textContent = currentPage + 1;
  totalPagesEl.textContent = pages.length;

  // AI-генерация изображения
  const prompt = generateImagePrompt(expected);
  pageImage.src = getPollinationsImage(prompt);

  pageInput.value = "";
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

function saveProgress() {
  if (!currentKey) return;
  const data = {
    page: currentPage,
    inputs: userInputs,
  };
  localStorage.setItem("progress_" + currentKey, JSON.stringify(data));
}

function loadProgress(key) {
  const data = localStorage.getItem("progress_" + key);
  if (!data) return { page: 0, inputs: {} };
  try {
    return JSON.parse(data);
  } catch {
    return { page: 0, inputs: {} };
  }
}

function startTyping(key, text) {
  currentKey = key;
  fullText = text;
  pages = splitTextIntoPages(fullText);
  if (pages.length === 0) {
    alert("Файл пустой или содержит слишком мало текста.");
    return;
  }
  const { page, inputs } = loadProgress(key);
  currentPage = Math.min(page, pages.length - 1);
  userInputs = inputs || {};
  updateDisplay();
  showTypingScreen();
  saveProgress();
}

// Ввод текста без автоперехода
hiddenInput.addEventListener("keydown", (e) => {
  const expected = pages[currentPage];
  if (!expected) return;

  let typed = userInputs[currentPage] || "";

  if (e.key === "Backspace") {
    userInputs[currentPage] = typed.slice(0, -1);
    updateDisplay();
    saveProgress();
    return;
  }

  if (e.key.length !== 1) return;
  if (typed.length >= expected.length) return;

  // Воспроизведение звука (если включено)
  try {
    keySound.currentTime = 0;
    keySound.play();
  } catch (e) {}

  typed += e.key;
  userInputs[currentPage] = typed;
  updateDisplay();
  saveProgress();

  // Автопереход только при завершении страницы ВПЕРВЫЕ
  if (typed.length === expected.length && currentPage < pages.length - 1) {
    // Страница только что была завершена — переходим вперёд
    currentPage++;
    updateDisplay();
    saveProgress();
    hiddenInput.focus();
  }
});

// Ручной переход к странице
goToPage.addEventListener("click", () => {
  const n = parseInt(pageInput.value);
  if (!isNaN(n) && n >= 1 && n <= pages.length) {
    currentPage = n - 1;
    updateDisplay();
    saveProgress();
    hiddenInput.focus();
  } else {
    alert("Введите корректный номер страницы от 1 до " + pages.length);
  }
});

// Переход по Enter в поле номера
pageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    goToPage.click();
  }
});

// Загрузка нового файла
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const key = file.name;
  localStorage.setItem("text_" + key, text);
  startTyping(key, text);
});

// Загрузка сохранённого текста
loadSavedBtn.addEventListener("click", () => {
  const key = savedTexts.value;
  const text = localStorage.getItem("text_" + key);
  if (text) startTyping(key, text);
});

// Вернуться на главную
backBtn.addEventListener("click", () => {
  saveProgress();
  showHomeScreen();
});

// Обработка фокуса
let isSelecting = false;

textDisplay.addEventListener("mousedown", () => {
  isSelecting = true;
});
textDisplay.addEventListener("mouseup", () => {
  setTimeout(() => (isSelecting = false), 300);
});
document.addEventListener("click", (e) => {
  const isPageInput = e.target === pageInput || pageInput.contains(e.target);
  if (!isSelecting && !isPageInput) {
    hiddenInput.focus();
  }
});

window.addEventListener("blur", () => hiddenInput.focus());
window.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    hiddenInput.focus();
  }
});

// Инициализация
updateSavedTextsList();
const resetBtn = document.getElementById("resetProgressBtn");

resetBtn.addEventListener("click", () => {
  if (!currentKey) return;

  const confirmed = confirm(
    "Вы уверены, что хотите сбросить прогресс и начать набор заново?"
  );
  if (confirmed) {
    // удаляем прогресс и вводы по текущему тексту
    localStorage.removeItem("progress_" + currentKey);
    userInputs = {};
    currentPage = 0;
    updateDisplay();
    saveProgress(); // создаём новую пустую точку
    hiddenInput.focus();
  }
});
