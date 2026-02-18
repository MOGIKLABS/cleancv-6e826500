import { useState, useEffect } from "react";
import { ApplicationEntry, getApplications, saveApplications } from "@/types/application-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ClipboardList } from "lucide-react";

const statusColors: Record<ApplicationEntry["status"], string> = {
  sent: "bg-blue-100 text-blue-800",
  interview: "bg-purple-100 text-purple-800",
  rejected: "bg-red-100 text-red-800",
  offered: "bg-green-100 text-green-800",
  accepted: "bg-emerald-100 text-emerald-800",
};

const ApplicationLog = () => {
  const [entries, setEntries] = useState<ApplicationEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", notes: "" });

  useEffect(() => {
    setEntries(getApplications());
  }, []);

  const persist = (updated: ApplicationEntry[]) => {
    setEntries(updated);
    saveApplications(updated);
  };

  const addEntry = () => {
    if (!form.company.trim() || !form.role.trim()) return;
    const entry: ApplicationEntry = {
      id: Date.now().toString(),
      company: form.company,
      role: form.role,
      dateSent: new Date().toISOString().split("T")[0],
      status: "sent",
      notes: form.notes,
    };
    persist([entry, ...entries]);
    setForm({ company: "", role: "", notes: "" });
    setShowForm(false);
  };

  const updateStatus = (id: string, status: ApplicationEntry["status"]) => {
    persist(entries.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const remove = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Application Log</h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Log
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Company</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Position title" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." rows={2} />
          </div>
          <Button size="sm" onClick={addEntry} className="w-full">Add Application</Button>
        </div>
      )}

      {entries.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground text-center py-8">No applications logged yet. Click "Log" to track your first application.</p>
      )}

      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-border bg-card p-3 flex items-start justify-between gap-3 group">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">{entry.role}</p>
                <Badge className={`text-[10px] ${statusColors[entry.status]}`}>{entry.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{entry.company} · {entry.dateSent}</p>
              {entry.notes && <p className="text-xs text-muted-foreground/80">{entry.notes}</p>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Select value={entry.status} onValueChange={(v) => updateStatus(entry.id, v as ApplicationEntry["status"])}>
                <SelectTrigger className="h-7 w-24 text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => remove(entry.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationLog;
