// Элементы аудио
const soundCtrl = document.getElementById("soundCtrl");
const soundEnter = document.getElementById("soundEnter");
const soundBackspace = document.getElementById("soundBackspace");
const soundSpace = document.getElementById("soundSpace");
const volumeSlider = document.getElementById("volumeSlider");

// Инициализация громкости
const initialVolume = parseFloat(volumeSlider.value);
soundCtrl.volume = initialVolume;
soundEnter.volume = initialVolume;
soundBackspace.volume = initialVolume;
soundSpace.volume = initialVolume;

// Управление громкостью по слайдеру
volumeSlider.addEventListener("input", () => {
  const volume = parseFloat(volumeSlider.value);
  soundCtrl.volume = volume;
  soundEnter.volume = volume;
  soundBackspace.volume = volume;
  soundSpace.volume = volume;
});

// Воспроизведение звука при нажатии клавиши
export function playSoundForKey(e) {
  if (e.key === "Enter") {
    soundEnter.currentTime = 0;
    soundEnter.play();
  } else if (e.key === "Backspace") {
    soundBackspace.currentTime = 0;
    soundBackspace.play();
  } else if (e.key === " ") {
    soundSpace.currentTime = 0;
    soundSpace.play();
  } else if (e.key.length === 1) {
    soundCtrl.currentTime = 0;
    soundCtrl.play();
  }
}
