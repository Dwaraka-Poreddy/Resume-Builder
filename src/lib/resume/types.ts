export type SectionLayout = "entries" | "bullets" | "groups" | "lines";
export type ColumnId = "main" | "side";

export interface Bullet {
  id: string;
  text: string;
}

export interface Entry {
  id: string;
  title: string;
  right: string;
  subtitle: string;
  subtitleRight: string;
  bullets: Bullet[];
}

export interface GroupItem {
  id: string;
  label: string;
  text: string;
}

export type Align = "left" | "center" | "right";

export interface Section {
  id: string;
  title: string;
  layout: SectionLayout;
  column: ColumnId;
  hidden: boolean;
  entries: Entry[];
  items: Bullet[];
  groups: GroupItem[];
  /** Per-section overrides. Undefined means "inherit the global design value". */
  boldTitle?: boolean | undefined;
  rule?: boolean | undefined;
  ruleWidth?: number | undefined;
  align?: Align | undefined;
  spaceBefore?: number | undefined;
  itemSpacing?: number | undefined;
}

export interface Contact {
  id: string;
  label: string;
  url: string;
}

export interface Design {
  fontFamily: string;
  textColor: string;
  headingColor: string;
  accentColor: string;
  fontSize: number;
  headingScale: number;
  lineHeight: number;
  sectionSpacing: number;
  columnSplit: number;
  letterSpacing: number;
  uppercaseHeadings: boolean;
  headerRule: boolean;
  nameSmallCaps: boolean;
  fitOnePage: boolean;
  boldSectionTitles: boolean;
  headingRule: boolean;
  headingRuleWidth: number;
  headingRuleGap: number;
  headingSpaceAfter: number;
  headingAlign: Align;
  headerAlign: Align;
  headerRuleWidth: number;
  entrySpacing: number;
  bulletSpacing: number;
  bulletIndent: number;
  itemSpacing: number;
  columnGap: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
}

export interface Resume {
  name: string;
  location: string;
  contacts: Contact[];
  sections: Section[];
  design: Design;
}

export const FONT_OPTIONS = [
  { label: "CMU Serif (LaTeX)", value: '"CMU Serif", "Latin Modern Roman", Georgia, serif' },
  { label: "Georgia", value: 'Georgia, "Times New Roman", serif' },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Charter / Charis", value: 'Charter, "Charis SIL", Georgia, serif' },
  { label: "Helvetica / Arial", value: 'Helvetica, Arial, sans-serif' },
  { label: "System sans", value: 'ui-sans-serif, system-ui, sans-serif' },
];

export const uid = () => Math.random().toString(36).slice(2, 10);