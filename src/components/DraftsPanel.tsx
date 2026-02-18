import { useRef } from "react";
import { DraftData, deleteDraftFromHistory, exportDraftAsJSON, importDraftFromJSON } from "@/lib/drafts";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Upload, FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface DraftsPanelProps {
  drafts: DraftData[];
  currentDraftId: string;
  onLoad: (draft: DraftData) => void;
  onDraftsChange: (drafts: DraftData[]) => void;
  onImport: (draft: DraftData) => void;
}

const DraftsPanel = ({ drafts, currentDraftId, onLoad, onDraftsChange, onImport }: DraftsPanelProps) => {
  const importRef = useRef<HTMLInputElement>(null);

  const handleDelete = (id: string) => {
    const updated = deleteDraftFromHistory(id);
    onDraftsChange(updated);
    toast.success("Draft deleted.");
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const draft = await importDraftFromJSON(file);
      onImport(draft);
      toast.success("Draft imported successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to import draft.");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) +
      " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground underline underline-offset-4">My Drafts</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => importRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" />
            Import JSON
          </Button>
          <input ref={importRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImportFile} />
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No saved drafts yet.</p>
          <p className="text-xs mt-1">Click "Save Draft" to create your first snapshot.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors ${
                draft.id === currentDraftId ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {draft.label || "Untitled Draft"}
                  {draft.id === currentDraftId && (
                    <span className="ml-2 text-[10px] text-primary font-normal">(current)</span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">{formatDate(draft.savedAt)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {draft.id !== currentDraftId && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => onLoad(draft)}>
                    Load
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => exportDraftAsJSON(draft)} title="Export as JSON">
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(draft.id)} title="Delete draft">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftsPanel;
