export function saveProgress(key, data) {
  localStorage.setItem("progress_" + key, JSON.stringify(data));
}

export function loadProgress(key) {
  const raw = localStorage.getItem("progress_" + key);
  if (!raw) return { page: 0, inputs: {} };
  try {
    return JSON.parse(raw);
  } catch {
    return { page: 0, inputs: {} };
  }
}

export function saveText(key, text) {
  localStorage.setItem("text_" + key, text);
}

export function loadText(key) {
  return localStorage.getItem("text_" + key);
}

export function listSavedTexts() {
  return Object.keys(localStorage)
    .filter((k) => k.startsWith("text_"))
    .map((k) => k.slice(5));
}
