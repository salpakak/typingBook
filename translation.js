let dictionary = {};
let currentWord = "";

export function loadDictionary(dict) {
  dictionary = dict;
}

export function translateWord(word) {
  if (!word) return null;
  word = word.toLowerCase();
  return dictionary[word] || null;
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
  popup.style.top = "50%";
  popup.style.transform = "translate(-50%, -50%)";
}

export function hideTranslation() {
  const popup = document.getElementById("translationPopup");
  if (!popup) return;
  popup.style.display = "none";
}
