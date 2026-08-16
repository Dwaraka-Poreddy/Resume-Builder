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

const CONTENT_WIDTH = 9638; // A4 (11906 dxa) minus 2 x ~0.8in margins

const runs = (value: string, base: { bold?: boolean; italics?: boolean; size: number }) =>
  parseInline(value).map((token) => {
    const run = new TextRun({
      text: token.text,
      bold: Boolean(base.bold || token.bold),
      italics: Boolean(base.italics || token.italic),
      size: base.size,
      font: "Times New Roman",
      ...(token.kind === "link" ? { style: "Hyperlink" } : {}),
    });
    return token.kind === "link"
      ? new ExternalHyperlink({ children: [run], link: token.url })
      : run;
  });

export async function buildResumeDocx(resume: Resume): Promise<Blob> {
  const size = Math.round(resume.design.fontSize * 2);
  const headingSize = Math.round(size * resume.design.headingScale);

  const heading = (text: string) =>
    new Paragraph({
      spacing: { before: 160, after: 60 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "333333", space: 1 },
      },
      children: [
        new TextRun({
          text: resume.design.uppercaseHeadings ? text.toUpperCase() : text,
          bold: true,
          size: headingSize,
          font: "Times New Roman",
        }),
      ],
    });

  const tabbedRow = (left: string, right: string, bold: boolean, width: number, gap = 40) =>
    new Paragraph({
      spacing: { before: gap, after: 0 },
      tabStops: [{ type: "right" as const, position: width }],
      children: [
        ...runs(left, { bold, size }),
        ...(right ? [new TextRun({ text: "\t", size })] : []),
        ...runs(right, { bold, size }),
      ],
    });

  const bulletParagraph = (text: string) =>
    new Paragraph({
      spacing: { before: 20, after: 0 },
      indent: { left: 280, hanging: 180 },
      children: [new TextRun({ text: "• ", size, font: "Times New Roman" }), ...runs(text, { size })],
    });

  const sectionParagraphs = (section: Section, width: number): Paragraph[] => {
    const out: Paragraph[] = [heading(section.title)];
    if (section.layout === "entries") {
      for (const entry of section.entries) {
        if (entry.title || entry.right)
          out.push(tabbedRow(entry.title, entry.right, true, width, 120));
        if (entry.subtitle || entry.subtitleRight)
          out.push(tabbedRow(entry.subtitle, entry.subtitleRight, false, width));
        for (const bullet of entry.bullets) out.push(bulletParagraph(bullet.text));
      }
    } else if (section.layout === "bullets") {
      for (const item of section.items) out.push(bulletParagraph(item.text));
    } else if (section.layout === "lines") {
      for (const item of section.items)
        out.push(new Paragraph({ spacing: { before: 20 }, children: runs(item.text, { size }) }));
    } else {
      for (const group of section.groups)
        out.push(
          new Paragraph({
            spacing: { before: 20 },
            children: [
              new TextRun({ text: `${group.label}: `, bold: true, size, font: "Times New Roman" }),
              ...runs(group.text, { size }),
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
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: resume.name.toUpperCase(),
          bold: true,
          size: Math.round(size * resume.design.headingScale * 1.9),
          font: "Times New Roman",
        }),
      ],
    }),
    ...(resume.location
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: resume.location, size, font: "Times New Roman" })],
          }),
        ]
      : []),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: resume.contacts.flatMap((contact, index) => [
        ...(index > 0 ? [new TextRun({ text: "  |  ", size, font: "Times New Roman" })] : []),
        new ExternalHyperlink({
          children: [
            new TextRun({ text: contact.label, size, font: "Times New Roman", style: "Hyperlink" }),
          ],
          link: contact.url || "#",
        }),
      ]),
    }),
  ];

  const sideWidth = Math.round((CONTENT_WIDTH * resume.design.columnSplit) / 100);
  const mainWidth = CONTENT_WIDTH - sideWidth;

  const body =
    side.length > 0
      ? [
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
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
                    margins: { right: 160 },
                    children: side.flatMap((s) => sectionParagraphs(s, sideWidth - 260)),
                  }),
                  new TableCell({
                    width: { size: mainWidth, type: WidthType.DXA },
                    margins: { left: 160 },
                    children: main.flatMap((s) => sectionParagraphs(s, mainWidth - 260)),
                  }),
                ],
              }),
            ],
          }),
        ]
      : main.flatMap((s) => sectionParagraphs(s, CONTENT_WIDTH));

  const doc = new Document({
    styles: { default: { document: { run: { font: "Times New Roman", size } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 800, right: 1134, bottom: 800, left: 1134 },
          },
        },
        children: [...header, ...body],
      },
    ],
  });

  return Packer.toBlob(doc);
}