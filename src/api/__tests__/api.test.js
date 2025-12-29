const request = require("supertest");
const { app } = require("../server");

describe("API - basic endpoints", () => {
  test("GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe("psm-api");
  });

  test("POST /api/evaluate (ok)", async () => {
    const res = await request(app)
      .post("/api/evaluate")
      .send({ password: "Xq!9vP#2mZ$7sL@8" });

    expect(res.status).toBe(200);
    expect(typeof res.body.score).toBe("number");
    expect(typeof res.body.level).toBe("string");
    expect(Array.isArray(res.body.patterns)).toBe(true);
  });

  test("POST /api/evaluate includeFeedback=true deve includere suggestions", async () => {
    const res = await request(app)
      .post("/api/evaluate")
      .send({ password: "Xq!9vP#2mZ$7sL@8", options: { includeFeedback: true } });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.suggestions)).toBe(true);
  });

  test("POST /api/evaluate (bad request: missing password)", async () => {
    const res = await request(app)
      .post("/api/evaluate")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("BadRequest");
  });

  test("POST /api/validate (ok/fail)", async () => {
    const ok = await request(app)
      .post("/api/validate")
      .send({ password: "Xq!9vP#2mZ$7sL@8" });

    expect(ok.status).toBe(200);
    expect(ok.body.ok).toBe(true);

    const bad = await request(app)
      .post("/api/validate")
      .send({ password: "aaa" });

    expect(bad.status).toBe(200);
    expect(bad.body.ok).toBe(false);
  });
});

describe("API - optional API key auth", () => {
  const OLD = process.env.PSM_API_KEY;

  afterEach(() => {
    if (OLD === undefined) delete process.env.PSM_API_KEY;
    else process.env.PSM_API_KEY = OLD;
  });

  test("Se PSM_API_KEY è settata: senza x-api-key -> 401", async () => {
    process.env.PSM_API_KEY = "secret";
    const res = await request(app).post("/api/evaluate").send({ password: "Xq!9vP#2mZ$7sL@8" });
    expect(res.status).toBe(401);
  });

  test("Se PSM_API_KEY è settata: x-api-key errata -> 403", async () => {
    process.env.PSM_API_KEY = "secret";
    const res = await request(app)
      .post("/api/evaluate")
      .set("x-api-key", "wrong")
      .send({ password: "Xq!9vP#2mZ$7sL@8" });

    expect(res.status).toBe(403);
  });

  test("Se PSM_API_KEY è settata: x-api-key corretta -> 200", async () => {
    process.env.PSM_API_KEY = "secret";
    const res = await request(app)
      .post("/api/evaluate")
      .set("x-api-key", "secret")
      .send({ password: "Xq!9vP#2mZ$7sL@8" });

    expect(res.status).toBe(200);
    expect(typeof res.body.score).toBe("number");
  });
});
