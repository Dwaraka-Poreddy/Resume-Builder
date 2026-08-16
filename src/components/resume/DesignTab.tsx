import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { Align, Design, Resume, Section } from "@/lib/resume/types";
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
    { key: "letterSpacing", label: "Letter spacing", min: -0.02, max: 0.08, step: 0.005, suffix: "em" },
    { key: "columnGap", label: "Column gap", min: 0, max: 20, step: 0.5, suffix: "mm" },
    { key: "entrySpacing", label: "Entry spacing", min: 0, max: 20, step: 1, suffix: "px" },
    { key: "bulletSpacing", label: "Bullet line spacing", min: 0, max: 12, step: 0.5, suffix: "px" },
    { key: "bulletIndent", label: "Bullet indent", min: 0, max: 40, step: 1, suffix: "px" },
    { key: "itemSpacing", label: "Line / group spacing", min: 0, max: 12, step: 0.5, suffix: "px" },
    { key: "headerRuleWidth", label: "Header rule width", min: 0.2, max: 4, step: 0.1, suffix: "pt" },
    { key: "headingRuleWidth", label: "Section rule width", min: 0.2, max: 4, step: 0.1, suffix: "pt" },
    { key: "headingRuleGap", label: "Space above section rule", min: 0, max: 12, step: 0.5, suffix: "px" },
    { key: "headingSpaceAfter", label: "Space below section rule", min: 0, max: 16, step: 0.5, suffix: "px" },
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
    { key: "headerRule", label: "Rule under the header" },
    { key: "nameSmallCaps", label: "Small caps name" },
    { key: "fitOnePage", label: "Auto-fit to a single page" },
  ];

  const patchSection = (id: string, next: Partial<Section>) =>
    onChange({
      ...resume,
      sections: resume.sections.map((s) => (s.id === id ? { ...s, ...next } : s)),
    });

  const alignOptions: Align[] = ["left", "center", "right"];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Font family</Label>
        <Select value={design.fontFamily} onValueChange={(value) => patch({ fontFamily: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {colors.map((color) => (
          <div key={color.key} className="space-y-2">
            <Label className="text-xs">{color.label}</Label>
            <Input
              type="color"
              className="h-9 p-1"
              value={design[color.key] as string}
              onChange={(event) => patch({ [color.key]: event.target.value } as Partial<Design>)}
            />
          </div>
        ))}
      </div>

      {sliders.map((slider) => (
        <div key={slider.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">{slider.label}</Label>
            <span className="text-xs text-muted-foreground">
              {Number(design[slider.key]).toFixed(slider.step < 0.1 ? 3 : slider.step < 1 ? 2 : 0)}
              {slider.suffix ?? ""}
            </span>
          </div>
          <Slider
            min={slider.min}
            max={slider.max}
            step={slider.step}
            value={[Number(design[slider.key])]}
            onValueChange={([value]) => patch({ [slider.key]: value } as Partial<Design>)}
          />
        </div>
      ))}

      <div className="space-y-2">
        <Label className="text-xs">Header alignment</Label>
        <Select
          value={design.headerAlign}
          onValueChange={(value) => patch({ headerAlign: value as Align })}
        >
          <SelectTrigger>
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
        <Label className="text-xs">Section title alignment</Label>
        <Select
          value={design.headingAlign}
          onValueChange={(value) => patch({ headingAlign: value as Align })}
        >
          <SelectTrigger>
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
              <Input
                type="number"
                min={0}
                max={40}
                step={0.5}
                className="h-8"
                value={Number(design[margin.key])}
                onChange={(event) =>
                  patch({ [margin.key]: Number(event.target.value) } as Partial<Design>)
                }
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
                  onClick={() =>
                    patchSection(section.id, {
                      boldTitle: undefined,
                      rule: undefined,
                      ruleWidth: undefined,
                      align: undefined,
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
                  checked={section.boldTitle ?? design.boldSectionTitles}
                  onCheckedChange={(checked) => patchSection(section.id, { boldTitle: checked })}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-normal">Underline</Label>
                <Switch
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
                  min={0}
                  max={12}
                  step={0.5}
                  value={[section.itemSpacing ?? design.itemSpacing]}
                  onValueChange={([value]) => patchSection(section.id, { itemSpacing: value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-normal">Title alignment</Label>
                <Select
                  value={section.align ?? design.headingAlign}
                  onValueChange={(value) => patchSection(section.id, { align: value as Align })}
                >
                  <SelectTrigger className="h-8">
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