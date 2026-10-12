import { useEffect, useRef, useState, type ReactNode } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Zoom affects only the editor viewport; exports use the original document. */
export function ResumePreview({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.72);
  const [fitWidth, setFitWidth] = useState(true);
  useEffect(() => {
    const node = viewport.current;
    if (!node || !fitWidth) return;
    const fit = () =>
      setZoom(Math.max(0.2, Math.min(1, (node.clientWidth - 32) / ((210 * 96) / 25.4))));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    return () => observer.disconnect();
  }, [fitWidth]);
  const adjust = (delta: number) => {
    setFitWidth(false);
    setZoom((value) => Math.max(0.2, Math.min(1.4, Math.round((value + delta) * 100) / 100)));
  };
  return (
    <section
      aria-label="Resume preview"
      className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-muted/30"
    >
      <div
        role="toolbar"
        aria-label="Preview zoom"
        className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border bg-background px-3 py-2"
      >
        <span className="mr-auto text-xs font-medium">A4 preview</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Zoom out"
          disabled={zoom <= 0.2}
          onClick={() => adjust(-0.08)}
        >
          <ZoomOut className="size-4" />
        </Button>
        <output
          aria-label="Preview zoom percentage"
          className="w-11 text-center text-xs tabular-nums"
        >
          {Math.round(zoom * 100)}%
        </output>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Zoom in"
          disabled={zoom >= 1.4}
          onClick={() => adjust(0.08)}
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFitWidth(false);
            setZoom(1);
          }}
        >
          100%
        </Button>
        <Button
          variant={fitWidth ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={fitWidth}
          onClick={() => setFitWidth(true)}
        >
          Fit width
        </Button>
      </div>
      <div
        ref={viewport}
        className="resume-print-root min-h-0 flex-1 overflow-auto overscroll-contain p-4"
        tabIndex={0}
        aria-label="Scrollable resume pages"
      >
        <div className="resume-zoom mx-auto" style={{ width: `calc(210mm * ${zoom})` }}>
          <div className="resume-zoom" style={{ zoom, width: "210mm" }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
