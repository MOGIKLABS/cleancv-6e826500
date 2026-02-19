import { CVCustomisation, TemplateName } from "@/types/cv";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Type } from "lucide-react";

interface Props {
  value: CVCustomisation;
  onChange: (v: CVCustomisation) => void;
}

const templates: { value: TemplateName; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "creative", label: "Creative" },
  { value: "executive", label: "Executive" },
];

const fonts = ["Inter", "Space Grotesk", "Georgia", "Merriweather", "Lato", "Roboto", "Playfair Display", "Montserrat", "Open Sans", "Raleway"];

const colourPresets = [
  { label: "Teal", primary: "174 72% 40%", sidebar: "220 55% 18%" },
  { label: "Navy", primary: "220 60% 35%", sidebar: "220 55% 14%" },
  { label: "Emerald", primary: "160 60% 38%", sidebar: "160 40% 16%" },
  { label: "Crimson", primary: "350 70% 45%", sidebar: "350 40% 18%" },
  { label: "Slate", primary: "215 20% 45%", sidebar: "215 25% 20%" },
  { label: "Gold", primary: "40 80% 48%", sidebar: "220 55% 18%" },
];

const CustomisationPanel = ({ value, onChange }: Props) => {
  const update = (partial: Partial<CVCustomisation>) => onChange({ ...value, ...partial });

  return (
    <div className="space-y-6 p-6">
      {/* Template selector */}
      <section>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
          <Palette className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Template</h2>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {templates.map(t => (
            <button
              key={t.value}
              onClick={() => {
                const updates: Partial<CVCustomisation> = { template: t.value };
                if (t.value === "classic" && value.sidebarColour === "0 0% 96%") {
                  updates.sidebarColour = "0 0% 0%";
                }
                if (t.value !== "classic" && value.template === "classic" && value.sidebarColour === "0 0% 0%") {
                  updates.sidebarColour = "0 0% 96%";
                }
                update(updates);
              }}
              className={`rounded-lg border p-2 text-xs font-medium text-center transition-all ${value.template === t.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Colour presets */}
      <section>
        <Label className="text-xs text-muted-foreground mb-2 block">Colour Preset</Label>
        <div className="flex flex-wrap gap-2">
          {colourPresets.map(cp => (
            <button
              key={cp.label}
              onClick={() => update({ primaryColour: cp.primary, sidebarColour: cp.sidebar })}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all hover:border-primary/50"
              style={{ borderColor: value.primaryColour === cp.primary ? `hsl(${cp.primary})` : undefined }}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${cp.primary})` }} />
              {cp.label}
            </button>
          ))}
        </div>
      </section>

      {/* Custom colours */}
      <section>
        <Label className="text-xs text-muted-foreground mb-1 block">Custom Primary Colour (HSL)</Label>
        <Input value={value.primaryColour} onChange={e => update({ primaryColour: e.target.value })} placeholder="174 72% 40%" className="mb-2" />
        <Label className="text-xs text-muted-foreground mb-1 block">Sidebar Colour (HSL)</Label>
        <Input value={value.sidebarColour} onChange={e => update({ sidebarColour: e.target.value })} placeholder="220 55% 18%" />
      </section>

      {/* Typography */}
      <section>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
          <Type className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Typography</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <Label className="text-xs text-muted-foreground">Body Font</Label>
            <Select value={value.fontFamily} onValueChange={v => update({ fontFamily: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Heading Font</Label>
            <Select value={value.headingFont} onValueChange={v => update({ headingFont: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <Label className="text-xs text-muted-foreground mb-1 block">Font Size: {value.fontSize}px</Label>
        <Slider value={[value.fontSize]} onValueChange={([v]) => update({ fontSize: v })} min={8} max={16} step={0.5} className="mb-3" />

        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Bold Headings</Label>
          <Switch checked={value.headingBold} onCheckedChange={v => update({ headingBold: v })} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <Label className="text-xs text-muted-foreground">Italic Body Text</Label>
          <Switch checked={value.bodyItalic} onCheckedChange={v => update({ bodyItalic: v })} />
        </div>
      </section>
    </div>
  );
};

export default CustomisationPanel;
