import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

// Node strips TypeScript; resolve the extensionless imports used by Vite.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith("./") &&
      context.parentURL?.includes("/src/lib/resume/") &&
      !specifier.endsWith(".ts")
    ) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { defaultResume, defaultDesign } = await import("../src/lib/resume/data.ts");
const { parseResumeJson, serializeResumeJson } = await import("../src/lib/resume/json.ts");

test("export/import preserves all content, design and section overrides", () => {
  const resume = structuredClone(defaultResume);
  resume.name = "José — 李";
  resume.design.fontFamily = "Calibri, Arial, sans-serif";
  Object.assign(resume.sections[0], {
    hidden: true,
    boldTitle: false,
    rule: false,
    ruleWidth: 2,
    align: "right",
    spaceBefore: 12,
    itemSpacing: 3,
  });
  assert.deepEqual(parseResumeJson(serializeResumeJson("Engineering resume", resume)), {
    title: "Engineering resume",
    data: resume,
  });
});

test("raw resume JSON and missing older design settings are supported", () => {
  const resume = { ...defaultResume, design: { fontSize: 11 } };
  const result = parseResumeJson(JSON.stringify(resume), "From file");
  assert.equal(result.title, "From file");
  assert.deepEqual(result.data.design, { ...defaultDesign, fontSize: 11 });
});

test("invalid JSON and unrelated JSON are rejected", () => {
  for (const input of ["{", "null", "[]", "{}", '{"hello":"world"}']) {
    assert.throws(() => parseResumeJson(input), /JSON/);
  }
});

test("invalid nested content and design are rejected before import", () => {
  for (const modify of [
    (r) => {
      r.sections[0].entries[0].bullets = null;
    },
    (r) => {
      r.sections[0].layout = "unknown";
    },
    (r) => {
      r.design.fontSize = "large";
    },
    (r) => {
      r.design.fontSize = -1;
    },
    (r) => {
      r.contacts[0].label = 123;
    },
  ]) {
    const resume = structuredClone(defaultResume);
    modify(resume);
    assert.throws(() => parseResumeJson(JSON.stringify(resume)), /Invalid resume JSON/);
  }
});

test("unsupported export versions are rejected", () => {
  assert.throws(
    () => parseResumeJson(JSON.stringify({ version: 2, title: "Test", data: defaultResume })),
    /version is not supported/,
  );
});

test("UTF-8 BOM is accepted and database metadata is not exported", () => {
  const text = serializeResumeJson("Test", {
    ...defaultResume,
    user_id: "private",
    id: "database-id",
  });
  assert.deepEqual(Object.keys(JSON.parse(text)), ["version", "title", "data"]);
  assert.equal(text.includes("private"), false);
  assert.deepEqual(parseResumeJson(`\uFEFF${text}`).data, defaultResume);
});
