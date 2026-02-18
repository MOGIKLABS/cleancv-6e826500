import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import { Label } from "@/components/ui/label";

interface BulletTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

const BulletTextarea = ({ value, onChange, placeholder, rows = 3, label }: BulletTextareaProps) => {
  const toggleBullets = () => {
    const lines = value.split("\n").filter(Boolean);
    const allBulleted = lines.length > 0 && lines.every((l) => l.startsWith("• "));

    if (allBulleted) {
      // Remove bullets
      onChange(lines.map((l) => l.replace(/^• /, "")).join("\n"));
    } else {
      // Add bullets to lines that don't have them
      const bulleted = lines.map((l) => (l.startsWith("• ") ? l : `• ${l}`));
      onChange(bulleted.join("\n"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const target = e.currentTarget;
      const pos = target.selectionStart;

      // Shift+Enter always inserts a plain newline
      if (e.shiftKey) {
        e.preventDefault();
        const before = value.substring(0, pos);
        const after = value.substring(pos);
        onChange(before + "\n" + after);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = pos + 1;
        }, 0);
        return;
      }

      // Regular Enter: continue bullet if current line is bulleted
      const lines = value.substring(0, pos).split("\n");
      const currentLine = lines[lines.length - 1];

      if (currentLine.startsWith("• ")) {
        e.preventDefault();
        const before = value.substring(0, pos);
        const after = value.substring(pos);
        onChange(before + "\n• " + after);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = pos + 3;
        }, 0);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={toggleBullets}
          title="Toggle bullet points"
        >
          <List className="h-3 w-3" />
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};

export default BulletTextarea;
