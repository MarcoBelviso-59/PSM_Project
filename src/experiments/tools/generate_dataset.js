"use strict";

const fs = require("fs");
const path = require("path");

function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function shuffle(s) {
  return s.split("").sort(() => Math.random() - 0.5).join("");
}

function randomStrong() {
  const lowers = "abcdefghijklmnopqrstuvwxyz";
  const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const syms = "!@#$%^&*()-_=+[]{};:,.?";
  const all = lowers + uppers + digits + syms;

  let out = "";
  // 16-22 chars
  const len = randInt(16, 22);
  // guarantee classes
  out += pick(lowers) + pick(uppers) + pick(digits) + pick(syms);
  for (let i = out.length; i < len; i++) out += pick(all);
  return shuffle(out);
}

function shortWeak() {
  const base = ["ciao", "amore", "roma", "mario", "sole", "pizza", "hello", "admin"];
  return pick(base) + String(randInt(0, 99));
}

function patterns() {
  const opts = [
    "abcd1234",
    "12345678",
    "qwerty123",
    "aaaa1111",
    "abababab12",
    "passpass12",
    "zzzz9999",
    "asdfgh12"
  ];
  return pick(opts);
}

function dictionaryDecorated() {
  const words = ["cavallo", "elefante", "computer", "password", "sicurezza", "universita", "napoli", "milano"];
  const w = pick(words);
  const year = String(randInt(1990, 2025));
  const sym = pick(["!", "?", "#", "@", "$"]);
  return w + sym + year;
}

function popCulture() {
  const names = ["goku", "naruto", "onepiece", "pika", "batman", "spiderman", "starwars", "harrypotter"];
  const year = String(randInt(1990, 2025));
  return pick(names) + year;
}

function personalTokensCase() {
  const name = pick(["mario", "luca", "giulia", "anna", "francesco"]);
  const city = pick(["roma", "napoli", "milano", "torino", "bari"]);
  const year = String(randInt(1975, 2005));
  // password che include token personali
  const pw = name + year + city;
  return { pw, tokens: [name, city, year] };
}

function main() {
  const outFile = process.argv[2] || "datasets/dataset_v1.json";
  const totalPerCategory = Number(process.argv[3] || 20); // 20 * 5 = 100 circa

  const records = [];
  let id = 1;

  function pushMany(category, count, genFn) {
    for (let i = 0; i < count; i++) {
      const password = genFn();
      records.push({ id: String(id++), category, password, personalTokens: [] });
    }
  }

  pushMany("random_strong", totalPerCategory, randomStrong);
  pushMany("short_weak", totalPerCategory, shortWeak);
  pushMany("patterns", totalPerCategory, patterns);
  pushMany("dictionary_decorated", totalPerCategory, dictionaryDecorated);
  pushMany("pop_culture", totalPerCategory, popCulture);

  // personal tokens subset (stesso count)
  for (let i = 0; i < totalPerCategory; i++) {
    const { pw, tokens } = personalTokensCase();
    records.push({ id: String(id++), category: "personal_tokens", password: pw, personalTokens: tokens });
  }

  const outPath = path.resolve(__dirname, "..", outFile);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(records, null, 2), "utf8");

  console.log("OK dataset generato:", outPath);
  console.log("Records:", records.length);
}

main();
