import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { paginateColumns } from "@/lib/resume/pagination";
import { RichText } from "@/lib/resume/richtext";
import type { Contact, Design, Resume, Section } from "@/lib/resume/types";
import {
  EnvelopeGlyph,
  GithubGlyph,
  GlobeGlyph,
  LinkedinGlyph,
  PhoneGlyph,
  PinGlyph,
} from "./ResumeIcons";

function ContactIcon({ url }: { url: string }) {
  if (url.startsWith("tel:")) return <PhoneGlyph />;
  if (url.startsWith("mailto:")) return <EnvelopeGlyph />;
  if (url.includes("github")) return <GithubGlyph />;
  if (url.includes("linkedin")) return <LinkedinGlyph />;
  if (url.startsWith("geo:") || url === "") return <PinGlyph />;
  return <GlobeGlyph />;
}

function ContactItem({ contact }: { contact: Contact }) {
  return (
    <span className="resume-contact">
      <ContactIcon url={contact.url} />
      {contact.url ? (
        <a href={contact.url} target="_blank" rel="noreferrer" className="resume-link">
          {contact.label}
        </a>
      ) : (
        <span>{contact.label}</span>
      )}
    </span>
  );
}

function Bullets({ items }: { items: { id: string; text: string }[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="resume-bullets">
      {items.map((bullet) => (
        <li key={bullet.id}>
          <span className="resume-bullet-marker" aria-hidden="true">
            •
          </span>
          <span className="resume-bullet-text">
            <RichText value={bullet.text} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function SectionBody({ section }: { section: Section }) {
  if (section.layout === "entries") {
    return (
      <>
        {section.entries.map((entry) => (
          <div key={entry.id} className="resume-entry">
            {(entry.title || entry.right) && (
              <div className="resume-row">
                <span className="resume-row-left">
                  <RichText value={entry.title} />
                </span>
                <span className="resume-row-right">
                  <RichText value={entry.right} />
                </span>
              </div>
            )}
            {(entry.subtitle || entry.subtitleRight) && (
              <div className="resume-row resume-row-sub">
                <span className="resume-row-left">
                  <RichText value={entry.subtitle} />
                </span>
                <span className="resume-row-right">
                  <RichText value={entry.subtitleRight} />
                </span>
              </div>
            )}
            <Bullets items={entry.bullets} />
          </div>
        ))}
      </>
    );
  }

  if (section.layout === "bullets") return <Bullets items={section.items} />;

  if (section.layout === "lines") {
    return (
      <div className="resume-lines">
        {section.items.map((item) => (
          <div key={item.id} className="resume-line">
            <RichText value={item.text} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="resume-groups">
      {section.groups.map((group) => (
        <div key={group.id} className="resume-group">
          <span className="resume-group-label">{group.label}: </span>
          <span>
            <RichText value={group.text} />
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionBlock({
  section,
  design,
  fit,
  continuation = false,
}: {
  section: Section;
  design: Design;
  fit: number;
  continuation?: boolean;
}) {
  const rule = section.rule ?? design.headingRule;
  const ruleWidth = section.ruleWidth ?? design.headingRuleWidth;
  return (
    <section
      className="resume-section"
      style={
        {
          marginTop: `${(section.spaceBefore ?? design.sectionSpacing) * fit}px`,
          "--resume-item-gap": `${(section.itemSpacing ?? design.itemSpacing) * fit}px`,
        } as React.CSSProperties
      }
    >
      {!continuation && (
        <h2
          className="resume-heading"
          style={{
            fontWeight: (section.boldTitle ?? design.boldSectionTitles) ? 700 : 400,
            textAlign: section.align ?? design.headingAlign,
            borderBottom: rule ? `${ruleWidth}pt solid ${design.accentColor}` : "none",
            paddingBottom: rule ? `${design.headingRuleGap * fit}px` : 0,
            marginBottom: `${design.headingSpaceAfter * fit}px`,
          }}
        >
          {section.title}
        </h2>
      )}
      <SectionBody section={section} />
    </section>
  );
}

export function ResumeDocument({ resume }: { resume: Resume }) {
  const { design } = resume;
  const contentRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFit] = useState(1);
  const [pageGroups, setPageGroups] = useState<number[][][]>([[[], []]]);
  const [overflow, setOverflow] = useState(false);
  const fit = design.fitOnePage ? fitScale : 1;
  const available = (297 - design.marginTop - design.marginBottom) * (96 / 25.4);
  const visible = resume.sections.filter((s) => !s.hidden);
  const hasSide = visible.some((s) => s.column === "side");
  // Each heading travels with its first entry. Later entries may start a new page.
  const fragments = (column: "main" | "side") =>
    visible
      .filter((s) => s.column === column)
      .flatMap((section) => {
        const values =
          section.layout === "entries"
            ? section.entries
            : section.layout === "groups"
              ? section.groups
              : section.items;
        if (!values.length) return [{ section, continuation: false }];
        return values.map((value, index) => ({
          section: {
            ...section,
            ...(section.layout === "entries"
              ? { entries: [value] }
              : section.layout === "groups"
                ? { groups: [value] }
                : { items: [value] }),
          } as Section,
          continuation: index > 0,
        }));
      });
  const columns = [fragments("side"), fragments("main")];
  const header = (
    <header className="resume-header" style={{ textAlign: design.headerAlign }}>
      <h1
        className="resume-name"
        style={{ fontVariantCaps: design.nameSmallCaps ? "small-caps" : "normal" }}
      >
        {resume.name}
      </h1>
      {resume.location && <div className="resume-location">{resume.location}</div>}
      {resume.contacts.length > 0 && (
        <div
          className="resume-contacts"
          style={{
            justifyContent:
              design.headerAlign === "left"
                ? "flex-start"
                : design.headerAlign === "right"
                  ? "flex-end"
                  : "center",
          }}
        >
          {resume.contacts.map((contact) => (
            <ContactItem key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </header>
  );
  const renderFragment = (column: number, index: number) => {
    const fragment = columns[column]?.[index];
    if (!fragment) return null;
    return (
      <div
        key={`${fragment.section.id}-${index}`}
        data-resume-fragment
        style={{ display: "flow-root" }}
      >
        <SectionBlock
          section={{
            ...fragment.section,
            ...(fragment.continuation
              ? {
                  spaceBefore:
                    fragment.section.layout === "entries"
                      ? design.entrySpacing
                      : fragment.section.layout === "bullets"
                        ? 0
                        : (fragment.section.itemSpacing ?? design.itemSpacing),
                }
              : {}),
          }}
          design={design}
          fit={fit}
          continuation={fragment.continuation}
        />
      </div>
    );
  };
  const columnStyle = {
    gridTemplateColumns: `minmax(0, ${design.columnSplit}fr) minmax(0, ${100 - design.columnSplit}fr)`,
    columnGap: `${design.columnGap}mm`,
  };
  const measure = () => {
    const node = contentRef.current;
    if (!node) return;
    const headerHeight = node.querySelector("header")?.offsetHeight ?? 0;
    const columnNodes = node.querySelectorAll<HTMLElement>("[data-resume-column]");
    const heights = Array.from(columnNodes, (col) =>
      Array.from(col.children, (child) => (child as HTMLElement).offsetHeight),
    );
    const natural =
      headerHeight +
      Math.max(0, ...heights.map((items) => items.reduce((sum, height) => sum + height, 0)));
    const floor = Math.min(1, 9 / design.fontSize);
    const target = Math.min(1, Math.max(floor, ((fit * available) / Math.max(1, natural)) * 0.998));
    if (
      design.fitOnePage &&
      Math.abs(target - fit) > 0.003 &&
      (natural > available || natural < available * 0.97)
    ) {
      setFit(target);
      return;
    }
    const { pages: result, oversized } = paginateColumns(heights, available, headerHeight);
    setOverflow(oversized || (design.fitOnePage && result.length > 1));
    setPageGroups((previous) =>
      JSON.stringify(previous) === JSON.stringify(result) ? previous : result,
    );
  };
  useLayoutEffect(measure);
  const measureRef = useRef(measure);
  useLayoutEffect(() => {
    measureRef.current = measure;
  });
  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => measureRef.current());
    observer.observe(node);
    let active = true;
    void document.fonts?.ready.then(() => {
      if (active) measureRef.current();
    });
    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);

  const pageStyle = {
    fontFamily: design.fontFamily,
    color: design.textColor,
    fontSize: `${design.fontSize * fit}pt`,
    lineHeight: design.lineHeight,
    letterSpacing: `${design.letterSpacing}em`,
    paddingTop: `${design.marginTop}mm`,
    paddingRight: `${design.marginRight}mm`,
    paddingBottom: `${design.marginBottom}mm`,
    paddingLeft: `${design.marginLeft}mm`,
    textAlign: design.headerAlign,
    "--resume-heading-color": design.headingColor,
    "--resume-accent": design.accentColor,
    "--resume-heading-scale": design.headingScale,
    "--resume-section-gap": `${design.sectionSpacing * fit}px`,
    "--resume-entry-gap": `${design.entrySpacing * fit}px`,
    "--resume-bullet-gap": `${design.bulletSpacing * fit}px`,
    "--resume-bullet-indent": `${design.bulletIndent * fit}px`,
    "--resume-item-gap": `${design.itemSpacing * fit}px`,
    "--resume-heading-transform": design.uppercaseHeadings ? "uppercase" : "none",
  } as React.CSSProperties;
  return (
    <div id="resume-page" className="resume-pages" data-fit-scale={fit}>
      {overflow && (
        <p className="resume-fit-warning" role="status">
          {design.fitOnePage
            ? "This resume needs more than one page at a readable font size. Reduce content or adjust spacing to fit."
            : "An entry is taller than a page. Split it into shorter entries for reliable printing."}
        </p>
      )}
      <div className="resume-page resume-measure" aria-hidden="true" style={pageStyle}>
        <div ref={contentRef} style={{ textAlign: "left" }}>
          {header}
          <div
            className={hasSide ? "resume-columns" : undefined}
            style={hasSide ? columnStyle : undefined}
          >
            {columns.map((items, column) => (
              <div
                key={column}
                data-resume-column
                style={{ display: column === 0 && !hasSide ? "none" : undefined }}
              >
                {items.map((_, index) => renderFragment(column, index))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {pageGroups.map((groups, page) => (
        <div
          key={page}
          className="resume-page"
          style={{ ...pageStyle, height: "auto", minHeight: "297mm" }}
          aria-label={`Resume page ${page + 1}`}
        >
          <div className="resume-fit" style={{ textAlign: "left" }}>
            {page === 0 && header}
            <div
              className={hasSide ? "resume-columns" : undefined}
              style={hasSide ? columnStyle : undefined}
            >
              {groups.map((indices, column) => (
                <div
                  key={column}
                  style={{ display: column === 0 && !hasSide ? "none" : undefined }}
                >
                  {indices
                    .filter((index) => !!columns[column]?.[index])
                    .map((index) => renderFragment(column, index))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
