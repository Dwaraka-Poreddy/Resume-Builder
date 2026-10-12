import assert from "node:assert/strict";
import test from "node:test";
import { paginateColumns } from "../src/lib/resume/pagination.ts";

test("each column flows independently with header space reserved only on page one", () => {
  const { pages } = paginateColumns(
    [
      [60, 30],
      [40, 40, 50],
    ],
    100,
    20,
  );
  assert.deepEqual(pages, [
    [[0], [0, 1]],
    [[1], [2]],
  ]);
});

test("exact page fits do not add blank pages", () => {
  assert.deepEqual(paginateColumns([[], [80, 100]], 100, 20).pages, [
    [[], [0]],
    [[], [1]],
  ]);
});

test("oversized content is retained and flagged instead of dropped", () => {
  const { pages, oversized } = paginateColumns([[], [120, 30]], 100, 20);
  assert.equal(oversized, true);
  assert.deepEqual(pages, [
    [[], [0]],
    [[], [1]],
  ]);
});
