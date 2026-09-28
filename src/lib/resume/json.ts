import { z } from "zod";
import { defaultDesign } from "./data";
import type { Resume } from "./types";

const number = z.number().finite();
const spacing = number.nonnegative();
const align = z.enum(["left", "center", "right"]);
const id = z.string().min(1);
const bullet = z.object({ id, text: z.string() });
const design = z.object({
  fontFamily: z.string().min(1),
  textColor: z.string(),
  headingColor: z.string(),
  accentColor: z.string(),
  fontSize: number.positive(),
  headingScale: number.positive(),
  lineHeight: number.positive(),
  sectionSpacing: spacing,
  columnSplit: number.gt(0).lt(100),
  letterSpacing: number,
  uppercaseHeadings: z.boolean(),
  nameSmallCaps: z.boolean(),
  fitOnePage: z.boolean(),
  boldSectionTitles: z.boolean(),
  headingRule: z.boolean(),
  headingRuleWidth: spacing,
  headingRuleGap: spacing,
  headingSpaceAfter: spacing,
  headingAlign: align,
  headerAlign: align,
  entrySpacing: spacing,
  bulletSpacing: spacing,
  bulletIndent: spacing,
  itemSpacing: spacing,
  columnGap: spacing,
  marginTop: spacing.max(100),
  marginRight: spacing.max(100),
  marginBottom: spacing.max(100),
  marginLeft: spacing.max(100),
});

export const resumeJsonSchema = z.object({
  name: z.string(),
  location: z.string(),
  contacts: z.array(z.object({ id, label: z.string(), url: z.string() })),
  sections: z.array(
    z.object({
      id,
      title: z.string(),
      layout: z.enum(["entries", "bullets", "groups", "lines"]),
      column: z.enum(["main", "side"]),
      hidden: z.boolean(),
      entries: z.array(
        z.object({
          id,
          title: z.string(),
          right: z.string(),
          subtitle: z.string(),
          subtitleRight: z.string(),
          bullets: z.array(bullet),
        }),
      ),
      items: z.array(bullet),
      groups: z.array(z.object({ id, label: z.string(), text: z.string() })),
      boldTitle: z.boolean().optional(),
      rule: z.boolean().optional(),
      ruleWidth: spacing.optional(),
      align: align.optional(),
      spaceBefore: spacing.optional(),
      itemSpacing: spacing.optional(),
    }),
  ),
  // Older exports may predate newly added design controls.
  design: design
    .partial()
    .default({})
    .transform((value) => ({ ...defaultDesign, ...value }))
    .pipe(design),
});

const fileSchema = z.object({
  version: z.literal(1),
  title: z.string().trim().min(1).max(120),
  data: resumeJsonSchema,
});

export const MAX_RESUME_JSON_BYTES = 5 * 1024 * 1024;

export function parseResumeJson(
  text: string,
  fallbackTitle = "Imported resume",
): { title: string; data: Resume } {
  let value: unknown;
  try {
    value = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    throw new Error("This file is not valid JSON. Choose a resume JSON export.");
  }
  const wrapped =
    typeof value === "object" && value !== null && ("version" in value || "data" in value);
  if (typeof value === "object" && value !== null && "version" in value && value.version !== 1) {
    throw new Error("This resume JSON version is not supported.");
  }
  const result = fileSchema.safeParse(
    wrapped
      ? value
      : {
          version: 1,
          title: fallbackTitle.trim().slice(0, 120) || "Imported resume",
          data: value,
        },
  );
  if (!result.success) {
    const field = result.error.issues[0]?.path.join(".") || "resume";
    throw new Error(
      `Invalid resume JSON: check ${field}. Choose a JSON file exported by Resume Builder.`,
    );
  }
  return { title: result.data.title, data: result.data.data };
}

export function serializeResumeJson(title: string, resume: unknown): string {
  const data = resumeJsonSchema.parse(resume);
  return JSON.stringify(
    { version: 1, title: title.trim().slice(0, 120) || "Untitled resume", data },
    null,
    2,
  );
}

export function downloadResumeJson(title: string, resume: unknown): void {
  const blob = new Blob([serializeResumeJson(title, resume)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${
    title
      // Strip control characters as well as characters forbidden in filenames.
      // eslint-disable-next-line no-control-regex
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
      .trim()
      .slice(0, 120) || "resume"
  }.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
