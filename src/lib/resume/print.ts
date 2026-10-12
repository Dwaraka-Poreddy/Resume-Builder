import type { Design } from "./types";

export function resumePrintStyles(design: Design): string {
  return `
    /* Keep browser-generated headers/footers outside the printable area.
       Resume margins belong inside each already-paginated sheet. */
    @page { size: A4; margin: 0; }
    html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
    body * { visibility: visible !important; }
    .resume-page { height: auto !important; overflow: visible !important;
      box-shadow: none !important; border: 0 !important; }
    .resume-pages { display: block !important; gap: 0 !important; }
    .resume-measure, .resume-fit-warning { display: none !important; }
    .resume-page { break-after: page; }
    .resume-page:last-child { break-after: auto; }
    .resume-section { break-inside: auto; }
    .resume-entry, .resume-bullets li, .resume-group { break-inside: avoid; }
    .resume-heading { break-after: avoid; }
    @media print {
      .resume-page { width: 210mm !important; min-height: 297mm !important;
        box-sizing: border-box !important;
        padding: ${design.marginTop}mm ${design.marginRight}mm ${design.marginBottom}mm ${design.marginLeft}mm !important; }
    }
  `;
}

/** Print real DOM text and anchors, isolated from the zoomed/clipped editor. */
export async function printResume(
  element: HTMLElement,
  title: string,
  design: Design,
): Promise<void> {
  const frame = document.createElement("iframe");
  frame.title = "Resume print document";
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:210mm;height:297mm;border:0";
  document.body.appendChild(frame);
  const target = frame.contentDocument;
  const printWindow = frame.contentWindow;
  if (!target || !printWindow) {
    frame.remove();
    throw new Error("Could not open the print document.");
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const cleanup = () => {
    clearTimeout(timer);
    frame.remove();
  };
  try {
    target.open();
    target.write("<!doctype html><html><head><meta charset='utf-8'></head><body></body></html>");
    target.close();
    target.title = title || "Resume";
    const base = target.createElement("base");
    base.href = document.baseURI;
    target.head.appendChild(base);
    const stylesReady = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(
      (style) => {
        const clone = style.cloneNode(true) as HTMLElement;
        const ready =
          clone.tagName === "LINK"
            ? new Promise<void>((resolve, reject) => {
                clone.addEventListener("load", () => resolve(), { once: true });
                clone.addEventListener(
                  "error",
                  () => reject(new Error("Could not load print styles.")),
                  { once: true },
                );
              })
            : Promise.resolve();
        target.head.appendChild(clone);
        return ready;
      },
    );
    const overrides = target.createElement("style");
    overrides.textContent = resumePrintStyles(design);
    target.head.appendChild(overrides);
    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".resume-measure, .resume-fit-warning").forEach((node) => node.remove());
    target.body.appendChild(clone);
    await Promise.all(stylesReady);
    // Force font discovery before waiting, including fonts on an off-screen frame.
    target.body.getBoundingClientRect();
    await target.fonts.ready;
    await new Promise<void>((resolve) =>
      printWindow.requestAnimationFrame(() => printWindow.requestAnimationFrame(() => resolve())),
    );
    printWindow.addEventListener("afterprint", cleanup, { once: true });
    timer = setTimeout(cleanup, 300_000);
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    cleanup();
    throw error;
  }
}
