const engine = require("../../engine/psmEngine.js");

describe("Engine - core rules", () => {
  test("POP_CULTURE deve imporre cap massimo (<= 39) e segnalare pattern", () => {
    const out = engine.evaluate("Goku2025!!", []);
    expect(out.score).toBeLessThanOrEqual(39);
    expect(out.patterns.some(p => p.type === "POP_CULTURE")).toBe(true);
  });

  test("Sequenze consecutive devono essere rilevate", () => {
    const out = engine.evaluate("abcd1234", []);
    expect(out.patterns.some(p => p.type === "CONSECUTIVE_PATTERN")).toBe(true);
  });

  test("validateFinal: token personali anche in leet devono bocciare", () => {
    const res = engine.validateFinal("M4rc0!!2025aA", ["marco"]);
    expect(res.ok).toBe(false);
  });

  test("validateFinal: password forte deve passare", () => {
    const res = engine.validateFinal("Xq!9vP#2mZ$7sL@8", []);
    expect(res.ok).toBe(true);
  });

  test("validateFinal: troppo corta deve fallire", () => {
    const res = engine.validateFinal("Aa1!", []);
    expect(res.ok).toBe(false);
  });
});
