import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import { parseInline } from "./richtext";
import type { Resume, Section } from "./types";

const mmToTwips = (value: number) => Math.round((value * 1440) / 25.4);
const pxToTwips = (value: number) => Math.round(value * 15);

const runs = (
  value: string,
  base: {
    bold?: boolean;
    italics?: boolean;
    size: number;
    font: string;
    color: string;
    characterSpacing: number;
  },
) =>
  parseInline(value).map((token) => {
    const run = new TextRun({
      text: token.text,
      bold: Boolean(base.bold || token.bold),
      italics: Boolean(base.italics || token.italic),
      size: base.size,
      font: base.font,
      color: base.color,
      characterSpacing: base.characterSpacing,
      ...(token.kind === "link" ? { style: "Hyperlink" } : {}),
    });
    return token.kind === "link"
      ? new ExternalHyperlink({ children: [run], link: token.url })
      : run;
  });

export async function buildResumeDocx(resume: Resume, fitScale = 1): Promise<Blob> {
  const scale = resume.design.fitOnePage ? Math.max(0.45, Math.min(1, fitScale)) : 1;
  const design = {
    ...resume.design,
    fontSize: resume.design.fontSize * scale,
    sectionSpacing: resume.design.sectionSpacing * scale,
    headingRuleGap: resume.design.headingRuleGap * scale,
    headingSpaceAfter: resume.design.headingSpaceAfter * scale,
    entrySpacing: resume.design.entrySpacing * scale,
    bulletSpacing: resume.design.bulletSpacing * scale,
    bulletIndent: resume.design.bulletIndent * scale,
    itemSpacing: resume.design.itemSpacing * scale,
  };
  const font = (design.fontFamily.split(",")[0] ?? "Arial").trim().replace(/["']/g, "");
  const resolvedFont = /^(ui-|system-)/.test(font) ? "Arial" : font;
  const color = (value: string) => value.replace(/^#/, "");
  const contentWidth = 11906 - mmToTwips(design.marginLeft + design.marginRight);
  const size = Math.round(design.fontSize * 2);
  const base = {
    size,
    font: resolvedFont,
    color: color(design.textColor),
    characterSpacing: Math.round(design.letterSpacing * design.fontSize * 20),
  };
  const alignment = (value: "left" | "center" | "right") =>
    value === "center"
      ? AlignmentType.CENTER
      : value === "right"
        ? AlignmentType.RIGHT
        : AlignmentType.LEFT;
  const line = Math.round(design.lineHeight * 240);
  const headingSize = Math.round(size * resume.design.headingScale);

  const heading = (section: Section) => {
    const rule = section.rule ?? design.headingRule;
    return new Paragraph({
      alignment: alignment(section.align ?? design.headingAlign),
      keepNext: true,
      spacing: {
        before: pxToTwips(
          section.spaceBefore === undefined ? design.sectionSpacing : section.spaceBefore * scale,
        ),
        after: pxToTwips(design.headingSpaceAfter),
        line: 276,
      },
      ...(rule
        ? {
            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                size: Math.max(1, Math.round((section.ruleWidth ?? design.headingRuleWidth) * 8)),
                color: color(design.accentColor),
                space: Math.round(design.headingRuleGap * 0.75),
              },
            },
          }
        : {}),
      children: [
        new TextRun({
          ...base,
          text: design.uppercaseHeadings ? section.title.toUpperCase() : section.title,
          bold: section.boldTitle ?? design.boldSectionTitles,
          size: headingSize,
          color: color(design.headingColor),
        }),
      ],
    });
  };

  const tabbedRow = (
    left: string,
    right: string,
    bold: boolean,
    width: number,
    gap = 0,
    keepNext = false,
  ) =>
    new Paragraph({
      spacing: { before: gap, after: 0, line },
      keepNext,
      tabStops: [{ type: "right" as const, position: width }],
      children: [
        ...runs(left, { ...base, bold }),
        ...(right ? [new TextRun({ ...base, text: "\t" })] : []),
        ...runs(right, { ...base, bold }),
      ],
    });

  const bulletParagraph = (text: string) =>
    new Paragraph({
      spacing: { before: pxToTwips(design.bulletSpacing), after: 0, line },
      tabStops: [
        {
          type: "left" as const,
          position: pxToTwips(design.bulletIndent) + Math.round(design.fontSize * 20 * 0.85),
        },
      ],
      indent: {
        left: pxToTwips(design.bulletIndent) + Math.round(design.fontSize * 20 * 0.85),
        hanging: Math.round(design.fontSize * 20 * 0.85),
      },
      children: [new TextRun({ ...base, text: "•\t" }), ...runs(text, base)],
    });

  const sectionParagraphs = (section: Section, width: number): Paragraph[] => {
    const out: Paragraph[] = [heading(section)];
    if (section.layout === "entries") {
      for (const [index, entry] of section.entries.entries()) {
        if (entry.title || entry.right)
          out.push(
            tabbedRow(
              entry.title,
              entry.right,
              false,
              width,
              index > 0 ? pxToTwips(design.entrySpacing) : 0,
              Boolean(entry.subtitle || entry.subtitleRight || entry.bullets.length),
            ),
          );
        if (entry.subtitle || entry.subtitleRight)
          out.push(
            tabbedRow(
              entry.subtitle,
              entry.subtitleRight,
              false,
              width,
              0,
              entry.bullets.length > 0,
            ),
          );
        for (const bullet of entry.bullets) out.push(bulletParagraph(bullet.text));
      }
    } else if (section.layout === "bullets") {
      for (const item of section.items) out.push(bulletParagraph(item.text));
    } else if (section.layout === "lines") {
      for (const item of section.items)
        out.push(
          new Paragraph({
            spacing: {
              before: pxToTwips(
                section.itemSpacing === undefined
                  ? design.itemSpacing
                  : section.itemSpacing * scale,
              ),
              line,
            },
            children: runs(item.text, base),
          }),
        );
    } else {
      for (const group of section.groups)
        out.push(
          new Paragraph({
            spacing: {
              before: pxToTwips(
                section.itemSpacing === undefined
                  ? design.itemSpacing
                  : section.itemSpacing * scale,
              ),
              line,
            },
            children: [
              new TextRun({ ...base, text: `${group.label}: `, bold: true }),
              ...runs(group.text, base),
            ],
          }),
        );
    }
    return out;
  };

  const visible = resume.sections.filter((s) => !s.hidden);
  const side = visible.filter((s) => s.column === "side");
  const main = visible.filter((s) => s.column === "main");

  const header: Paragraph[] = [
    new Paragraph({
      alignment: alignment(design.headerAlign),
      children: [
        new TextRun({
          ...base,
          text: resume.name,
          smallCaps: design.nameSmallCaps,
          size: Math.round(size * design.headingScale * 2.15),
          color: color(design.headingColor),
        }),
      ],
    }),
    ...(resume.location
      ? [
          new Paragraph({
            alignment: alignment(design.headerAlign),
            children: [new TextRun({ ...base, text: resume.location })],
          }),
        ]
      : []),
    new Paragraph({
      alignment: alignment(design.headerAlign),
      spacing: { after: 60 },
      children: resume.contacts.flatMap((contact, index) => [
        ...(index > 0 ? [new TextRun({ ...base, text: "  |  " })] : []),
        ...(contact.url
          ? [
              new ExternalHyperlink({
                children: [
                  new TextRun({ ...base, text: contact.label, color: color(design.accentColor) }),
                ],
                link: contact.url,
              }),
            ]
          : [new TextRun({ ...base, text: contact.label })]),
      ]),
    }),
  ];

  const sideWidth = Math.round((contentWidth * resume.design.columnSplit) / 100);
  const mainWidth = contentWidth - sideWidth;

  const body =
    side.length > 0
      ? [
          new Table({
            width: { size: contentWidth, type: WidthType.DXA },
            columnWidths: [sideWidth, mainWidth],
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: sideWidth, type: WidthType.DXA },
                    margins: {
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: Math.round(mmToTwips(design.columnGap) / 2),
                    },
                    children: side.flatMap((s) =>
                      sectionParagraphs(s, sideWidth - Math.round(mmToTwips(design.columnGap) / 2)),
                    ),
                  }),
                  new TableCell({
                    width: { size: mainWidth, type: WidthType.DXA },
                    margins: {
                      top: 0,
                      bottom: 0,
                      right: 0,
                      left: Math.round(mmToTwips(design.columnGap) / 2),
                    },
                    children: main.flatMap((s) =>
                      sectionParagraphs(s, mainWidth - Math.round(mmToTwips(design.columnGap) / 2)),
                    ),
                  }),
                ],
              }),
            ],
          }),
        ]
      : main.flatMap((s) => sectionParagraphs(s, contentWidth));

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: base,
          paragraph: { spacing: { before: 0, after: 0, line }, alignment: AlignmentType.LEFT },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: {
              top: mmToTwips(design.marginTop),
              right: mmToTwips(design.marginRight),
              bottom: mmToTwips(design.marginBottom),
              left: mmToTwips(design.marginLeft),
            },
          },
        },
        children: [...header, ...body],
      },
    ],
  });

  return Packer.toBlob(doc);
}
