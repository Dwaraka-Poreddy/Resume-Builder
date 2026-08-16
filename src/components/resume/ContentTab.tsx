import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Plus, Trash2 } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { emptySection } from "@/lib/resume/data";
import type { ColumnId, Resume, Section, SectionLayout } from "@/lib/resume/types";
import { uid } from "@/lib/resume/types";

interface Props {
  resume: Resume;
  onChange: (next: Resume) => void;
}

function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item as T);
  return next;
}

const LAYOUTS: { value: SectionLayout; label: string }[] = [
  { value: "entries", label: "Entries (title + dates + bullets)" },
  { value: "bullets", label: "Bullet list" },
  { value: "lines", label: "Plain lines" },
  { value: "groups", label: "Label groups" },
];

export function ContentTab({ resume, onChange }: Props) {
  const setSections = (sections: Section[]) => onChange({ ...resume, sections });

  const patchSection = (id: string, patch: Partial<Section>) =>
    setSections(resume.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-lg border border-border p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Header</p>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={resume.name}
            onChange={(event) => onChange({ ...resume, name: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location / tagline</Label>
          <Input
            id="location"
            value={resume.location}
            onChange={(event) => onChange({ ...resume, location: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Contact links</Label>
          {resume.contacts.map((contact, index) => (
            <div key={contact.id} className="flex items-center gap-1.5">
              <Input
                value={contact.label}
                placeholder="Label"
                onChange={(event) =>
                  onChange({
                    ...resume,
                    contacts: resume.contacts.map((c) =>
                      c.id === contact.id ? { ...c, label: event.target.value } : c,
                    ),
                  })
                }
              />
              <Input
                value={contact.url}
                placeholder="https:// or mailto:"
                onChange={(event) =>
                  onChange({
                    ...resume,
                    contacts: resume.contacts.map((c) =>
                      c.id === contact.id ? { ...c, url: event.target.value } : c,
                    ),
                  })
                }
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Move contact up"
                onClick={() => onChange({ ...resume, contacts: move(resume.contacts, index, -1) })}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove contact"
                onClick={() =>
                  onChange({
                    ...resume,
                    contacts: resume.contacts.filter((c) => c.id !== contact.id),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...resume,
                contacts: [...resume.contacts, { id: uid(), label: "New link", url: "https://" }],
              })
            }
          >
            <Plus className="size-4" /> Add contact
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sections
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSections([...resume.sections, emptySection("entries")])}
        >
          <Plus className="size-4" /> Add section
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {resume.sections.map((section, sectionIndex) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="rounded-lg border border-border px-3"
          >
            <div className="flex items-center gap-1">
              <GripVertical className="size-4 shrink-0 text-muted-foreground" />
              <AccordionTrigger className="flex-1 py-2 text-sm">
                <span className={section.hidden ? "line-through opacity-60" : ""}>
                  {section.title}
                </span>
              </AccordionTrigger>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Move section up"
                onClick={() => setSections(move(resume.sections, sectionIndex, -1))}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Move section down"
                onClick={() => setSections(move(resume.sections, sectionIndex, 1))}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={section.hidden ? "Show section" : "Hide section"}
                onClick={() => patchSection(section.id, { hidden: !section.hidden })}
              >
                {section.hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete section"
                onClick={() => setSections(resume.sections.filter((s) => s.id !== section.id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <AccordionContent className="space-y-3 pb-4">
              <Input
                value={section.title}
                onChange={(event) => patchSection(section.id, { title: event.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={section.layout}
                  onValueChange={(value) =>
                    patchSection(section.id, { layout: value as SectionLayout })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUTS.map((layout) => (
                      <SelectItem key={layout.value} value={layout.value}>
                        {layout.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={section.column}
                  onValueChange={(value) => patchSection(section.id, { column: value as ColumnId })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main column</SelectItem>
                    <SelectItem value="side">Side column</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Formatting: **bold**, *italic*, [text](https://link)
              </p>
              <Separator />

              {section.layout === "entries" && (
                <div className="space-y-3">
                  {section.entries.map((entry, entryIndex) => (
                    <div key={entry.id} className="space-y-2 rounded-md bg-muted/50 p-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move entry up"
                          onClick={() =>
                            patchSection(section.id, {
                              entries: move(section.entries, entryIndex, -1),
                            })
                          }
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move entry down"
                          onClick={() =>
                            patchSection(section.id, {
                              entries: move(section.entries, entryIndex, 1),
                            })
                          }
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete entry"
                          onClick={() =>
                            patchSection(section.id, {
                              entries: section.entries.filter((e) => e.id !== entry.id),
                            })
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      {(
                        [
                          ["title", "Title (left)"],
                          ["right", "Right (dates)"],
                          ["subtitle", "Subtitle (left)"],
                          ["subtitleRight", "Subtitle (right)"],
                        ] as const
                      ).map(([field, label]) => (
                        <Input
                          key={field}
                          placeholder={label}
                          value={entry[field]}
                          onChange={(event) =>
                            patchSection(section.id, {
                              entries: section.entries.map((e) =>
                                e.id === entry.id ? { ...e, [field]: event.target.value } : e,
                              ),
                            })
                          }
                        />
                      ))}
                      {entry.bullets.map((bullet, bulletIndex) => (
                        <div key={bullet.id} className="flex items-start gap-1">
                          <Textarea
                            rows={2}
                            value={bullet.text}
                            onChange={(event) =>
                              patchSection(section.id, {
                                entries: section.entries.map((e) =>
                                  e.id === entry.id
                                    ? {
                                        ...e,
                                        bullets: e.bullets.map((x) =>
                                          x.id === bullet.id
                                            ? { ...x, text: event.target.value }
                                            : x,
                                        ),
                                      }
                                    : e,
                                ),
                              })
                            }
                          />
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Move bullet up"
                              onClick={() =>
                                patchSection(section.id, {
                                  entries: section.entries.map((e) =>
                                    e.id === entry.id
                                      ? { ...e, bullets: move(e.bullets, bulletIndex, -1) }
                                      : e,
                                  ),
                                })
                              }
                            >
                              <ArrowUp className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete bullet"
                              onClick={() =>
                                patchSection(section.id, {
                                  entries: section.entries.map((e) =>
                                    e.id === entry.id
                                      ? {
                                          ...e,
                                          bullets: e.bullets.filter((x) => x.id !== bullet.id),
                                        }
                                      : e,
                                  ),
                                })
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          patchSection(section.id, {
                            entries: section.entries.map((e) =>
                              e.id === entry.id
                                ? { ...e, bullets: [...e.bullets, { id: uid(), text: "" }] }
                                : e,
                            ),
                          })
                        }
                      >
                        <Plus className="size-4" /> Add bullet
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patchSection(section.id, {
                        entries: [
                          ...section.entries,
                          {
                            id: uid(),
                            title: "",
                            right: "",
                            subtitle: "",
                            subtitleRight: "",
                            bullets: [],
                          },
                        ],
                      })
                    }
                  >
                    <Plus className="size-4" /> Add entry
                  </Button>
                </div>
              )}

              {(section.layout === "bullets" || section.layout === "lines") && (
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={item.id} className="flex items-start gap-1">
                      <Textarea
                        rows={2}
                        value={item.text}
                        onChange={(event) =>
                          patchSection(section.id, {
                            items: section.items.map((x) =>
                              x.id === item.id ? { ...x, text: event.target.value } : x,
                            ),
                          })
                        }
                      />
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move item up"
                          onClick={() =>
                            patchSection(section.id, { items: move(section.items, itemIndex, -1) })
                          }
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete item"
                          onClick={() =>
                            patchSection(section.id, {
                              items: section.items.filter((x) => x.id !== item.id),
                            })
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patchSection(section.id, {
                        items: [...section.items, { id: uid(), text: "" }],
                      })
                    }
                  >
                    <Plus className="size-4" /> Add line
                  </Button>
                </div>
              )}

              {section.layout === "groups" && (
                <div className="space-y-2">
                  {section.groups.map((group, groupIndex) => (
                    <div key={group.id} className="space-y-1 rounded-md bg-muted/50 p-2">
                      <div className="flex items-center gap-1">
                        <Input
                          placeholder="Label"
                          value={group.label}
                          onChange={(event) =>
                            patchSection(section.id, {
                              groups: section.groups.map((x) =>
                                x.id === group.id ? { ...x, label: event.target.value } : x,
                              ),
                            })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move group up"
                          onClick={() =>
                            patchSection(section.id, {
                              groups: move(section.groups, groupIndex, -1),
                            })
                          }
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete group"
                          onClick={() =>
                            patchSection(section.id, {
                              groups: section.groups.filter((x) => x.id !== group.id),
                            })
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <Textarea
                        rows={2}
                        placeholder="Value"
                        value={group.text}
                        onChange={(event) =>
                          patchSection(section.id, {
                            groups: section.groups.map((x) =>
                              x.id === group.id ? { ...x, text: event.target.value } : x,
                            ),
                          })
                        }
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patchSection(section.id, {
                        groups: [...section.groups, { id: uid(), label: "", text: "" }],
                      })
                    }
                  >
                    <Plus className="size-4" /> Add group
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}