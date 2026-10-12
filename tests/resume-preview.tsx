import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { DesignTab } from "../src/components/resume/DesignTab";
import { ResumePreview } from "../src/components/resume/ResumePreview";
import { ResumeDocument } from "../src/components/resume/ResumeDocument";
import { defaultResume } from "../src/lib/resume/data";
import { resumePrintStyles } from "../src/lib/resume/print";
import { parseResumeJson } from "../src/lib/resume/json";
import "../src/styles.css";

export function Fixture() {
  const [resume, setResume] = useState(structuredClone(defaultResume));
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("fixture") !== "local") return;
    void fetch("./.local-resume.json")
      .then((response) => response.text())
      .then((text) => {
        const next = parseResumeJson(text).data;
        if (query.get("fit") === "off") next.design.fitOnePage = false;
        setResume(next);
      });
  }, []);
  const short = () =>
    setResume({
      ...structuredClone(defaultResume),
      name: "PDF Regression Fixture",
      sections: [structuredClone(defaultResume.sections[0])],
    });
  const long = () => {
    const next = structuredClone(defaultResume);
    next.name = "PDF Regression Fixture";
    next.design.fitOnePage = true;
    next.design.fontSize = 14;
    const section = next.sections.find((s) => s.layout === "entries")!;
    const entry = section.entries[0];
    section.entries = Array.from({ length: 40 }, (_, i) => ({
      ...structuredClone(entry),
      id: `entry-${i}`,
      title: `Experience ${i + 1}`,
      subtitle: "Regression content: React, TypeScript and accessible web applications.",
    }));
    next.sections = [section];
    setResume(next);
  };
  return (
    <>
      <nav>
        <button onClick={long}>Long content</button> |{" "}
        <button onClick={short}>Short content</button> |{" "}
        <button
          onClick={() =>
            setResume({
              ...resume,
              design: { ...resume.design, fitOnePage: !resume.design.fitOnePage },
            })
          }
        >
          Toggle fit
        </button>{" "}
        <span>Auto-fit: {String(resume.design.fitOnePage)}</span>
      </nav>
      <style>
        {`@media print { ${resumePrintStyles(resume.design)} }`}
        {`@media print { nav {display:none} .resume-print-root { position:static!important; } }`}
      </style>
      <main
        style={{ height: "calc(100dvh - 32px)" }}
        className="grid h-[calc(100dvh-32px)] min-h-0 grid-rows-[minmax(220px,0.8fr)_minmax(240px,1fr)] lg:grid-rows-1 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)] gap-4 p-4"
      >
        <section className="min-h-0 overflow-auto rounded-xl border bg-background p-3">
          <DesignTab resume={resume} onChange={setResume} />
        </section>
        <ResumePreview>
          <ResumeDocument resume={resume} />
        </ResumePreview>
      </main>
    </>
  );
}
const root = import.meta.hot?.data.root ?? createRoot(document.getElementById("root")!);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Fixture />);
