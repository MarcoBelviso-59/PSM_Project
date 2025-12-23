"use strict";

const fs = require("fs");
const path = require("path");

// PRNG deterministico (Mulberry32)
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function main() {
  // Usage:
  // node tools/generate_dataset.js datasets/dataset_v1.json 20 --seed 12345
  const outFile = process.argv[2] || "datasets/dataset_v1.json";
  const totalPerCategory = Number(process.argv[3] || 20);

  const flags = parseArgs(process.argv);
  // se non passi seed, lo generiamo (ma in CI lo passeremo sempre)
  const seedRaw = flags.seed ?? Date.now();
  const seed = Number(seedRaw) >>> 0; // uint32

  const rand = mulberry32(seed);

  function randInt(a, b) {
    return a + Math.floor(rand() * (b - a + 1));
  }

  function pick(arr) {
    return arr[randInt(0, arr.length - 1)];
  }

  function shuffle(s) {
    return s
      .split("")
      .sort(() => rand() - 0.5)
      .join("");
  }

  function randomStrong() {
    const lowers = "abcdefghijklmnopqrstuvwxyz";
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const syms = "!@#$%^&*()-_=+[]{};:,.?";
    const all = lowers + uppers + digits + syms;

    let out = "";
    const len = randInt(16, 22);
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
    const pw = name + year + city;
    return { pw, tokens: [name, city, year] };
  }

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

  for (let i = 0; i < totalPerCategory; i++) {
    const { pw, tokens } = personalTokensCase();
    records.push({ id: String(id++), category: "personal_tokens", password: pw, personalTokens: tokens });
  }

  const outPath = path.resolve(__dirname, "..", outFile);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(records, null, 2), "utf8");

  console.log("OK dataset generato:", outPath);
  console.log("Records:", records.length);
  console.log("Seed:", seed);
}

main();
