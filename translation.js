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

// Добавляет символ к текущему слову
export function updateCurrentWord(char) {
  currentWord += char;
  return currentWord;
}
