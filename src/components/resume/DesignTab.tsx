import { NumberSetting } from "./NumberSetting";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { Align, BulletAlign, Design, Resume, Section } from "@/lib/resume/types";
import { FONT_OPTIONS } from "@/lib/resume/types";

interface Props {
  resume: Resume;
  onChange: (next: Resume) => void;
}

export function DesignTab({ resume, onChange }: Props) {
  const { design } = resume;
  const patch = (next: Partial<Design>) => onChange({ ...resume, design: { ...design, ...next } });

  const sliders: {
    key: keyof Design;
    label: string;
    min: number;
    max: number;
    step: number;
    suffix?: string;
  }[] = [
    { key: "fontSize", label: "Font size", min: 7, max: 14, step: 0.1, suffix: "pt" },
    { key: "headingScale", label: "Heading scale", min: 1, max: 2, step: 0.05, suffix: "x" },
    { key: "lineHeight", label: "Line height", min: 1, max: 1.8, step: 0.02 },
    { key: "sectionSpacing", label: "Section spacing", min: 0, max: 24, step: 1, suffix: "px" },
    { key: "columnSplit", label: "Side column width", min: 20, max: 55, step: 1, suffix: "%" },
    {
      key: "letterSpacing",
      label: "Letter spacing",
      min: -0.02,
      max: 0.08,
      step: 0.005,
      suffix: "em",
    },
    { key: "columnGap", label: "Column gap", min: 0, max: 20, step: 0.5, suffix: "mm" },
    { key: "entrySpacing", label: "Entry spacing", min: 0, max: 20, step: 1, suffix: "px" },
    {
      key: "bulletSpacing",
      label: "Bullet line spacing",
      min: 0,
      max: 12,
      step: 0.5,
      suffix: "px",
    },
    { key: "bulletIndent", label: "Bullet indent", min: 0, max: 40, step: 1, suffix: "px" },
    { key: "itemSpacing", label: "Line / group spacing", min: 0, max: 12, step: 0.5, suffix: "px" },
    {
      key: "headingRuleWidth",
      label: "Section rule width",
      min: 0.2,
      max: 4,
      step: 0.1,
      suffix: "pt",
    },
    {
      key: "headingRuleGap",
      label: "Space above section rule",
      min: 0,
      max: 12,
      step: 0.5,
      suffix: "px",
    },
    {
      key: "headingSpaceAfter",
      label: "Space below section rule",
      min: 0,
      max: 16,
      step: 0.5,
      suffix: "px",
    },
  ];

  const margins: { key: keyof Design; label: string }[] = [
    { key: "marginTop", label: "Top" },
    { key: "marginRight", label: "Right" },
    { key: "marginBottom", label: "Bottom" },
    { key: "marginLeft", label: "Left" },
  ];

  const colors: { key: keyof Design; label: string }[] = [
    { key: "textColor", label: "Text color" },
    { key: "headingColor", label: "Heading color" },
    { key: "accentColor", label: "Accent / rule color" },
  ];

  const toggles: { key: keyof Design; label: string }[] = [
    { key: "boldSectionTitles", label: "Bold section titles" },
    { key: "headingRule", label: "Underline under section titles" },
    { key: "uppercaseHeadings", label: "Uppercase section headings" },
    { key: "nameSmallCaps", label: "Small caps name" },
  ];

  const patchSection = (id: string, next: Partial<Section>) =>
    onChange({
      ...resume,
      sections: resume.sections.map((s) => (s.id === id ? { ...s, ...next } : s)),
    });

  const hasSideColumn = resume.sections.some(
    (section) => !section.hidden && section.column === "side",
  );
  const bulletOptions: BulletAlign[] = ["left", "center", "right", "justify"];
  const alignOptions: Align[] = ["left", "center", "right"];

  return (
    <div className="space-y-5">
      <div className="space-y-2 rounded-lg border border-border p-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="fit-one-page">Fit to a single page</Label>
          <Switch
            id="fit-one-page"
            aria-describedby="fit-one-page-help"
            checked={design.fitOnePage}
            onCheckedChange={(checked) => patch({ fitOnePage: checked })}
          />
        </div>
        <p id="fit-one-page-help" className="text-xs text-muted-foreground">
          {design.fitOnePage
            ? "Shrinks sizes and spacing to fit one A4 page, with a 9pt readability limit. Smaller sizes you select are preserved."
            : "Uses your exact font sizes and spacing. Longer resumes continue onto more pages."}
        </p>
      </div>
      <div className="space-y-2 rounded-lg border border-border p-3">
        <Label htmlFor="bullet-alignment">Bullet text alignment</Label>
        <Select
          value={design.bulletAlign ?? "left"}
          onValueChange={(value) => patch({ bulletAlign: value as BulletAlign })}
        >
          <SelectTrigger id="bullet-alignment" aria-describedby="bullet-alignment-help">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {bulletOptions.map((value) => (
              <SelectItem key={value} value={value} className="capitalize">
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p id="bullet-alignment-help" className="text-xs text-muted-foreground">
          Applies to all bullet lists, including experience and awards. Justify aligns both edges;
          the final line stays left-aligned. Individual sections can override this below.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="font-family">Font family</Label>
        <Select value={design.fontFamily} onValueChange={(value) => patch({ fontFamily: value })}>
          <SelectTrigger id="font-family">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((font) => (
              <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Fonts use those installed on your device, with a similar fallback when unavailable.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {colors.map((color) => (
          <div key={color.key} className="space-y-2">
            <Label className="text-xs">{color.label}</Label>
            <Input
              aria-label={color.label}
              type="color"
              className="h-9 p-1"
              value={design[color.key] as string}
              onChange={(event) => patch({ [color.key]: event.target.value } as Partial<Design>)}
            />
          </div>
        ))}
      </div>

      {sliders
        .filter(
          (slider) => hasSideColumn || (slider.key !== "columnSplit" && slider.key !== "columnGap"),
        )
        .map((slider) => (
          <div key={slider.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{slider.label}</Label>
              <div className="flex items-center gap-1">
                <NumberSetting
                  label={`${slider.label} value`}
                  className="h-7 w-20 text-right text-xs"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={Number(design[slider.key])}
                  onValueChange={(value) => patch({ [slider.key]: value } as Partial<Design>)}
                />
                <span className="text-xs text-muted-foreground">{slider.suffix ?? ""}</span>
              </div>
            </div>
            <Slider
              aria-label={slider.label}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={[Number(design[slider.key])]}
              onValueChange={([value]) => patch({ [slider.key]: value } as Partial<Design>)}
            />
          </div>
        ))}

      <div className="space-y-2">
        <Label htmlFor="header-alignment" className="text-xs">
          Header alignment
        </Label>
        <Select
          value={design.headerAlign}
          onValueChange={(value) => patch({ headerAlign: value as Align })}
        >
          <SelectTrigger id="header-alignment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {alignOptions.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="heading-alignment" className="text-xs">
          Section title alignment
        </Label>
        <Select
          value={design.headingAlign}
          onValueChange={(value) => patch({ headingAlign: value as Align })}
        >
          <SelectTrigger id="heading-alignment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {alignOptions.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 rounded-lg border border-border p-3">
        <Label className="text-xs">Page margins (mm)</Label>
        <div className="grid grid-cols-4 gap-2">
          {margins.map((margin) => (
            <div key={margin.key} className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">{margin.label}</Label>
              <NumberSetting
                label={`${margin.label} page margin in millimeters`}
                min={0}
                max={40}
                step={0.5}
                className="h-8"
                value={Number(design[margin.key])}
                onValueChange={(value) => patch({ [margin.key]: value } as Partial<Design>)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-3">
        {toggles.map((toggle) => (
          <div key={toggle.key} className="flex items-center justify-between gap-3">
            <Label className="text-xs font-normal">{toggle.label}</Label>
            <Switch
              aria-label={toggle.label}
              checked={Boolean(design[toggle.key])}
              onCheckedChange={(checked) => patch({ [toggle.key]: checked } as Partial<Design>)}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Label className="text-xs">Per-section overrides</Label>
        {resume.sections.map((section) => {
          const rule = section.rule ?? design.headingRule;
          return (
            <div key={section.id} className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-medium">{section.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  aria-label={`Reset ${section.title} design overrides`}
                  onClick={() =>
                    patchSection(section.id, {
                      boldTitle: undefined,
                      rule: undefined,
                      ruleWidth: undefined,
                      align: undefined,
                      bulletAlign: undefined,
                      spaceBefore: undefined,
                      itemSpacing: undefined,
                    })
                  }
                >
                  Reset
                </Button>
              </div>

              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-normal">Bold title</Label>
                <Switch
                  aria-label={`${section.title} bold title`}
                  checked={section.boldTitle ?? design.boldSectionTitles}
                  onCheckedChange={(checked) => patchSection(section.id, { boldTitle: checked })}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-normal">Underline</Label>
                <Switch
                  aria-label={`${section.title} underline`}
                  checked={rule}
                  onCheckedChange={(checked) => patchSection(section.id, { rule: checked })}
                />
              </div>

              {rule && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-normal">Underline width</Label>
                    <span className="text-xs text-muted-foreground">
                      {(section.ruleWidth ?? design.headingRuleWidth).toFixed(1)}pt
                    </span>
                  </div>
                  <Slider
                    aria-label={`${section.title} underline width`}
                    min={0.2}
                    max={4}
                    step={0.1}
                    value={[section.ruleWidth ?? design.headingRuleWidth]}
                    onValueChange={([value]) => patchSection(section.id, { ruleWidth: value })}
                  />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-normal">Space before section</Label>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(section.spaceBefore ?? design.sectionSpacing)}px
                  </span>
                </div>
                <Slider
                  aria-label={`${section.title} space before`}
                  min={0}
                  max={40}
                  step={1}
                  value={[section.spaceBefore ?? design.sectionSpacing]}
                  onValueChange={([value]) => patchSection(section.id, { spaceBefore: value })}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-normal">Line spacing inside</Label>
                  <span className="text-xs text-muted-foreground">
                    {(section.itemSpacing ?? design.itemSpacing).toFixed(1)}px
                  </span>
                </div>
                <Slider
                  aria-label={`${section.title} line spacing`}
                  min={0}
                  max={12}
                  step={0.5}
                  value={[section.itemSpacing ?? design.itemSpacing]}
                  onValueChange={([value]) => patchSection(section.id, { itemSpacing: value })}
                />
              </div>

              {(section.layout === "entries" || section.layout === "bullets") && (
                <div className="space-y-1">
                  <Label htmlFor={`bullet-alignment-${section.id}`} className="text-xs font-normal">
                    Bullet text alignment
                  </Label>
                  <Select
                    value={section.bulletAlign ?? "inherit"}
                    onValueChange={(value) =>
                      patchSection(section.id, {
                        bulletAlign: value === "inherit" ? undefined : (value as BulletAlign),
                      })
                    }
                  >
                    <SelectTrigger id={`bullet-alignment-${section.id}`} className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inherit">
                        Use global ({design.bulletAlign ?? "left"})
                      </SelectItem>
                      {bulletOptions.map((value) => (
                        <SelectItem key={value} value={value} className="capitalize">
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor={`title-alignment-${section.id}`} className="text-xs font-normal">
                  Title alignment
                </Label>
                <Select
                  value={section.align ?? design.headingAlign}
                  onValueChange={(value) => patchSection(section.id, { align: value as Align })}
                >
                  <SelectTrigger id={`title-alignment-${section.id}`} className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {alignOptions.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
