// 🎵 Элементы аудио
const soundCtrl = document.getElementById("soundCtrl");
const soundEnter = document.getElementById("soundEnter");
const soundBackspace = document.getElementById("soundBackspace");
const soundSpace = document.getElementById("soundSpace");
const volumeSlider = document.getElementById("volumeSlider");

// 🔊 Инициализация громкости
const initialVolume = parseFloat(volumeSlider?.value || "0.5");
[soundCtrl, soundEnter, soundBackspace, soundSpace].forEach((el) => {
  if (el) el.volume = initialVolume;
});

// 🎚️ Управление громкостью по слайдеру
volumeSlider?.addEventListener("input", () => {
  const volume = parseFloat(volumeSlider.value);
  [soundCtrl, soundEnter, soundBackspace, soundSpace].forEach((el) => {
    if (el) el.volume = volume;
  });
});

// 🔔 Воспроизведение звука при нажатии клавиши
export function playSoundForKey(e) {
  const key = e?.key;
  if (!key || typeof key !== "string") return;

  try {
    if (key === "Enter" && soundEnter) {
      soundEnter.currentTime = 0;
      soundEnter.play();
    } else if (key === "Backspace" && soundBackspace) {
      soundBackspace.currentTime = 0;
      soundBackspace.play();
    } else if (key === " " && soundSpace) {
      soundSpace.currentTime = 0;
      soundSpace.play();
    } else if (key.length === 1 && soundCtrl) {
      soundCtrl.currentTime = 0;
      soundCtrl.play();
    }
  } catch (err) {
    console.warn("Audio playback error:", err);
  }
}
