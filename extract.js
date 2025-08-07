const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const inputFile = path.join(__dirname, "russian_english_adjectives.csv");
const outputDir = path.join(__dirname, "dictionary");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const buckets = {};

fs.createReadStream(inputFile)
  .pipe(csv({ separator: "," }))
  .on("data", (data) => {
    const russian = data["bare"]?.trim();
    const english = data["translations_en"]?.trim();

    if (russian && english) {
      const firstLetter = english[0].toLowerCase();
      if (!buckets[firstLetter]) {
        buckets[firstLetter] = [];
      }
      buckets[firstLetter].push({ word: english, translation: russian });
    }
  })
  .on("end", () => {
    Object.entries(buckets).forEach(([letter, entries]) => {
      const filePath = path.join(outputDir, `${letter}.json`);
      fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), "utf8");
      console.log(`📄 Saved ${entries.length} words to ${letter}.json`);
    });
    console.log(`✅ All files saved in ${outputDir}`);
  });
