import assert from "node:assert/strict";
import test from "node:test";
import { nextFitScale, MAX_FIT_PASSES } from "../src/lib/resume/fit.ts";

test("auto-fit cannot oscillate between growing and shrinking around a line wrap", () => {
  let fit = 1;
  for (let pass = 0; pass < 100; pass++) {
    const previous = fit;
    fit = nextFitScale(fit, pass % 2 ? 940 : 1050, 1000, 14, pass);
    assert.ok(fit <= previous);
    assert.ok(fit >= 9 / 14);
  }
});

test("oversized content stops at the readability floor and pass budget", () => {
  assert.equal(nextFitScale(1, 5000, 1000, 14, 0), 9 / 14);
  assert.equal(nextFitScale(0.8, 1500, 1000, 14, MAX_FIT_PASSES), 0.8);
  assert.equal(nextFitScale(1, 5000, 1000, 8, 0), 1);
});

test("empty, invalid and already-fitting measurements do not trigger state updates", () => {
  for (const height of [0, NaN, Infinity, 999, 1000, 1000.4]) {
    assert.equal(nextFitScale(1, height, 1000, 14, 0), 1);
  }
  assert.equal(nextFitScale(1, 1500, 0, 14, 0), 1);
});
