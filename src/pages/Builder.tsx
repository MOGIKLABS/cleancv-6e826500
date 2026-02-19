import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Download, Sparkles, Loader2, Eye, PenLine, Save, Check, FileDown, Maximize, Undo2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CVEditor from "@/components/CVEditor";
import CVPreview from "@/components/CVPreview";
import ATSChecker from "@/components/ATSChecker";
import ApplicationLog from "@/components/ApplicationLog";
import CustomisationPanel from "@/components/CustomisationPanel";
import DraftsPanel from "@/components/DraftsPanel";
import TemplateSwitcherStrip from "@/components/TemplateSwitcherStrip";

import CoverLetterEditor from "@/components/CoverLetterEditor";
import CoverLetterPreview from "@/components/CoverLetterPreview";
import { CVData, CVCustomisation, CoverLetterData, defaultCVData, defaultCustomisation, defaultCoverLetterData } from "@/types/cv";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DraftData,
  loadCurrentDraft,
  saveCurrentDraft,
  loadAllDrafts,
  saveDraftToHistory,
  renameDraftInHistory,
  exportDraftAsJSON,
} from "@/lib/drafts";

const Builder = () => {
  const navigate = useNavigate();

  // Lazy-init from localStorage
  const [draftId, setDraftId] = useState<string>(() => {
    const d = loadCurrentDraft();
    return d?.id || crypto.randomUUID();
  });
  const [cvData, setCvData] = useState<CVData>(() => loadCurrentDraft()?.cvData ?? { ...defaultCVData });
  const [customisation, setCustomisation] = useState<CVCustomisation>(() => loadCurrentDraft()?.customisation ?? { ...defaultCustomisation });
  const [coverLetter, setCoverLetter] = useState<CoverLetterData>(() => loadCurrentDraft()?.coverLetter ?? { ...defaultCoverLetterData });
  const [jobDescription, setJobDescription] = useState(() => loadCurrentDraft()?.jobDescription ?? "");
  const [activeTab, setActiveTab] = useState("editor");
  const [polishing, setPolishing] = useState(false);
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const d = loadCurrentDraft();
    return d?.savedAt ? new Date(d.savedAt) : null;
  });
  const [justSaved, setJustSaved] = useState(false);
  const [onePage, setOnePage] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [drafts, setDrafts] = useState<DraftData[]>(() => loadAllDrafts());

  const saveDraft = useCallback(() => {
    // Preserve existing custom label if one was set via rename
    const existingDrafts = loadAllDrafts();
    const existingDraft = existingDrafts.find(d => d.id === draftId);
    const currentLabel = existingDraft?.label || cvData.personal.fullName || "Untitled Draft";

    const saved = saveCurrentDraft({
      id: draftId,
      label: currentLabel,
      cvData,
      customisation,
      coverLetter,
      jobDescription,
    });
    // Also save to history
    const updated = saveDraftToHistory(saved);
    setDrafts(updated);
    setLastSaved(new Date());
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [draftId, cvData, customisation, coverLetter, jobDescription]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  // Auto-save on tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => saveDraft();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveDraft]);

  const loadDraft = (draft: DraftData) => {
    setDraftId(draft.id);
    setCvData(draft.cvData);
    setCustomisation(draft.customisation);
    setCoverLetter(draft.coverLetter);
    setJobDescription(draft.jobDescription);
    // Also set as current
    saveCurrentDraft({ ...draft });
    setLastSaved(new Date(draft.savedAt));
    toast.success(`Loaded draft: ${draft.label}`);
  };

  const handleImportDraft = (draft: DraftData) => {
    const updated = saveDraftToHistory(draft);
    setDrafts(updated);
    loadDraft(draft);
  };

  const handlePolish = async () => {
    setPolishing(true);
    try {
      const { data, error } = await supabase.functions.invoke("cv-ai", {
        body: { action: "polish", cvData }
      });
      if (error) throw error;
      setCvData(data as CVData);
      toast.success("CV polished with UK English and industry-appropriate language.");
    } catch (e: any) {
      toast.error(e.message || "Polish failed. Please try again.");
    } finally {
      setPolishing(false);
    }
  };

  const getPreviewHtml = (): string => {
    const el = document.getElementById("cv-preview");
    if (!el) return "";
    return el.outerHTML;
  };

  const getExportFilename = (ext: string) => {
    const existingDrafts = loadAllDrafts();
    const currentDraft = existingDrafts.find(d => d.id === draftId);
    const label = currentDraft?.label || cvData.personal.fullName || "CV";
    const date = new Date().toISOString().slice(0, 10);
    return `${label}-${date}.${ext}`;
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const el = document.getElementById("cv-preview");
      if (!el) {
        toast.error("No CV preview found. Switch to preview first.");
        return;
      }

      const { default: html2canvas } = await import("html2canvas");
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const A4_W = 210;
      const A4_H = 297;
      const imgW = A4_W;
      const imgH = (canvas.height * A4_W) / canvas.width;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgData = canvas.toDataURL("image/png");

      if (imgH <= A4_H) {
        pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH);
      } else {
        let y = 0;
        while (y < imgH) {
          if (y > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, -y, imgW, imgH);
          y += A4_H;
        }
      }

      pdf.save(getExportFilename("pdf"));
      toast.success("PDF exported successfully.");
    } catch (e: any) {
      console.error("PDF export error:", e);
      toast.error("PDF export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      const htmlContent = getPreviewHtml();
      if (!htmlContent) {
        toast.error("No CV preview found. Switch to preview first.");
        return;
      }

      const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        * { box-sizing: border-box; }
        ul { margin: 4px 0; padding-left: 20px; }
        li { margin-bottom: 2px; }
      </style></head><body>${htmlContent}</body></html>`;

      const { default: HTMLtoDOCX } = await import("html-to-docx");
      const blob = await HTMLtoDOCX(fullHtml, null, {
        table: { row: { cantSplit: true } },
        footer: false,
        header: false,
      });

      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getExportFilename("docx");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("DOCX exported successfully.");
    } catch (e: any) {
      console.error("DOCX export error:", e);
      toast.error("DOCX export failed. Try PDF instead.");
    } finally {
      setExporting(false);
    }
  };

  const editorPanel = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
      <div className="border-b border-border px-3 sm:px-4 pt-2 overflow-x-auto">
        <TabsList className="h-9 w-full sm:w-auto">
          <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
          <TabsTrigger value="cover" className="text-xs">Cover Letter</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          <TabsTrigger value="ats" className="text-xs">ATS</TabsTrigger>
          <TabsTrigger value="drafts" className="text-xs">Drafts</TabsTrigger>
          <TabsTrigger value="log" className="text-xs">Apps</TabsTrigger>
        </TabsList>
      </div>
      {(activeTab === "editor" || activeTab === "cover") && (
        <TemplateSwitcherStrip value={customisation} onChange={setCustomisation} />
      )}
      <TabsContent value="editor" className="flex-1 overflow-hidden mt-0">
        <ScrollArea className="h-full">
          <CVEditor data={cvData} onChange={setCvData} />
        </ScrollArea>
      </TabsContent>
      <TabsContent value="cover" className="flex-1 overflow-hidden mt-0">
        <ScrollArea className="h-full">
          <CoverLetterEditor data={coverLetter} cvData={cvData} jobDescription={jobDescription} onChange={setCoverLetter} />
        </ScrollArea>
      </TabsContent>
      <TabsContent value="style" className="flex-1 overflow-hidden mt-0">
        <ScrollArea className="h-full">
          <CustomisationPanel value={customisation} onChange={setCustomisation} />
        </ScrollArea>
      </TabsContent>
      <TabsContent value="ats" className="flex-1 overflow-hidden mt-0">
        <ScrollArea className="h-full">
          <ATSChecker cvData={cvData} jobDescription={jobDescription} onJobDescriptionChange={setJobDescription} />
        </ScrollArea>
      </TabsContent>
      <TabsContent value="drafts" className="flex-1 overflow-hidden mt-0">
        <ScrollArea className="h-full">
          <DraftsPanel
            drafts={drafts}
            currentDraftId={draftId}
            onLoad={loadDraft}
            onDraftsChange={setDrafts}
            onImport={handleImportDraft}
            onRename={(id, newLabel) => {
              const updated = renameDraftInHistory(id, newLabel);
              setDrafts(updated);
            }}
          />
        </ScrollArea>
      </TabsContent>
      <TabsContent value="log" className="flex-1 overflow-hidden mt-0">
        <ScrollArea className="h-full">
          <ApplicationLog />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );

  const previewPanel = (
    <div className="p-4 sm:p-8 flex items-start justify-center min-h-full">
      <div className="w-full max-w-[210mm] origin-top scale-[0.6] sm:scale-[0.75] md:scale-100">
        {activeTab === "cover" ? (
          <CoverLetterPreview data={coverLetter} cvData={cvData} customisation={customisation} />
        ) : (
          <CVPreview data={cvData} customisation={customisation} onePage={onePage} />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-3 sm:px-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-8 w-8 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span className="font-display text-sm sm:text-base font-bold text-foreground truncate">CleanCV</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Save Draft */}
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={saveDraft}>
              {justSaved ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Save className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{justSaved ? "Saved!" : "Save Draft"}</span>
            </Button>
            {lastSaved && (
              <span className="text-[10px] text-muted-foreground hidden lg:inline whitespace-nowrap">
                Last saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>

          {/* One Page toggle */}
          <Button
            size="sm"
            variant={onePage ? "default" : "outline"}
            className="gap-1.5"
            onClick={() => setOnePage(!onePage)}
          >
            {onePage ? <Undo2 className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{onePage ? "Revert Original" : "One Page"}</span>
          </Button>

          {/* Polish */}
          <Button size="sm" variant="outline" className="gap-1.5 hidden sm:inline-flex" onClick={handlePolish} disabled={polishing}>
            {polishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{polishing ? "Polishing..." : "Polish CV"}</span>
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 sm:hidden" onClick={handlePolish} disabled={polishing}>
            {polishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          </Button>

          {/* Export CV dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5" disabled={exporting}>
                {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Export CV</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPdf} className="gap-2 cursor-pointer">
                <Download className="h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportDocx} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Export as DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Desktop: side-by-side */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-border flex flex-col">
          {editorPanel}
        </div>
        <div className="w-1/2 bg-muted/50 overflow-auto">
          {previewPanel}
        </div>
      </div>

      {/* Mobile: toggled view */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        <div className={`flex-1 overflow-hidden flex flex-col ${mobileView === "editor" ? "" : "hidden"}`}>
          {editorPanel}
        </div>
        <div className={`flex-1 overflow-auto bg-muted/50 ${mobileView === "preview" ? "" : "hidden"}`}>
          {previewPanel}
        </div>

        {/* Mobile toggle bar */}
        <div className="border-t border-border bg-card flex">
          <button
            onClick={() => setMobileView("editor")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-colors ${
              mobileView === "editor" ? "text-foreground bg-muted/50" : "text-muted-foreground"
            }`}
          >
            <PenLine className="h-4 w-4" />
            Editor
          </button>
          <button
            onClick={() => setMobileView("preview")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-colors ${
              mobileView === "preview" ? "text-foreground bg-muted/50" : "text-muted-foreground"
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default Builder;
