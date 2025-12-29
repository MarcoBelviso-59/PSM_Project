const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");
const { app } = require("../server");

describe("Experiments endpoints", () => {
  let tmpDir;
  let runId;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "psm-experiments-"));
    process.env.PSM_EXPERIMENTS_DIR = tmpDir;

    runId = "run_test_seed12345";
    const runDir = path.join(tmpDir, runId);
    fs.mkdirSync(runDir, { recursive: true });

    fs.writeFileSync(
      path.join(runDir, "meta.json"),
      JSON.stringify({ seed: 12345, createdAt: "test" }, null, 2),
      "utf8"
    );

    fs.writeFileSync(
      path.join(runDir, "results.json"),
      JSON.stringify({ results: [{ id: 1, score: 10 }, { id: 2, score: 90 }] }, null, 2),
      "utf8"
    );

    fs.writeFileSync(path.join(runDir, "results.csv"), "id,score\n1,10\n2,90\n", "utf8");
    fs.writeFileSync(path.join(runDir, "results.tsv"), "id\tscore\n1\t10\n2\t90\n", "utf8");
    fs.writeFileSync(path.join(runDir, "results_excel.csv"), "id;score\n1;10\n2;90\n", "utf8");
  });

  afterAll(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
    delete process.env.PSM_EXPERIMENTS_DIR;
  });

  test("GET /experiments lista runs", async () => {
    const res = await request(app).get("/experiments");
    expect(res.status).toBe(200);
    expect(res.body.runs).toContain(runId);
  });

  test("GET /experiments/:runId dettaglio + preview", async () => {
    const res = await request(app).get(`/experiments/${runId}?limit=1`);
    expect(res.status).toBe(200);
    expect(res.body.runId).toBe(runId);
    expect(res.body.meta).toBeTruthy();
    expect(Array.isArray(res.body.resultsPreview)).toBe(true);
    expect(res.body.resultsPreview.length).toBe(1);
  });

  test("GET /experiments/:runId/export format=csv", async () => {
    const res = await request(app).get(`/experiments/${runId}/export?format=csv`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.text).toContain("id,score");
  });

  test("GET /experiments/:runId/export format non supportato -> 400", async () => {
    const res = await request(app).get(`/experiments/${runId}/export?format=parquet`);
    expect(res.status).toBe(400);
  });

  test("GET /experiments/:runId inesistente -> 404", async () => {
    const res = await request(app).get(`/experiments/does_not_exist`);
    expect(res.status).toBe(404);
  });
});
