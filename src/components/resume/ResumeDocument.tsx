import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
}: {
  section: Section;
  design: Design;
  fit: number;
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
      <SectionBody section={section} />
    </section>
  );
}

export function ResumeDocument({ resume }: { resume: Resume }) {
  const { design } = resume;
  const contentRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const iterations = useRef(0);

  const visible = resume.sections.filter((s) => !s.hidden);
  const main = visible.filter((s) => s.column === "main");
  const side = visible.filter((s) => s.column === "side");

  /**
   * Fits the resume onto exactly one A4 page by scaling the effective font size
   * (rather than transform-scaling, which would also shrink the page width).
   * Runs as a damped feedback loop that converges in a few renders.
   */
  const measure = () => {
    const node = contentRef.current;
    if (!node) return;
    // Available height inside the A4 page in px at 96dpi: 297mm - 2 * 12mm padding.
    const available =
      (297 - design.marginTop - design.marginBottom) * (96 / 25.4);
    const natural = node.scrollHeight;
    if (!design.fitOnePage) {
      if (fit !== 1) setFit(1);
      return;
    }
    if (natural === 0) return;
    const ratio = available / natural;
    const target = Math.min(1, Math.max(0.45, fit * ratio * 0.998));
    const needsShrink = natural > available;
    const canGrow = fit < 0.999 && natural < available * 0.97;
    if ((needsShrink || canGrow) && Math.abs(target - fit) > 0.004 && iterations.current < 14) {
      iterations.current += 1;
      setFit(target);
    } else if (!needsShrink && !canGrow) {
      iterations.current = 0;
    }
  };

  useLayoutEffect(measure);

  useEffect(() => {
    iterations.current = 0;
  }, [resume]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (document.fonts?.ready) void document.fonts.ready.then(measure);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id="resume-page"
      className="resume-page"
      style={
        {
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
        } as React.CSSProperties
      }
    >
      <div className="resume-fit">
        <div ref={contentRef} style={{ textAlign: "left" }}>
          <header className="resume-header" style={{ textAlign: design.headerAlign }}>
            <h1
              className="resume-name"
              style={{ fontVariantCaps: design.nameSmallCaps ? "small-caps" : "normal" }}
            >
              {resume.name}
            </h1>
            {resume.location && <div className="resume-location">{resume.location}</div>}
            {resume.contacts.length > 0 && (
              <div className="resume-contacts">
                {resume.contacts.map((contact) => (
                  <ContactItem key={contact.id} contact={contact} />
                ))}
              </div>
            )}
            {design.headerRule && (
              <div
                className="resume-header-rule"
                style={{ borderBottomWidth: `${design.headerRuleWidth}pt` }}
              />
            )}
          </header>

          {side.length > 0 ? (
            <div
              className="resume-columns"
              style={{
                gridTemplateColumns: `${design.columnSplit}% 1fr`,
                columnGap: `${design.columnGap}mm`,
              }}
            >
              <div>
                {side.map((section) => (
                  <SectionBlock key={section.id} section={section} design={design} fit={fit} />
                ))}
              </div>
              <div>
                {main.map((section) => (
                  <SectionBlock key={section.id} section={section} design={design} fit={fit} />
                ))}
              </div>
            </div>
          ) : (
            main.map((section) => (
              <SectionBlock key={section.id} section={section} design={design} fit={fit} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}