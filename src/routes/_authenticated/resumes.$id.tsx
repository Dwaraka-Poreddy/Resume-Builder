import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Check, FileDown, Loader2, Printer, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ContentTab } from "@/components/resume/ContentTab";
import { DesignTab } from "@/components/resume/DesignTab";
import { ResumeDocument } from "@/components/resume/ResumeDocument";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { defaultResume } from "@/lib/resume/data";
import { getResume, saveResume } from "@/lib/resume/resumes.functions";
import type { Resume } from "@/lib/resume/types";

export const Route = createFileRoute("/_authenticated/resumes/$id")({
  head: () => ({
    meta: [
      { title: "Edit resume — Resume Builder" },
      {
        name: "description",
        content:
          "Edit a saved LaTeX-style resume with a live A4 preview, full design control, and one-page PDF or DOCX export.",
      },
      { property: "og:title", content: "Edit resume — Resume Builder" },
      {
        property: "og:description",
        content: "Live A4 preview, editable sections and one-page PDF or DOCX export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResumeEditorPage,
  errorComponent: ({ error }) => (
    <div className="p-8" role="alert">
      <p className="text-sm text-destructive">{error.message}</p>
      <Link to="/resumes" className="mt-3 inline-block text-sm underline">
        Back to my resumes
      </Link>
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-sm">This resume no longer exists.</div>,
});

const normalise = (value: unknown): Resume => {
  const parsed = (value ?? {}) as Partial<Resume>;
  return {
    ...defaultResume,
    ...parsed,
    design: { ...defaultResume.design, ...(parsed.design ?? {}) },
  };
};

function ResumeEditorPage() {
  const { id } = Route.useParams();
  const load = useServerFn(getResume);
  const persist = useServerFn(saveResume);

  const record = useQuery({ queryKey: ["resume", id], queryFn: () => load({ data: { id } }) });

  const [resume, setResume] = useState<Resume | null>(null);
  const [title, setTitle] = useState("");
  const [zoom, setZoom] = useState(0.72);
  const [saving, setSaving] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    if (!record.data) return;
    setResume(normalise(record.data.data));
    setTitle(record.data.title);
    dirty.current = false;
  }, [record.data]);

  useEffect(() => {
    if (!resume || !dirty.current) return;
    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await persist({ data: { id, title: title.trim() || "Untitled resume", data: resume } });
        dirty.current = false;
      } catch {
        toast.error("Could not save — retrying on your next edit");
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [resume, title, id, persist]);

  const update = useCallback((next: Resume) => {
    dirty.current = true;
    setResume(next);
  }, []);

  const exportPdf = useCallback(() => window.print(), []);

  const exportDocx = useCallback(async () => {
    if (!resume) return;
    const { buildResumeDocx } = await import("@/lib/resume/docx");
    const blob = await buildResumeDocx(resume);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(title || resume.name).replace(/\s+/g, "_") || "resume"}.docx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast.success("DOCX downloaded");
  }, [resume, title]);

  const preview = useMemo(
    () => (resume ? <ResumeDocument resume={resume} /> : null),
    [resume],
  );

  if (record.isLoading || !resume) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading resume…
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-muted/40">
      <Toaster />
      <header className="flex h-auto flex-wrap items-center gap-2 border-b border-border bg-background px-4 py-3">
        <Button variant="ghost" size="icon" aria-label="Back to my resumes" asChild>
          <Link to="/resumes">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="mr-auto min-w-[180px]">
          <Input
            aria-label="Resume name"
            className="h-8 border-transparent px-2 text-sm font-semibold shadow-none hover:border-border focus-visible:border-border"
            value={title}
            onChange={(e) => {
              dirty.current = true;
              setTitle(e.target.value);
            }}
          />
          <p className="px-2 text-xs text-muted-foreground">
            {saving ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" /> Saving…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Check className="size-3" /> Saved to your account
              </span>
            )}
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
            update(defaultResume);
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

      <main className="grid h-[calc(100vh-73px)] gap-4 p-4 lg:grid-cols-[minmax(360px,420px)_1fr]">
        <section className="min-h-0 overflow-y-auto overscroll-contain rounded-xl border border-border bg-background p-3">
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
              <ContentTab resume={resume} onChange={update} />
            </TabsContent>
            <TabsContent value="design" className="mt-4">
              <DesignTab resume={resume} onChange={update} />
            </TabsContent>
          </Tabs>
        </section>

        <section className="resume-print-root min-h-0 overflow-auto overscroll-contain">
          <div
            className="resume-zoom mx-auto"
            style={{ width: `calc(210mm * ${zoom})`, height: `calc(297mm * ${zoom})` }}
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