"use strict";

const zxcvbn = require("zxcvbn");

// Normalizzazione: zxcvbn score (0..4) -> 0..100
function score0to4_to_0to100(s) {
  return Math.max(0, Math.min(100, Number(s) * 25));
}

/**
 * Baseline zxcvbn
 * @param {string} password
 * @param {string[]} userInputs - tokens personali (nome, città, anno...) da passare a zxcvbn
 */
function baselineZxcvbn(password, userInputs = []) {
  const inputs = Array.isArray(userInputs) ? userInputs : [];
  const res = zxcvbn(String(password), inputs);

  return {
    baseline: "zxcvbn",
    score_0_4: res.score,
    score_0_100: score0to4_to_0to100(res.score),
    guesses: res.guesses,
    guesses_log10: res.guesses_log10
  };
}

module.exports = { baselineZxcvbn };
