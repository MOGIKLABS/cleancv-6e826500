import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Loader2, Eye, PenLine, Save, Check, FileDown, Maximize, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CVEditor from "@/components/CVEditor";
import CVPreview from "@/components/CVPreview";
import ATSChecker from "@/components/ATSChecker";
import ApplicationLog from "@/components/ApplicationLog";
import CustomisationPanel from "@/components/CustomisationPanel";
import DraftsPanel from "@/components/DraftsPanel";
import TemplateSwitcherStrip from "@/components/TemplateSwitcherStrip";

import CoverLetterEditor from "@/components/CoverLetterEditor";
import { TemplateClassic } from "@/components/cv-templates";
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

  const [draftId, setDraftId] = useState<string>(() => {
    const d = loadCurrentDraft();
    return d?.id || crypto.randomUUID();
  });
  const [cvData, setCvData] = useState<CVData>(() => loadCurrentDraft()?.cvData ?? { ...defaultCVData });
  const [customisation, setCustomisation] = useState<CVCustomisation>(() => loadCurrentDraft()?.customisation ?? { ...defaultCustomisation });
  const [coverLetter, setCoverLetter] = useState<CoverLetterData>(() => loadCurrentDraft()?.coverLetter ?? { ...defaultCoverLetterData });
  const [jobDescription, setJobDescription] = useState(() => loadCurrentDraft()?.jobDescription ?? "");
  const [activeTab, setActiveTab] = useState("editor");
  
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const d = loadCurrentDraft();
    return d?.savedAt ? new Date(d.savedAt) : null;
  });
  const [justSaved, setJustSaved] = useState(false);
  const [onePage, setOnePage] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [drafts, setDrafts] = useState<DraftData[]>(() => loadAllDrafts());

  const classicExportRef = useRef<HTMLDivElement>(null);

  const saveDraft = useCallback(() => {
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
    const updated = saveDraftToHistory(saved);
    setDrafts(updated);
    setLastSaved(new Date());
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [draftId, cvData, customisation, coverLetter, jobDescription]);

  useEffect(() => {
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [saveDraft]);

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
    saveCurrentDraft({ ...draft });
    setLastSaved(new Date(draft.savedAt));
    toast.success(`Loaded draft: ${draft.label}`);
  };

  const handleImportDraft = (draft: DraftData) => {
    const updated = saveDraftToHistory(draft);
    setDrafts(updated);
    loadDraft(draft);
  };

  const getExportFilename = (prefix = "CV") => {
    const existingDrafts = loadAllDrafts();
    const currentDraft = existingDrafts.find(d => d.id === draftId);
    const label = currentDraft?.label || cvData.personal.fullName || prefix;
    const date = new Date().toISOString().slice(0, 10);
    return `${label}-${prefix}-${date}.pdf`;
  };

  // --- THE ATS KILLER HAS BEEN REMOVED ---
  // Native print to PDF guarantees 100% vector text and perfectly readable ATS parsers
  const handleExportPdf = (target: "cv" | "cover" = "cv") => {
    setExporting(true);
    
    // Switch to the correct tab first so it is visible to the print engine
    if (target === "cover" && activeTab !== "cover") {
      setActiveTab("cover");
    } else if (target === "cv" && activeTab === "cover") {
      setActiveTab("editor");
    }

    // Give React 150ms to render the tab, then print
    setTimeout(() => {
      const originalTitle = document.title;
      document.title = getExportFilename(target === "cover" ? "CoverLetter" : "CV").replace('.pdf', ''); 
      
      window.print();
      
      document.title = originalTitle;
      setExporting(false);
      toast.success("PDF dialogue opened. Be sure to select 'Save as PDF'!");
    }, 150);
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
    <div className="p-4 sm:p-8 flex items-start justify-center min-h-full print:p-0 print:block">
      {/* print:scale-100 absolutely forces the zoom lock off during PDF export */}
      <div className="w-full max-w-[210mm] origin-top scale-[0.6] sm:scale-[0.75] md:scale-100 print:scale-100 print:w-full print:max-w-none">
        {activeTab === "cover" ? (
          <div id="cover-letter-preview">
            <CoverLetterPreview data={coverLetter} cvData={cvData} customisation={customisation} />
          </div>
        ) : (
          <CVPreview data={cvData} customisation={customisation} onePage={onePage} />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-background print:h-auto print:bg-white">
      {/* Beta banner - hidden on print */}
      <div className="bg-primary/10 text-primary text-center text-xs py-1.5 px-4 font-medium tracking-wide border-b border-primary/20 print:hidden">
        CleanCV is currently in beta — some features under construction.
      </div>
      
      {/* Top bar - hidden on print */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-3 sm:px-4 gap-2 print:hidden">
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

          <Button size="sm" variant={onePage ? "default" : "outline"} className="gap-1.5" onClick={() => setOnePage(!onePage)}>
            {onePage ? <Undo2 className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{onePage ? "Revert Original" : "One Page"}</span>
          </Button>

          <Button size="sm" className="gap-1.5" disabled={exporting} onClick={() => handleExportPdf(activeTab === "cover" ? "cover" : "cv")}>
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{activeTab === "cover" ? "Export Letter" : "Export CV"}</span>
          </Button>
        </div>
      </header>

      {/* Desktop: side-by-side */}
      <div className="hidden md:flex flex-1 overflow-hidden print:flex print:overflow-visible">
        {/* Editor sidebar - hidden on print */}
        <div className="w-1/2 border-r border-border flex flex-col print:hidden">
          {editorPanel}
        </div>
        {/* Preview pane - expands to full width on print */}
        <div className="w-1/2 bg-muted/50 overflow-auto print:w-full print:bg-white print:overflow-visible print:p-0">
          {previewPanel}
        </div>
      </div>

      {/* Mobile: toggled view - completely hidden on print */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden print:hidden">
        <div className={`flex-1 overflow-hidden flex flex-col ${mobileView === "editor" ? "" : "hidden"}`}>
          {editorPanel}
        </div>
        <div className={`flex-1 overflow-auto bg-muted/50 ${mobileView === "preview" ? "" : "hidden"}`}>
          {previewPanel}
        </div>

        <div className="border-t border-border bg-card flex">
          <button onClick={() => setMobileView("editor")} className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-colors ${mobileView === "editor" ? "text-foreground bg-muted/50" : "text-muted-foreground"}`}>
            <PenLine className="h-4 w-4" />
            Editor
          </button>
          <button onClick={() => setMobileView("preview")} className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-colors ${mobileView === "preview" ? "text-foreground bg-muted/50" : "text-muted-foreground"}`}>
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>

      <div ref={classicExportRef} style={{ display: "none", position: "absolute", left: "-9999px", top: 0, width: "794px", zIndex: -1 }} className={onePage ? "one-page-mode" : ""}>
        <TemplateClassic data={cvData} customisation={customisation} />
      </div>
    </div>
  );
};

export default Builder;
