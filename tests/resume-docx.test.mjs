import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import JSZip from "jszip";
import test from "node:test";

registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier.startsWith("./") &&
      context.parentURL?.includes("/src/lib/resume/") &&
      !/\.[a-z]+$/.test(specifier)
    ) {
      for (const ext of [".ts", ".tsx"]) {
        if (existsSync(fileURLToPath(new URL(specifier + ext, context.parentURL))))
          return next(specifier + ext, context);
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".tsx") && url.includes("/src/lib/resume/")) {
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
        }).outputText,
      };
    }
    return next(url, context);
  },
});
const { defaultResume } = await import("../src/lib/resume/data.ts");
const { buildResumeDocx } = await import("../src/lib/resume/docx.ts");

test("DOCX preserves global bullet justification and section overrides", async () => {
  const resume = structuredClone(defaultResume);
  resume.design.bulletAlign = "justify";
  const entrySection = resume.sections.find((s) => s.layout === "entries");
  entrySection.entries = [entrySection.entries[0]];
  entrySection.entries[0].bullets = [{ id: "global-bullet", text: "GLOBAL_ALIGNMENT_PROBE" }];
  const bullets = resume.sections.find((s) => s.layout === "bullets");
  bullets.bulletAlign = "right";
  bullets.items = [{ id: "override-bullet", text: "OVERRIDE_ALIGNMENT_PROBE" }];
  resume.sections = [entrySection, bullets];
  const blob = await buildResumeDocx(resume);
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const xml = await zip.file("word/document.xml").async("string");
  const paragraphs = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g);
  assert.match(
    paragraphs.find((p) => p.includes("GLOBAL_ALIGNMENT_PROBE")),
    /<w:jc w:val="both"\s*\/>/,
  );
  assert.match(
    paragraphs.find((p) => p.includes("OVERRIDE_ALIGNMENT_PROBE")),
    /<w:jc w:val="right"\s*\/>/,
  );
});
