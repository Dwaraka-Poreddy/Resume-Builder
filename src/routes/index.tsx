import { createFileRoute } from "@tanstack/react-router";
import { FileDown, Printer, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ContentTab } from "@/components/resume/ContentTab";
import { DesignTab } from "@/components/resume/DesignTab";
import { ResumeDocument } from "@/components/resume/ResumeDocument";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { defaultResume } from "@/lib/resume/data";
import type { Resume } from "@/lib/resume/types";

const STORAGE_KEY = "resume-builder:v1";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resume Builder — LaTeX-style A4 resume editor" },
      {
        name: "description",
        content:
          "Edit, restyle and rearrange a LaTeX-style single-page resume with a live A4 preview, then export it as a one-page PDF or a Word DOCX.",
      },
      { property: "og:title", content: "Resume Builder — LaTeX-style A4 resume editor" },
      {
        property: "og:description",
        content:
          "Live A4 preview, editable sections, full design control, and one-page PDF or DOCX export.",
      },
    ],
  }),
  component: ResumeBuilderPage,
});

function ResumeBuilderPage() {
  const [resume, setResume] = useState<Resume>(defaultResume);
  const [zoom, setZoom] = useState(0.72);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Resume;
        setResume({ ...defaultResume, ...parsed, design: { ...defaultResume.design, ...parsed.design } });
      }
    } catch {
      /* ignore corrupt local data */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
    }, 400);
    return () => clearTimeout(timer);
  }, [resume, loaded]);

  const exportPdf = useCallback(() => window.print(), []);

  const exportDocx = useCallback(async () => {
    const { buildResumeDocx } = await import("@/lib/resume/docx");
    const blob = await buildResumeDocx(resume);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resume.name.replace(/\s+/g, "_") || "resume"}.docx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast.success("DOCX downloaded");
  }, [resume]);

  const preview = useMemo(() => <ResumeDocument resume={resume} />, [resume]);

  return (
    <div className="min-h-screen bg-muted/40">
      <Toaster />
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-border bg-background px-4 py-3">
        <div className="mr-auto">
          <h1 className="text-base font-semibold">Resume Builder</h1>
          <p className="text-xs text-muted-foreground">
            Classic LaTeX template · autosaved locally · single-page export
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.35, z - 0.08))}>
          <ZoomOut className="size-4" />
        </Button>
        <span className="w-10 text-center text-xs text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="icon" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.4, z + 0.08))}>
          <ZoomIn className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setResume(defaultResume);
            toast.success("Reset to the template sample");
          }}
        >
          <RotateCcw className="size-4" /> Reset
        </Button>
        <Button variant="outline" size="sm" onClick={exportDocx}>
          <FileDown className="size-4" /> DOCX
        </Button>
        <Button size="sm" onClick={exportPdf}>
          <Printer className="size-4" /> PDF
        </Button>
      </header>

      <main className="grid gap-4 p-4 lg:grid-cols-[minmax(360px,420px)_1fr]">
        <section className="rounded-xl border border-border bg-background p-3">
          <Tabs defaultValue="content">
            <TabsList className="w-full">
              <TabsTrigger value="content" className="flex-1">
                Content
              </TabsTrigger>
              <TabsTrigger value="design" className="flex-1">
                Design
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-4">
              <ContentTab resume={resume} onChange={setResume} />
            </TabsContent>
            <TabsContent value="design" className="mt-4">
              <DesignTab resume={resume} onChange={setResume} />
            </TabsContent>
          </Tabs>
        </section>

        <section className="resume-print-root overflow-auto">
          <div
            className="resume-zoom mx-auto"
            style={{
              width: `calc(210mm * ${zoom})`,
              height: `calc(297mm * ${zoom})`,
            }}
          >
            <div
              className="resume-zoom shadow-lg ring-1 ring-border"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: "210mm" }}
            >
              {preview}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
