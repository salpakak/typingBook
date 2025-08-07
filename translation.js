
let currentWord = "";
const translationCache = {};

export async function translateWord(word) {
  if (!word) return null;
  word = word.toLowerCase();

  if (translationCache[word]) {
    return translationCache[word];
  }

  try {
    const response = await fetch(
      `https://lingva.ml/api/v1/en/ru/${encodeURIComponent(word)}`
    );
    const data = await response.json();
    const translated = data.translation || null;
    translationCache[word] = translated;
    return translated;
  } catch (error) {
    console.warn("Ошибка онлайн-перевода:", error);
    return null;
  }
}

export function updateCurrentWord(char) {
  if (/\s/.test(char)) {
    currentWord = "";
  } else {
    currentWord += char;
  }
  return currentWord;
}


// Элемент для отображения перевода
const translationHint = document.getElementById("translationHint");
let currentWord = "";

// Показывает перевод над текстом
export function showTranslation(text, targetRect) {
  translationHint.textContent = text;
  translationHint.style.opacity = "1";
  if (targetRect) {
    translationHint.style.left = `${targetRect.left}px`;
    translationHint.style.top = `${targetRect.top - 30}px`;
  }
}

// Скрывает перевод
export function hideTranslation() {
  translationHint.style.opacity = "0";
}

// Получает перевод слова с LibreTranslate
export async function translateWord(word) {
  try {
    const response = await fetch(
      "https://translate.argosopentech.com/translate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: word,
          source: /[а-яА-Я]/.test(word) ? "ru" : "en",
          target: /[а-яА-Я]/.test(word) ? "en" : "ru",
          format: "text",
        }),
      }
    );
    const data = await response.json();
    return data.translatedText;
  } catch (err) {
    console.error("Ошибка перевода:", err);
    return "";
  }
}

// Сброс текущего слова

export function resetCurrentWord() {
  currentWord = "";
}


export function showTranslation(text, rect) {
  const popup = document.getElementById("translationPopup");
  if (!popup) return;

  popup.textContent = text;
  popup.style.display = "block";
  popup.style.position = "fixed";
  popup.style.left = "50%";
  popup.style.top = "10%"; // 👈 ближе к верху
  popup.style.transform = "translateX(-50%)"; // 👈 только по горизонтали
}

export function hideTranslation() {
  const popup = document.getElementById("translationPopup");
  if (!popup) return;
  popup.style.display = "none";
=======
// Добавляет символ к текущему слову
export function updateCurrentWord(char) {
  currentWord += char;
  return currentWord;

}
