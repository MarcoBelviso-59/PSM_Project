(function (global) {
  'use strict';

  // INCOLLA QUI SOTTO TUTTO IL BLOCCO "ENGINE" PRESO DA src/web/app.js
  // (da: function normalize(...)
  //  fino a: fine di function validateFinal(...))
  //
  // IMPORTANTISSIMO:
  // - NON includere la riga "const $ = (id) => document.getElementById(id);"
  // - NON includere "const descMap = {...};"
  // - NON includere nulla dopo il commento "/* UI */"

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
})(window);

