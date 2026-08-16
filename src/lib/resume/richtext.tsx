import type { ReactNode } from "react";

export type Token =
  | { kind: "text"; text: string; bold?: boolean; italic?: boolean }
  | { kind: "link"; text: string; url: string; bold?: boolean; italic?: boolean };

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/;

/** Parses a tiny markdown subset: **bold**, *italic*, [text](url). */
export function parseInline(input: string): Token[] {
  const tokens: Token[] = [];

  const pushText = (raw: string) => {
    let rest = raw;
    while (rest.length > 0) {
      const bold = rest.match(/\*\*([^*]+)\*\*/);
      const italic = rest.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
      const first =
        bold && italic ? (bold.index! <= italic.index! ? bold : italic) : (bold ?? italic);
      if (!first || first.index === undefined) {
        tokens.push({ kind: "text", text: rest });
        return;
      }
      if (first.index > 0) tokens.push({ kind: "text", text: rest.slice(0, first.index) });
      tokens.push({
        kind: "text",
        text: first[1] ?? "",
        bold: first[0].startsWith("**"),
        italic: !first[0].startsWith("**"),
      });
      rest = rest.slice(first.index + first[0].length);
    }
  };

  let rest = input ?? "";
  while (rest.length > 0) {
    const link = rest.match(LINK_RE);
    if (!link || link.index === undefined) {
      pushText(rest);
      break;
    }
    if (link.index > 0) pushText(rest.slice(0, link.index));
    tokens.push({ kind: "link", text: link[1] ?? "", url: link[2] ?? "#" });
    rest = rest.slice(link.index + link[0].length);
  }
  return tokens;
}

export function RichText({ value }: { value: string }): ReactNode {
  const tokens = parseInline(value);
  return (
    <>
      {tokens.map((token, index) => {
        const style = {
          fontWeight: token.bold ? 700 : undefined,
          fontStyle: token.italic ? "italic" : undefined,
        };
        if (token.kind === "link") {
          return (
            <a
              key={index}
              href={token.url}
              target="_blank"
              rel="noreferrer"
              className="resume-link"
              style={style}
            >
              {token.text}
            </a>
          );
        }
        return (
          <span key={index} style={style}>
            {token.text}
          </span>
        );
      })}
    </>
  );
}

export function plainText(value: string): string {
  return parseInline(value)
    .map((t) => t.text)
    .join("");
}