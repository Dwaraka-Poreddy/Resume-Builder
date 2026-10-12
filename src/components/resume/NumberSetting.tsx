import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface Props {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  className?: string;
  onValueChange: (value: number) => void;
}

/** Keep intermediate typing local so clearing a field never changes the resume. */
export function NumberSetting({ value, min, max, step, label, className, onValueChange }: Props) {
  const [draft, setDraft] = useState(String(Number(value.toFixed(3))));
  useEffect(() => setDraft(String(Number(value.toFixed(3)))), [value]);
  const commit = () => {
    const parsed = draft.trim() ? Number(draft) : NaN;
    const next = Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : value;
    setDraft(String(Number(next.toFixed(3))));
    if (next !== value) onValueChange(next);
  };
  return (
    <Input
      type="number"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      className={className}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          event.preventDefault();
          setDraft(String(Number(value.toFixed(3))));
        }
      }}
    />
  );
}
