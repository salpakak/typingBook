// Количество символов на одну страницу
export const charactersPerPage = 400;

// Функция разбивает текст на страницы
export function splitTextIntoPages(text) {
  const chunks = [];
  for (let i = 0; i < text.length; i += charactersPerPage) {
    chunks.push(text.slice(i, i + charactersPerPage));
  }
  return chunks;
}

// Функция очистки текста перед разбивкой
export function cleanText(text) {
  return text
    .replace(/[ \t]{2,}/g, " ") // заменяем 2+ пробела или таба на один
    .replace(/^\s+/gm, "") // убираем пробелы в начале строк
    .replace(/\s+$/gm, "") // убираем пробелы в конце строк
    .replace(/\n{3,}/g, "\n\n"); // максимум два переноса
}
