(function (global) {
  'use strict';

  function normalize(s){
  return (s || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");
}

function deleetForDictionary(s) {
  // Conservativo:
  // - @ e $ li convertiamo sempre (sono tipici leet)
  // - i numeri (0,1,3,4,5,7) li convertiamo SOLO se adiacenti a lettere (così 2025 resta 2025)
  const str = (s || "");

  // prima sostituzioni "simbolo"
  let out = str
    .replace(/@/g, "a")
    .replace(/\$/g, "s");

  // poi sostituzioni "numero", ma solo se vicino a lettere
  const map = { "0":"o", "1":"i", "3":"e", "4":"a", "5":"s", "7":"t" };

  out = out.split("").map((ch, i, arr) => {
    if (!map[ch]) return ch;

    const prev = arr[i - 1] || "";
    const next = arr[i + 1] || "";

    const prevIsLetter = /[a-zA-Z]/.test(prev);
    const nextIsLetter = /[a-zA-Z]/.test(next);

    // converto solo se il numero è "dentro" o "attaccato" a una parola
    if (prevIsLetter || nextIsLetter) return map[ch];

    return ch; // es. 2025 resta 2025
  }).join("");

  return out;
}



function emailParts(email){
  const e = normalize(email);
  const [local, domain] = e.split("@");
  const localTokens = (local || "").split(/[\.\_\-\+]+/).filter(Boolean);
  const domainTokens = (domain || "").split(/[\.]+/).filter(Boolean);
  return [...new Set([...localTokens, ...domainTokens].filter(t => t.length >= 3))];
}

/* 5 livelli */
function strengthLabel(score) {
  if (score <= 19) return "Molto debole";
  if (score <= 39) return "Debole";
  if (score <= 59) return "Discreta";
  if (score <= 79) return "Buona";
  return "Molto forte";
}

const descMap = {
  "Molto debole": "Facilmente indovinabile",
  "Debole": "Poco sicura",
  "Discreta": "Accettabile, ma migliorabile",
  "Buona": "Sicura per l’uso comune",
  "Molto forte": "Elevata resistenza agli attacchi"
};

function hasConsecutivePattern(p) {
  const s = normalize(p);

  const letters = s.replace(/[^a-z]/g, "");
  const digits = s.replace(/[^0-9]/g, "");

  const hasRun = (str, minLen) => {
    if (!str || str.length < minLen) return false;

    let inc = 1;
    let dec = 1;

    for (let i = 1; i < str.length; i++) {
      const prev = str.charCodeAt(i - 1);
      const cur = str.charCodeAt(i);

      if (cur === prev + 1) inc++;
      else inc = 1;

      if (cur === prev - 1) dec++;
      else dec = 1;

      if (inc >= minLen || dec >= minLen) return true;
    }
    return false;
  };

  // abcd / dcba
  if (hasRun(letters, 4)) return true;
  // 1234 / 4321
  if (hasRun(digits, 4)) return true;

  // Sequenze tipiche da tastiera (4 caratteri consecutivi)
  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

  const rev = (x) => x.split("").reverse().join("");
  const L = letters; // già solo lettere, già lowercase

  for (const row of rows) {
    const rowRev = rev(row);
    for (let i = 0; i <= row.length - 4; i++) {
      const sub = row.slice(i, i + 4);
      const subRev = rowRev.slice(i, i + 4);
      if (L.includes(sub) || L.includes(subRev)) return true;
    }
  }

  return false;
}

function hasNearConsecutivePattern(p) {
  const s = normalize(p);
  const letters = s.replace(/[^a-z]/g, "");
  const digits  = s.replace(/[^0-9]/g, "");

  // “near run”: finestra di 6 caratteri con al massimo 1 mismatch
  // (es. abcdfef -> ha un solo salto d->f)
  const hasNearRun = (str, windowLen = 6, maxMismatches = 1) => {
    if (!str || str.length < windowLen) return false;

    for (let start = 0; start <= str.length - windowLen; start++) {
      let mism = 0;

      for (let i = 1; i < windowLen; i++) {
        const prev = str.charCodeAt(start + i - 1);
        const cur  = str.charCodeAt(start + i);

        if (Math.abs(cur - prev) !== 1) {
          mism++;
          if (mism > maxMismatches) break;
        }
      }

      if (mism <= maxMismatches) return true;
    }
    return false;
  };

  // richiedo almeno 6 caratteri “puliti” per evitare falsi positivi
  if (hasNearRun(letters, 6, 1)) return true;
  if (hasNearRun(digits, 6, 1)) return true;

  return false;
}

  
/* "Dizionario" di password/parole molto comuni (penalità, NON blocco) */
const COMMON_WORDS = [
  "password","passw0rd","admin","administrator","welcome","letmein","qwerty","qwertyuiop","hola","oui","peach","baby","just","justdoit",
  "asdf","asdfgh","zxcv","zxcvbnm","iloveyou","love","dragon","monkey","football","good","goodnight","here","qwerty","users","app","application",
  "baseball","login","user","test","demo","root","toor","master","superuser","thisismypassword",
  "123456","1234567","12345678","123456789","1234567890","111111","000000","987654321","hereiam","mobile","phone","bet","letsgo","rabbit","clash",
  "abc123","iloveyou","sunshine","princess","password1","admin123","qazwsx","hello","helloworld","laptop","computer","dad","dog","cat","mum",
    // IT (curato, non enorme)
  "ciao","benvenuto","benvenuta","salve","buongiorno","buonasera","questo","questa","andiamo","guido","andare","iosono","noisiamo","forte","debole","serie","fiore","zucca","bellissima","sei","giocattolo","giostra","lavoro",
  "mondo","amore","tiamo","test","admin1","accesso","login1","login2","eccomi","ecco","amico","amici","mare","sono","siamo","stadio","cantante","stagione","stagioni","estate","inverno","autunno","primavera"

];

/* SMALL SET WORDS (IT) – parole prevedibili in insiemi "piccoli"
   Nota: usare forme senza accenti perché normalize() rimuove i diacritici. */
const SMALL_SETS_IT = {
  hard: {
    colori: new Set([
      "blu","rosso","giallo","verde","arancione","viola","nero","bianco",
      "grigio","marrone","rosa","azzurro","celeste","beige"
    ]),
    mesi: new Set([
      "gennaio","febbraio","marzo","aprile","maggio","giugno",
      "luglio","agosto","settembre","ottobre","novembre","dicembre"
    ]),
    giorni: new Set([
      "lunedi","martedi","mercoledi","giovedi","venerdi","sabato","domenica"
    ])
  },

  soft: {
    // lista curata (non enorme): abbastanza per catturare password ovvie, senza esagerare
    squadre: new Set([
      "juventus","inter","milan","napoli","roma","lazio","atalanta","fiorentina","torino",
      "bologna","genoa","sampdoria","cagliari","udinese","palermo","parma", "nottinghamforest",
      "realmadrid","barcellona","atletico","manchester","liverpool","chelsea","arsenal","lion",
      "bayern","dortmund","psg","marseille","ajax","bari","lecce", "newcastle", "lakers","warriors"
    ]),

    citta: new Set([
      "roma","milano","napoli","torino","palermo","genova","bologna","firenze","venezia","verona",
      "bari","catania","padova","trieste","brescia","prato","taranto","parma","modena","reggio",
      "londra","parigi","madrid","barcellona","berlino","monaco","vienna","zurigo","amsterdam",
      "lisbona","bruxelles","dublino","newyork","losangeles","chicago","miami","boston"
    ]),

    animali: new Set([
      "cane","gatto","cavallo","mucca","pecora","capra","maiale","pollo","coniglio",
      "leone","tigre","orso","lupo","volpe","cervo","elefante","giraffa","zebra",
      "scimmia","delfino","balena","squalo","aquila","gufo","serpente","tartaruga","pettirosso"
    ]),

    // MOLTO cauti coi nomi: set minuscolo, e lo tratteremo sempre come "soft"
    nomi: new Set([
      "mario","luigi","giuseppe","antonio","andrea","marco","valeria","nicola","michele","asia",
      "giulia","maria","francesca","anna","laura","giovanni","alessio","francesco","felice","angelica"
    ])
  }
};

// Lista piatta di tutte le parole small-set, ordinata per lunghezza decrescente.
// Serve per segmentare concatenazioni tipo "bluarancionegiallo" -> ["blu","arancione","giallo"].
const SMALL_SET_ALL_WORDS = (() => {
  const words = new Set();

  for (const set of Object.values(SMALL_SETS_IT.hard)) {
    for (const w of set) words.add(w);
  }
  for (const set of Object.values(SMALL_SETS_IT.soft)) {
    for (const w of set) words.add(w);
  }

  return [...words].sort((a, b) => b.length - a.length);
})();

const POP_CULTURE_WORDS = new Set([
  // Dragon Ball
  "goku","vegeta","gohan","piccolo","trunks","bulma","frieza","cell","majinbuu","broly","beerus","whis",
  // Naruto
  "naruto","sasuke","sakura","kakashi","itachi","madara","obito","pain","jiraiya","tsunade","orochimaru","gaara","hinata","boruto",
  // One Piece
  "luffy","zoro","nami","sanji","usopp","chopper","robin","franky","brook","jinbe","ace","sabo","shanks","blackbeard","kaido","bigmom",
  // Attack on Titan
  "eren","mikasa","armin","levi","erenyeager","titan","colossaltitan",
  // Demon Slayer
  "tanjiro","nezuko","zenitsu","inosuke","muzan",
  // JJK
  "gojo","sukuna","itadori","megumi","nobara",
  // Bleach
  "ichigo","rukia","aizen",
  // Death Note
  "light","ryuk","misa","kira",
  // Pokemon
  "pikachu","charizard","mewtwo","bulbasaur","squirtle","eevee","ash","misty",
  // Minecraft / Fortnite / Roblox
  "minecraft","fortnite","roblox","creeper","enderman","steve","vanilla","survival",
  // Marvel / DC
  "spiderman","ironman","captainamerica","thor","hulk","loki","thanos","deadpool","wolverine","blackpanther","drstrange","scarletwitch",
  "batman","superman","wonderwoman","joker","harleyquinn","flash","aquaman","venom","carnage", "peterparker","avengers","brucewayne","ultron",
  // Harry Potter
  "harrypotter","harry","hermione","ron","voldemort","hogwarts","dumbledore","snape","expectopatronum","avadakedavra",
  // Star Wars
  "starwars","darthvader","vader","skywalker","lukeskywalker","leia","yoda","mandalorian","grogu","kylo","stormtrooper",
  // Stranger Things
  "strangerthings","eleven","vecna","demogorgon","hopper","henrycreel","steveharrington","demodog",
  // The Witcher / LOTR / GOT
  "witcher","geralt","ciri","yennefer",
  "lotr","lordoftherings","frodo","gandalf","aragorn","legolas","sauron",
  "gameofthrones","got","daenerys","jon","snow","tyrion","nightking",
  // Anime/altro pop
  "pokemon","dragonballsuper","onepiece","narutoshippuden","attackontitan","yu-gi-oh","yugi","yuma",
    // --- Sport (calcio & co.) ---
  "cristianoronaldo","ronaldo","cr7","cristiano","cris",
  "lionelmessi","messi","leomessi","lm10",
  "neymar","neymarjr","lamine","yaminelamal","lamal",
  "kylianmbappe","mbappe",
  "erlinghaaland","haaland",
  "zlatanibrahimovic","ibrahimovic",
  "robertlewandowski","lewandowski",
  "mohamedsalah","salah",
  "kevindebruyne","debruyne",
  "harrykane","harrykane",
  "viniciusjr","vinicius",
  "judebellingham","bellingham",
  "antoiniegriezmann","griezmann",
  "lukamodric","modric",
  "karimbenzema","benzema",
  "sergioramos","ramos",
  "manuelneuer","neuer",
  "gianluigidonnarumma","donnarumma",
  "gianluigibuffon","buffon",
  "andrea pirlo".replace(" ",""), "pirlo", 
  "francescototti","totti",
  "paolodybala","dybala",
  "khvichakvaratskhelia","kvaratskhelia",
  "victorosimhen","osimhen",
  "romelulukaku","lukaku",
  "lautaro","lautaromartinez","martinez",
  "paul pogba".replace(" ",""), "pogba",
  "paulscholes","scholes",
  "davidbeckham","beckham",
  "wayne rooney".replace(" ",""), "rooney",
  "thierryhenry","henry",
  "ronaldinho","ronaldinho gaucho".replace(" ",""),
  "kaká".normalize ? "kaka" : "kaka", 
  "maradona","diegoarmandomaradona",
  "pele","edsonarantendonascimento",
  "michaeljordan","jordan","magicjonhson",
  "lebronjames","lebron",
  "kobebryant","kobe",
  "stephencurry","curry",
  "usainbolt","bolt",
  "novakdjokovic","djokovic","yanniksinner","sinner","alcaraz","carlosalcaraz",
  "rafaelnadal","nadal",
  "rogerfederer","federer",
  "lewishamilton","hamilton",
  "maxverstappen","verstappen","leclerc","charlesleclerc","schumacher","ayrtonsenna","senna",

  // --- Attori / cinema ---
  "leonardodicaprio","dicaprio",
  "bradpitt","angelinajolie",
  "johnnydepp","depp",
  "tomhanks","morganfreeman",
  "robertdowneyjr","rdj",
  "chrishemsworth","hemsworth",
  "chrisevans","scarlettjohansson","johansson",
  "keanureeves","reeves",
  "will smith".replace(" ",""), "willsmith",
  "dwaynejohnson","therock","rock",
  "jasonstatham","statham",
  "jackiechan","chan",
  "hughjackman","jackman",
  "ryanreynolds","reynolds",
  "christianbale","bale",
  "mattdamon","damon",
  "georgeclooney","clooney",
  "benaffleck","affleck",
  "natalieportman","portman",
  "jenniferlawrence","lawrence","pattinson","robertpattinson",
  "emmawatson","watson",
  "zendaya","tomholland",
  "timotheechalamet","chalamet",
  "ladygaga",
  "merylstreep","streep",
  "alpacino","pacino",
  "robertdeniro","deniro",
  "juliaroberts","roberts",
  "nicolekidman","kidman",
  "channingtatum","tatum",
  "clinteastwood","eastwood",
  "quentintarantino","tarantino",

  // --- Musica (pop/rap) ---
  "taylorswift","swift",
  "beyonce","rihanna",
  "justinbieber","bieber",
  "arianagrande","grande",
  "dualipa","billieeilish","eilish",
  "drake","eminem","kanye","yee","snoopdog","rihanna","slimshady",
  "theweeknd","weeknd",
  "edsheeran","sheeran",
  "brunomars","mars",
  "katyperry","perry",
  "selenagomez","gomez",
  "shakira",
  "madonna",
  "coldplay",
  "linkinpark",
  "metallica",
  "queen",
  "u2",
  "bts",
  "blackpink",

  // --- Tech / business celeb ---
  "elonmusk","musk",
  "jeffbezos","bezos",
  "billgates","gates",
  "stevejobs","jobs",
  "markzuckerberg","zuckerberg",

  // --- Influencer/TV (internazionali, noti) ---
  "kimkardashian","kardashian",
  "kyliejenner","jenner"

]);

// utile per segmentare concatenazioni tipo "harrypotter2025" o "starwarsfan"
const POP_CULTURE_ALL_WORDS = [...POP_CULTURE_WORDS].sort((a,b) => b.length - a.length);




function dictionaryHits(pw) {
  const s = deleetForDictionary(normalize(pw));
  if (!s) return { hits: 0, matched: [] };

  // match "esatto" e "contenuto"
  const matched = [];
  for (const w of COMMON_WORDS) {
    if (!w) continue;
    if (s === w || (w.length >= 4 && s.includes(w))) matched.push(w);
  }
  return { hits: matched.length, matched };
}

/*
  Scoring basato su:
  - Basic16 (>=16 char, primi 8 a 4pt, successivi a 8pt, 16 char = 100)
  - Comprehensive8 (>=8 char, 4pt per char + bonus per classi e varietà, penalità se niente minuscole)
  Baseline meter: score = max(Basic16, Comprehensive8)

  + Penalità:
    - pattern consecutivi
    - mancanza simboli
    - mancanza maiuscole
    - caratteri uguali di fila
    - dizionario di parole comuni (facilmente indovinabili)
    - info personali (nome/cognome/email)
*/

function tokenizeWords(pw) {
  if (!pw) return [];

  // Deleet PRIMA di estrarre parole (così C@ne -> Cane, G@tto -> Gatto)
  let s = deleetForDictionary(pw);

  // 1) separa camelCase: aB -> a B
  s = s.replace(/([a-z])([A-Z])/g, "$1 $2");

  // 2) sostituisce separatori comuni con spazi
  s = s.replace(/[_\-.]+/g, " ");

  // 3) estrae token alfabetici grezzi
  const raw = s.match(/[A-Za-z]+/g) || [];

  // prova a segmentare un token in parole small-set consecutive
  function splitBySmallSetWords(tok) {
    const out = [];
    let i = 0;

    while (i < tok.length) {
      let matched = null;

      for (const w of SMALL_SET_ALL_WORDS) {
        if (tok.startsWith(w, i)) {
          matched = w;
          break;
        }
      }

      if (matched) {
        out.push(matched);
        i += matched.length;
      } else {
        i += 1;
      }
    }

    const covered = out.reduce((sum, w) => sum + w.length, 0);
    const coverage = tok.length > 0 ? covered / tok.length : 0;

    // accetta lo split solo se: almeno 2 parole e gran parte del token è coperta
    if (out.length >= 2 && coverage >= 0.70) return out;

    return null;
  }

  // 4) normalizza e (se conviene) segmenta concatenazioni
  const tokens = [];
  for (const t of raw) {
    const tok = deleetForDictionary(normalize(t).toLowerCase());

    if (tok.length < 3) continue;

    const split = splitBySmallSetWords(tok);
    if (split) {
      for (const w of split) tokens.push(w);
    } else {
      tokens.push(tok);
    }
  }

  return tokens;
}


function detectPatterns(pw, personalTokens = []) {
  const p = pw || "";
  const patterns = [];
    // POP_CULTURE: match super robusto (parola + numeri/simboli), es. "Goku2025" -> "goku"
  // Metterlo qui garantisce che non venga "saltato" da blocchi successivi.
  if (typeof POP_CULTURE_WORDS !== "undefined") {
    const sPopQuick = deleetForDictionary(normalize(pw));
const lettersOnly = sPopQuick.replace(/[^a-z]/g, "");
if (lettersOnly) {
  // match se la password CONTIENE una parola pop-culture completa (anche come sottostringa)
  const matched = [];
  for (const w of POP_CULTURE_ALL_WORDS) {
    if (lettersOnly.includes(w)) matched.push(w);
  }

  if (matched.length > 0) {
    patterns.push({
      type: "POP_CULTURE",
      hits: matched.length,
      tokens: [...new Set(matched)].slice(0, 8), // evita liste infinite in UI
      coverage: Number(Math.min(1, matched.reduce((s, t) => s + t.length, 0) / lettersOnly.length).toFixed(2)),
      nonAlpha: (sPopQuick.match(/[^a-z]/g) || []).length
    });
  }
}

  }

  const len = p.length;

  // classi caratteri
  const hasLower = /[a-z]/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasDigit = /\d/.test(p);
  const hasSym   = /[^A-Za-z0-9]/.test(p);

  if (!p) {
    patterns.push({ type: "EMPTY" });
    return patterns;
  }
  // tutti i caratteri uguali (es. aaaaaa, !!!!!, 111111)
 // varietà caratteri (unicità)
const uniqueChars = new Set(p.split(""));
const uniqueCount = uniqueChars.size;
const uniqueRatio = uniqueCount / len;

if (uniqueCount === 1) {
  patterns.push({ type: "ALL_SAME_CHAR" });
} else if (len >= 8 && (uniqueCount <= 4 || uniqueRatio < 0.30)) {
  patterns.push({
    type: "LOW_UNIQUENESS",
    uniqueCount,
    uniqueRatio: Number(uniqueRatio.toFixed(2))
  });
}



  // requisiti/indicatori base
  if (len < 8) patterns.push({ type: "TOO_SHORT", min: 8, len });

  if (!hasLower) patterns.push({ type: "MISSING_LOWER" });
  if (!hasUpper) patterns.push({ type: "MISSING_UPPER" });
  if (!hasDigit) patterns.push({ type: "MISSING_DIGIT" });
  if (!hasSym)   patterns.push({ type: "MISSING_SYMBOL" });

  // --- YEAR / DATE pattern (anni e date molto prevedibili) ---
const norm = normalize(p);

// anno (1950–2039): copre quasi tutti i casi reali senza essere troppo aggressivo
const hasYear = /(?:^|[^0-9])(19[5-9]\d|20[0-3]\d)(?:$|[^0-9])/.test(norm);


// data con separatori: 12/05/2001, 12-05-01, 12.05.2001
const hasDateSep = /\b\d{1,2}[\/\-\.]\d{1,2}([\/\-\.]\d{2,4})?\b/.test(norm);

// data “compatta” 8 cifre tipo 01011990
const hasDateCompact = /\b\d{8}\b/.test(norm);

if (hasYear || hasDateSep || hasDateCompact) {
  patterns.push({ type: "YEAR_OR_DATE" });
}


  // pattern noti
  if (hasConsecutivePattern(p)) {
  patterns.push({ type: "CONSECUTIVE_PATTERN" });
} else if (hasNearConsecutivePattern(p)) {
  patterns.push({ type: "NEAR_CONSECUTIVE_PATTERN" });
}


  if (/(.)\1\1/.test(p)) patterns.push({ type: "REPEAT_3PLUS" });
  else if (/(.)\1/.test(p)) patterns.push({ type: "REPEAT_2" });

  // dizionario
  const dict = dictionaryHits(p);
  if (dict.hits > 0) patterns.push({ type: "DICTIONARY", hits: dict.hits, matched: dict.matched });

    
    // frase composta da più parole di dizionario (es. CiaoMondo2025!)
  const toksAll = tokenizeWords(p).map(t => deleetForDictionary(t));

  // consideriamo solo "parole contenuto" (evita di dipendere da al/con/gli...)
  const toks = toksAll.filter(t => t.length >= 4);

  const alphaTotal2 = toks.reduce((sum, t) => sum + t.length, 0);
  if (alphaTotal2 > 0) {
    const dictTok = toks.filter(t => COMMON_WORDS.includes(t));

    if (dictTok.length >= 2) {
      const alphaCovered = dictTok.reduce((sum, t) => sum + t.length, 0);
      const coverage = Math.min(1, alphaCovered / alphaTotal2);

      if (coverage >= 0.70) {
        patterns.push({
          type: "MULTI_DICTIONARY_WORDS",
          hits: dictTok.length,
          tokens: [...new Set(dictTok)],
          coverage: Number(coverage.toFixed(2))
        });
      }
    }
  }


  // match esatto di parola comune (es. "password1")
  const sNorm = normalize(p);
  if (dict.hits > 0 && dict.matched.includes(sNorm)) {
  patterns.push({ type: "COMMON_EXACT", word: sNorm });
  }


   // parola comune + decorazioni (es. Password123!)
  if (dict.hits > 0) {
    const s = deleetForDictionary(normalize(p));


    // scegli la parola comune "dominante" (la più lunga tra quelle matchate)
    const word = dict.matched.reduce((best, w) => (w.length > best.length ? w : best), "");
    const exact = (s === word);

    if (word && !exact) {
      const idx = s.indexOf(word);
      if (idx !== -1 && s.length > 0) {
        // rimuovo UNA occorrenza della parola comune e analizzo il resto
        const rest = s.slice(0, idx) + s.slice(idx + word.length);

        const restAlpha = (rest.match(/[a-z]/g) || []).length; // altre lettere oltre alla parola comune
        const decorationLen = rest.length;                     // tutto ciò che resta (cifre/simboli/altro)
        const ratio = word.length / s.length;                  // contaminazione: quanto "domina" la parola comune

        // euristica "decorated": quasi tutto è la parola comune, il resto è poco ed è quasi solo decorazione
        const minimalDecoration = decorationLen <= 2; // es. "1", "1!", "!!"
        const smallDecoration = decorationLen <= 6;   // es. "123", "2024!", "123!!"

       if (
       (ratio >= 0.55 && smallDecoration && restAlpha <= 2) ||                 // era 0.60
       (ratio >= 0.75 && decorationLen <= 8 && restAlpha <= 4) ||
       (ratio >= 0.50 && minimalDecoration && restAlpha <= 1) ||
       (ratio >= 0.50 && decorationLen <= 8 && restAlpha === 0)                // nuovo: parola + soli numeri/simboli (es. 2025!!)
       ) {

      patterns.push({
      type: "DECORATED_COMMON",
      word,
      ratio: Number(ratio.toFixed(2)),
      decorationLen,
      restAlpha
  });
}

      }
    }
  }


    // parole da "small sets" (IT): colori/mesi/giorni/città/animali/squadre/nome...
  const sSmall = normalize(p);
  const alphaTotal = (sSmall.match(/[a-z]/g) || []).length;

  if (alphaTotal > 0) {
    const tokens = tokenizeWords(p); // helper aggiunto nello step D-1b
    let alphaCovered = 0;

    const matchedTokens = [];
    const matchedSets = new Set();

    let hardHit = false;
    let softHit = false;

    for (const tok of tokens) {
      let hit = false;

      // hard sets
      for (const [setName, set] of Object.entries(SMALL_SETS_IT.hard)) {
        if (set.has(tok)) {
          hit = true;
          hardHit = true;
          matchedSets.add(setName);
          break;
        }
      }

      // soft sets (solo se non già trovato in hard)
      if (!hit) {
        for (const [setName, set] of Object.entries(SMALL_SETS_IT.soft)) {
          if (set.has(tok)) {
            hit = true;
            softHit = true;
            matchedSets.add(setName);
            break;
          }
        }
      }

      if (hit) {
        matchedTokens.push(tok);
        alphaCovered += tok.length;
      }
    }

    const coverage = Math.min(1, alphaCovered / alphaTotal);

// conta quanti caratteri NON alfabetici ci sono (numeri/simboli)
const nonAlpha = (sSmall.match(/[^a-z]/g) || []).length;

// caso speciale: 1 sola parola small-set (es. "Juventus2024!")
const strongSingle =
  matchedTokens.length === 1 &&
  coverage >= 0.85 &&
  matchedTokens[0].length >= 6 &&
  nonAlpha <= 6;

// caso speciale (nomi): accetta anche 1 solo nome >=4 (es. "Mario2025!")
const singleName =
  matchedTokens.length === 1 &&
  matchedSets.has("nomi") &&
  coverage >= 0.85 &&
  matchedTokens[0].length >= 4 &&
  nonAlpha <= 6;

if ((matchedTokens.length >= 2 && coverage >= 0.70) || strongSingle || singleName) {
  const severity = (hardHit && softHit) ? "mixed" : (hardHit ? "hard" : "soft");

  patterns.push({
    type: "SMALL_SET_WORDS",
    severity,
    sets: [...matchedSets],
    tokens: [...new Set(matchedTokens)],
    coverage: Number(coverage.toFixed(2)),
    alphaTotal
  });
}

}

    // Passphrase "wordy": sembra testo naturale (2+ parole lunghe), anche se non sono nel dizionario
   const sWordy = deleetForDictionary(normalize(p));

   const alphaTotalW = (sWordy.match(/[a-z]/g) || []).length;

   if (alphaTotalW > 0) {
    const toksAllW = tokenizeWords(sWordy);

    const toksW = toksAllW.filter(t => t.length >= 4);                 // “parole contenuto” (evita connettivi tipo al/con/gli)

    const alphaCoveredW = toksW.reduce((sum, t) => sum + t.length, 0);
    const coverageW = Math.min(1, alphaCoveredW / alphaTotalW);

    const nonAlphaW = (sWordy.match(/[^a-z]/g) || []).length;

    // Scatta solo se è davvero “quasi tutta” parole + poche decorazioni
    if (toksW.length >= 2 && alphaTotalW >= 8 && coverageW >= 0.85 && nonAlphaW <= 6) {
      patterns.push({
        type: "WORDY_PASSPHRASE",
        words: toksW.length,
        tokens: [...new Set(toksW)],
        coverage: Number(coverageW.toFixed(2)),
        alphaTotal: alphaTotalW,
        nonAlpha: nonAlphaW
      });
    }
  }

    // POP CULTURE words (goku, spiderman, vecna, harrypotter, starwars...)
  const sPop = deleetForDictionary(normalize(p));
  
  const alphaTotalPop = (sPop.match(/[a-z]/g) || []).length;

  if (alphaTotalPop > 0) {
    // tokenizza sulla stringa deleetizzata (così C@ne->cane funziona già, e qui idem)
    const toksBase = tokenizeWords(sPop);

    // prova a segmentare token lunghi in parole pop-culture (tipo "harrypotter" anche se attaccato)
    function splitByPop(tok) {
      const out = [];
      let i = 0;
      while (i < tok.length) {
        let matched = null;
        for (const w of POP_CULTURE_ALL_WORDS) {
          if (tok.startsWith(w, i)) { matched = w; break; }
        }
        if (matched) { out.push(matched); i += matched.length; }
        else i += 1;
      }
      const covered = out.reduce((sum,w)=>sum+w.length,0);
      const coverage = tok.length ? covered / tok.length : 0;
      if (out.length >= 1 && coverage >= 0.80) return out; // basta 1 parola pop se copre quasi tutto il token
      return null;
    }

    const toks = [];
    for (const t of toksBase) {
      const split = splitByPop(t);
      if (split) toks.push(...split);
      else toks.push(t);
    }

    const matched = toks.filter(t => POP_CULTURE_WORDS.has(t));
    const alphaCovered = matched.reduce((sum,t)=>sum+t.length,0);
    const coverage = Math.min(1, alphaCovered / alphaTotalPop);
    const nonAlpha = (sPop.match(/[^a-z]/g) || []).length;

    // “super ovvio”: almeno 1 parola pop, coverage alta e decorazione bassa
    if (matched.length >= 1 && coverage >= 0.70) {
     if (!patterns.some(pt => pt.type === "POP_CULTURE")) patterns.push({
        type: "POP_CULTURE",
        hits: matched.length,
        tokens: [...new Set(matched)],
        coverage: Number(coverage.toFixed(2)),
        nonAlpha
      });
    }
  }




  // info personali
  const np = normalize(p);
  const matchedPersonal = [];
  for (const t of personalTokens) {
    if (t && t.length >= 3 && np.includes(t)) matchedPersonal.push(t);
  }
  if (matchedPersonal.length) {
    patterns.push({
      type: "PERSONAL_INFO",
      hits: matchedPersonal.length,
      matched: [...new Set(matchedPersonal)]
    });
  }

  return patterns;
}

function evaluate(pw, personalTokens = []) {
  // riusa l’algoritmo già presente
  const res = evaluatePassword(pw, personalTokens);

  // aggiungi patterns (nuovo requisito DS)
  const patterns = detectPatterns(pw, personalTokens);

    // CAP finale per password con un solo carattere ripetuto
  let score = res.score;

  if (patterns.some(pt => pt.type === "ALL_SAME_CHAR")) {
    score = Math.min(score, 5);
  }
  if (patterns.some(pt => pt.type === "LOW_UNIQUENESS")) {
  score = Math.min(score, 15);
  }
  if (patterns.some(pt => pt.type === "COMMON_EXACT")) {
  score = Math.min(score, 10);
  }

  // Step C: CAP proporzionale per parola comune + decorazioni
  const dec = patterns.find(pt => pt.type === "DECORATED_COMMON");
  if (dec) {
  let cap = 39;               // base: non può essere "Buona/Molto forte"
  if (dec.ratio >= 0.75) cap = 15;
  else if (dec.ratio >= 0.60) cap = 25;
  if (dec.decorationLen <= 2 && dec.ratio >= 0.60) cap = Math.min(cap, 15);


  score = Math.min(score, cap);
}

  // Step D: CAP per parole prevedibili (small sets)
  const ss = patterns.find(pt => pt.type === "SMALL_SET_WORDS");
  if (ss) {
  // base: hard/mixed = 59, soft = 49 (meno generoso)
  let cap = (ss.severity === "soft") ? 49 : 59;

  const norm = normalize(pw);
  const nonAlpha = (norm.match(/[^a-z]/g) || []).length;

  // cap 39: come prima per hard/mixed
  if (ss.severity !== "soft") {
    if (ss.coverage >= 0.85) {
      cap = 39;
    } else if (ss.severity === "hard" && ss.coverage >= 0.70 && nonAlpha <= 4) {
      cap = 39;
    }
  } else {
    // soft: opzionalmente scendi a 39 solo se è "super ovvia" (tipo Juventus2024!)
    const tokensCount = ss.tokens ? ss.tokens.length : 0;
    const firstTokenLen = ss.tokens && ss.tokens[0] ? ss.tokens[0].length : 0;
    const isNameSet = (ss.sets || []).includes("nomi");

    const superObviousSoft =
    ss.coverage >= 0.95 &&
    nonAlpha <= 4 &&
  (
    (tokensCount === 1 && firstTokenLen >= 6) ||   // es. Juventus2024!
    (tokensCount >= 2)                              // es. cane+gatto2025
  ) &&
  !isNameSet;


    if (superObviousSoft) cap = 39;
  }

  score = Math.min(score, cap);
}

  if ((pw || "").length < 12 && patterns.some(pt => pt.type === "YEAR_OR_DATE")) {
  score = Math.min(score, 49);
}
if ((pw || "").length >= 12 && patterns.some(pt => pt.type === "YEAR_OR_DATE")) {
  score = Math.min(score, 59);
}


    // Step F: CAP per frasi composte da più parole di dizionario (es. CiaoMondo2025!)
  const md = patterns.find(pt => pt.type === "MULTI_DICTIONARY_WORDS");
  if (md) {
    let cap = 59;
    if (md.coverage >= 0.85) cap = 39;
    score = Math.min(score, cap);
  }

    // CAP: passphrase "wordy" (testo naturale) -> non deve mai risultare "fortissima"
  const wp = patterns.find(pt => pt.type === "WORDY_PASSPHRASE");
  if (wp) {
    let cap = 49; // base: penalità significativa ma non “uccide” tutto

    // super-ovvia: quasi tutta parole + decorazione minima -> più severo
    if (wp.coverage >= 0.95 && (wp.nonAlpha ?? 0) <= 4) cap = 39;

    score = Math.min(score, cap);
  }

// CAP finale: POP_CULTURE sempre massimo 39
if (patterns.some(p => p.type === "POP_CULTURE")) {
  score = Math.min(score, 39);
}

// CAP finale: password < 12 caratteri -> max 69 (sempre)
if ((pw || "").length < 12) {
  score = Math.min(score, 69);
}

 // CAP extra: se la password è corta (<12) e mostra pattern a bassa entropia, max 49
if ((pw || "").length < 12) {
  const lowEntropyTypes = new Set([
    "DICTIONARY",
    "COMMON_EXACT",
    "DECORATED_COMMON",
    "MULTI_DICTIONARY_WORDS",
    "SMALL_SET_WORDS",
    "WORDY_PASSPHRASE",
    "CONSECUTIVE_PATTERN",
    "ALL_SAME_CHAR",
    "REPEAT_2",
    "REPEAT_3PLUS",
    "LOW_UNIQUENESS",
    "PERSONAL_INFO"
  ]);

  if (patterns.some(p => lowEntropyTypes.has(p.type))) {
    score = Math.min(score, 49);
  }
}
 


// CAP: sequenze ovvie e quasi-ovvie
if (
  patterns.some(pt => pt.type === "CONSECUTIVE_PATTERN") ||
  patterns.some(pt => pt.type === "NEAR_CONSECUTIVE_PATTERN")
) {
  score = Math.min(score, 49);
}

  const level = strengthLabel(score);
  return { score, level, patterns };

}


function generateFeedback(evaluation) {
  const tips = [];
  const patterns = evaluation?.patterns || [];

  const has = (t) => patterns.some(p => p.type === t);
  const find = (t) => patterns.find(p => p.type === t);

  if (has("TOO_SHORT")) tips.push("Aumenta la lunghezza (minimo 8 caratteri).");
  if (has("MISSING_SYMBOL")) tips.push("Aggiungi almeno un simbolo (es. ! ? @ #).");
  if (has("MISSING_UPPER")) tips.push("Aggiungi almeno una lettera maiuscola.");
  if (has("MISSING_LOWER")) tips.push("Aggiungi almeno una lettera minuscola.");
  if (has("MISSING_DIGIT")) tips.push("Aggiungi almeno un numero.");

  if (has("CONSECUTIVE_PATTERN")) tips.push("Evita sequenze ovvie (es. 1234, abcd).");
  if (has("NEAR_CONSECUTIVE_PATTERN")) tips.push("Evita quasi-sequenze (es. abcdfef, 123569): sono molto prevedibili.");

  if (has("REPEAT_3PLUS")) tips.push("Evita ripetizioni di caratteri (es. aaa).");
  else if (has("REPEAT_2")) tips.push("Evita caratteri uguali consecutivi (es. AA, 11).");

  if (has("ALL_SAME_CHAR")) tips.push("Password troppo prevedibile: è composta da un solo carattere ripetuto.");
  if (has("LOW_UNIQUENESS")) tips.push("Password prevedibile: usa più caratteri diversi (evita schemi ripetitivi).");


  if (has("DICTIONARY")) {
    const d = find("DICTIONARY");
    tips.push("Evita parole/password comuni e facilmente indovinabili (dizionario).");
    // opzionale: potremmo mostrare d.matched, ma per UI meglio non esporre troppo 
  }

    if (has("MULTI_DICTIONARY_WORDS")) {
    tips.push("Password prevedibile: composta da più parole comuni (frase troppo facile da indovinare).");
  }


  if (has("COMMON_EXACT")) {
  const c = find("COMMON_EXACT");
  tips.push(`Password troppo comune: corrisponde esattamente (o quasi) a “${c.word}”. Scegline una diversa e meno prevedibile.`);
}


  if (has("DECORATED_COMMON")) {
  const d = find("DECORATED_COMMON");
  tips.push(`Password prevedibile: contiene una parola molto comune (“${d.word}”) con piccole decorazioni. Usa parole meno comuni o aggiungi una parte davvero unica.`);
  }

    if (has("SMALL_SET_WORDS")) {
    const ss = patterns.find(p => p.type === "SMALL_SET_WORDS");
    const sets = ss?.sets?.length ? ss.sets.join(", ") : "parole comuni";
    tips.push(
      `Password prevedibile: composta in gran parte da ${sets}. Evita parole ovvie (colori/mesi/giorni/città/squadre/animali) oppure aggiungi una parte davvero unica e non collegata a dizionari.`
    );
  }

    if (has("WORDY_PASSPHRASE")) {
    tips.push("Password prevedibile: sembra una frase o combinazione di parole (testo naturale). Preferisci una password casuale oppure una passphrase molto lunga con parole non ovvie e separatori.");
  }

    if (has("POP_CULTURE")) {
    tips.push("Password prevedibile: contiene riferimenti pop-culture (personaggi/serie/film) spesso usati nelle password. Evita nomi famosi + anno/simboli.");
  }

  if (has("YEAR_OR_DATE")) tips.push("Evita anni o date (es. 1998, 2024, 12/05): sono tra i primi tentativi.");




  if (has("PERSONAL_INFO")) {
    tips.push("Evita di includere nome/cognome o parti dell’email nella password.");
  }

  // consiglio “di UX” 
  if ((evaluation?.score ?? 0) < 80) tips.push("Una password di 16+ caratteri ha più possibilità di raggiungere un punteggio alto (Basic16).");

  return tips;
}






function evaluatePassword(pw, personalTokens){
  const tips = [];
  const p = pw || "";
  const len = p.length;

  if (!p) return { score: 0, level: "Molto debole", tips: ["Inizia a digitare una password."] };

  /* ========== BASIC16 ========== */
  const first8 = Math.min(len, 8);
  const rest = Math.max(len - 8, 0);
  let scoreBasic16 = first8 * 4 + rest * 8;
  scoreBasic16 = Math.min(100, scoreBasic16);

  /* ========== COMPREHENSIVE8 ========== */
  const hasLower = /[a-z]/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasDigit = /\d/.test(p);
  const hasSym   = /[^A-Za-z0-9]/.test(p);

  let scoreComp8 = 0;

  if (len >= 8) {
    scoreComp8 = len * 4;

    // bonus 17 (come nel testo) per la presenza di: maiuscole, cifre, simboli
    if (hasUpper) scoreComp8 += 17;
    if (hasDigit) scoreComp8 += 17;
    if (hasSym)   scoreComp8 += 17;

    // bonus per varietà (tutte le classi)
    const variety = [hasLower, hasUpper, hasDigit, hasSym].filter(Boolean).length;
    if (variety === 4) scoreComp8 += 10;

    // penalità se mancano completamente minuscole
    if (!hasLower) {
      scoreComp8 -= 15;
      tips.push("Aggiungi lettere minuscole.");
    }
  } else {
    tips.push("Usa almeno 8 caratteri per soddisfare Comprehensive8.");
  }

  /* ========== PENALITÀ PATTERN / STRUTTURA ========== */

  // Pattern consecutivi (1234, qwerty, asdf...)
  if (hasConsecutivePattern(p)) {
    scoreBasic16 -= 14;
    scoreComp8   -= 14;
    tips.push("Evita sequenze/pattern consecutivi (es. 1234, qwerty, asdf).");
  }

  // Caratteri uguali di fila (AA, 11, bb...)
  if (/(.)\1\1/.test(p)) {
    scoreBasic16 -= 12;
    scoreComp8   -= 12;
    tips.push("Evita ripetizioni lunghe (es. AAA, 111).");
  } else if (/(.)\1/.test(p)) {
    scoreBasic16 -= 6;
    scoreComp8   -= 6;
    tips.push("Evita caratteri uguali consecutivi (es. AA, 11).");
  }

  // Mancanza simboli (penalità esplicita)
  if (!hasSym) {
    scoreBasic16 -= 8;
    scoreComp8   -= 8;
    tips.push("Aggiungi almeno un simbolo (es. ! ? @ #).");
  }

  // Mancanza maiuscole (penalità esplicita)
  if (!hasUpper) {
    scoreBasic16 -= 8;
    scoreComp8   -= 8;
    tips.push("Aggiungi almeno una lettera maiuscola.");
  }

  /* ========== PENALITÀ DIZIONARIO (NUOVA) ========== */
  const dict = dictionaryHits(p);
  if (dict.hits > 0) {
    // Penalità: più forte se la password è (quasi) "parola comune"
    // - se contiene parole comuni: -12
    // - se è esattamente una parola comune o molto simile: aggiungiamo extra
    const s = deleetForDictionary(normalize(p));

    const exact = COMMON_WORDS.includes(s);
    const pen = Math.min(30, 12 + (exact ? 10 : 0) + (dict.hits - 1) * 4);

    scoreBasic16 -= pen;
    scoreComp8   -= pen;

    tips.push("Evita parole/password comuni e facilmente indovinabili (dizionario).");
  }

  /* ========== PENALITÀ INFO PERSONALI ========== */
  const np = normalize(p);
  let hits = 0;
  for (const t of personalTokens) {
    if (t && t.length >= 3 && np.includes(t)) hits++;
  }
  if (hits) {
    const pen = Math.min(20, hits * 6);
    scoreBasic16 -= pen;
    scoreComp8   -= pen;
    tips.push("Evita di includere nome, cognome o email nella password.");
  }

  /* ========== SCORE FINALE (baseline) ========== */
  let score = Math.max(scoreBasic16, scoreComp8);
  score = Math.max(0, Math.min(100, Math.round(score)));

  /* ========== SUGGERIMENTI GENERALI ========== */
  if (len < 16) tips.push("Una password di 16+ caratteri ha più possibilità di raggiungere un punteggio alto (Basic16).");
  if (!hasDigit) tips.push("Aggiungi un numero.");

  const level = strengthLabel(score);
  return { score, level, tips: [...new Set(tips)] };
}

function validateFinal(pw, personalTokens = []) {
  // difesa: se arriva qualcosa di diverso da array, lo ignoro
  const tokens = Array.isArray(personalTokens) ? personalTokens : [];

  // --- personal info anche con sostituzioni leet (0->o, 1->i, 3->e, 4->a, 5->s, 7->t, 8->b, 9->g) ---
  const deLeet = (s) => normalize(s)
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/8/g, "b")
    .replace(/9/g, "g");

  const pwDL = deLeet(pw);
  const tokensDL = tokens.map(deLeet);

  // se un token personale (>=3) appare nella password anche in forma leet, boccia
  if (tokensDL.some(t => t.length >= 3 && pwDL.includes(t))) {
    return { ok:false, msg:"Evita nome/cognome o parti dell’email (anche con sostituzioni tipo 0→o, 1→i)." };
  }

  
  const patterns = detectPatterns(pw, tokens);
    if (patterns.some(p => p.type === "PERSONAL_INFO")) {
    return { ok:false, msg:"Evita di includere nome/cognome o parti dell’email nella password." };
  }


  if (patterns.some(p => p.type === "TOO_SHORT")) {
    return { ok:false, msg:"Minimo 8 caratteri." };
  }
  if (patterns.some(p => p.type === "MISSING_LOWER")) {
    return { ok:false, msg:"Aggiungi almeno una lettera minuscola." };
  }
  if (patterns.some(p => p.type === "MISSING_UPPER")) {
    return { ok:false, msg:"Aggiungi almeno una lettera maiuscola." };
  }
  if (patterns.some(p => p.type === "MISSING_DIGIT")) {
    return { ok:false, msg:"Aggiungi almeno un numero." };
  }
  if (patterns.some(p => p.type === "MISSING_SYMBOL")) {
    return { ok:false, msg:"Aggiungi almeno un simbolo (es. ! ? @ #)." };
  }

  const evaluation = evaluate(pw, tokens);
  if (evaluation.score < 40) {
    return { ok:false, msg:"Password troppo debole (minimo: Discreta)." };
  }

  return { ok:true, msg:"OK" };
}



  global.PSMEngine = {
    normalize,
    emailParts,
    evaluate,
    generateFeedback,
    validateFinal,

    // extra utili (debug/esperimenti, non obbligatori per la UI)
    strengthLabel,
    evaluatePassword,
    detectPatterns,
    dictionaryHits,
    hasConsecutivePattern,
    deleetForDictionary,
    tokenizeWords
  };
  // Dual-mode: in Node esporta anche via module.exports
if (typeof module === "object" && module.exports) {
  module.exports = global.PSMEngine;
}

})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this));


