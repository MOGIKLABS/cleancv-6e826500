import { CVCustomisation, TemplateName } from "@/types/cv";

const templates: { value: TemplateName; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "creative", label: "Creative" },
  { value: "executive", label: "Executive" },
];

interface Props {
  value: CVCustomisation;
  onChange: (v: CVCustomisation) => void;
}

const TemplateSwitcherStrip = ({ value, onChange }: Props) => (
  <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 border-b border-border bg-muted/30 overflow-x-auto">
    <span className="text-[10px] text-muted-foreground uppercase tracking-wider whitespace-nowrap mr-1">Template:</span>
    {templates.map((t) => (
      <button
        key={t.value}
        onClick={() => {
          const updates: Partial<CVCustomisation> = { template: t.value };
          // Classic template defaults to black sidebar
          if (t.value === "classic" && value.sidebarColour === "0 0% 96%") {
            updates.sidebarColour = "0 0% 0%";
          }
          // Restore light sidebar when switching away from classic if it was black
          if (t.value !== "classic" && value.template === "classic" && value.sidebarColour === "0 0% 0%") {
            updates.sidebarColour = "0 0% 96%";
          }
          onChange({ ...value, ...updates });
        }}
        className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium whitespace-nowrap transition-all ${
          value.template === t.value
            ? "bg-primary text-primary-foreground"
            : "bg-background border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default TemplateSwitcherStrip;
