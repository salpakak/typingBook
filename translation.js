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
}
