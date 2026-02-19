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



  const getExportFilename = (prefix = "CV") => {
    const existingDrafts = loadAllDrafts();
    const currentDraft = existingDrafts.find(d => d.id === draftId);
    const label = currentDraft?.label || cvData.personal.fullName || prefix;
    const date = new Date().toISOString().slice(0, 10);
    return `${label}-${prefix}-${date}.pdf`;
  };

  const handleExportPdf = async (target: "cv" | "cover" = "cv") => {
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { jsPDF } = await import("jspdf");

      let captureEl: HTMLElement;
      let cleanupFn: (() => void) | null = null;

      const isClassicCv = target === "cv" && customisation.template === "classic";

      if (isClassicCv && classicExportRef.current) {
        // --- Fresh-render approach for Classic template ---
        const hiddenDiv = classicExportRef.current;
        hiddenDiv.style.width = "794px";
        hiddenDiv.style.position = "absolute";
        hiddenDiv.style.left = "-9999px";
        hiddenDiv.style.top = "0";
        hiddenDiv.style.display = "block";
        hiddenDiv.style.zIndex = "-1";

        // Force layout so we can measure
        hiddenDiv.offsetHeight;

        // Remove aspect-ratio so content flows naturally, then measure
        const cvShadow = hiddenDiv.querySelector<HTMLElement>(".cv-shadow");
        if (cvShadow) {
          cvShadow.style.aspectRatio = "unset";
          cvShadow.style.height = "auto";
        }
        const flexRow = cvShadow?.querySelector<HTMLElement>(":scope > div");
        if (flexRow) {
          flexRow.style.height = "auto";
          flexRow.style.minHeight = "0";
        }

        // Force layout to get natural content height
        hiddenDiv.offsetHeight;

        // Now measure the actual rendered height of both columns
        const mainCol = hiddenDiv.querySelector<HTMLElement>(".flex-1");
        const sidebarCol = flexRow?.querySelector<HTMLElement>(":scope > div:first-child");
        const naturalHeight = Math.max(
          mainCol?.scrollHeight || 0,
          sidebarCol?.scrollHeight || 0,
          cvShadow?.scrollHeight || 0
        );

        // Apply explicit height so sidebar stretches to match
        if (cvShadow) {
          cvShadow.style.height = `${naturalHeight}px`;
        }
        if (flexRow) {
          flexRow.style.height = `${naturalHeight}px`;
          flexRow.style.minHeight = `${naturalHeight}px`;
        }
        if (sidebarCol) {
          sidebarCol.style.height = `${naturalHeight}px`;
        }

        // Force layout again after height adjustment
        hiddenDiv.offsetHeight;

        captureEl = hiddenDiv.querySelector<HTMLElement>(".cv-shadow") || hiddenDiv;
        cleanupFn = () => {
          hiddenDiv.style.display = "none";
          const cvShadow = hiddenDiv.querySelector<HTMLElement>(".cv-shadow");
          if (cvShadow) { cvShadow.style.height = ""; cvShadow.style.aspectRatio = ""; }
          const flexRow = cvShadow?.querySelector<HTMLElement>(":scope > div");
          if (flexRow) { flexRow.style.height = ""; flexRow.style.minHeight = ""; }
          const sidebarCol = flexRow?.querySelector<HTMLElement>(":scope > div:first-child");
          if (sidebarCol) { sidebarCol.style.height = ""; }
        };
      } else {
        // --- Standard clone approach for other templates ---
        const elId = target === "cover" ? "cover-letter-preview" : "cv-preview";
        const wrapper = document.getElementById(elId);
        if (!wrapper) {
          toast.error(`No ${target === "cover" ? "cover letter" : "CV"} preview found.`);
          return;
        }
        const el = wrapper.querySelector<HTMLElement>(".cv-shadow") || wrapper;

        const sigBlocks = el.querySelectorAll<HTMLElement>(".signature-block");
        sigBlocks.forEach((b) => { b.style.pageBreakInside = "avoid"; b.style.breakInside = "avoid"; });

        const clone = el.cloneNode(true) as HTMLElement;
        clone.style.width = "794px";
        clone.style.maxWidth = "794px";
        clone.style.position = "absolute";
        clone.style.left = "-9999px";
        clone.style.top = "0";
        clone.style.zIndex = "-1";
        document.body.appendChild(clone);
        clone.offsetHeight;

        captureEl = clone;
        cleanupFn = () => {
          document.body.removeChild(clone);
          sigBlocks.forEach((b) => { b.style.pageBreakInside = ""; b.style.breakInside = ""; });
        };
      }

      const canvas = await html2canvas(captureEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      if (cleanupFn) cleanupFn();

      if (canvas.width === 0 || canvas.height === 0) {
        toast.error("Could not capture CV preview. Please try again.");
        return;
      }

      const A4_W = 210;
      const A4_H = 297;
      const MARGIN_X = 0;
      const contentW = A4_W;
      const imgH = (canvas.height * contentW) / canvas.width;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgData = canvas.toDataURL("image/png");

      if (target === "cover" && imgH > A4_H) {
        // Scale cover letter to fit one page
        const fitScale = A4_H / imgH;
        const scaledW = contentW * fitScale;
        const scaledH = A4_H;
        const offsetX = MARGIN_X + (contentW - scaledW) / 2;
        pdf.addImage(imgData, "PNG", offsetX, 0, scaledW, scaledH);
      } else if (imgH <= A4_H + 2) {
        // Single page — content fits naturally (with 2mm tolerance for rounding)
        pdf.addImage(imgData, "PNG", MARGIN_X, 0, contentW, Math.min(imgH, A4_H));
      } else {
        let y = 0;
        while (y < imgH) {
          if (y > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", MARGIN_X, -y, contentW, imgH);
          y += A4_H;
        }
      }

      pdf.save(getExportFilename(target === "cover" ? "CoverLetter" : "CV"));
      toast.success("PDF exported successfully.");
    } catch (e: any) {
      console.error("PDF export error:", e);
      toast.error("PDF export failed. Please try again.");
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
    <div className="flex h-screen flex-col bg-background">
      {/* Beta banner */}
      <div className="bg-primary/10 text-primary text-center text-xs py-1.5 px-4 font-medium tracking-wide border-b border-primary/20">
        CleanCV is currently in beta — some features under construction.
      </div>
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

          {/* Export PDF – context-aware */}
          <Button
            size="sm"
            className="gap-1.5"
            disabled={exporting}
            onClick={() => handleExportPdf(activeTab === "cover" ? "cover" : "cv")}
          >
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{activeTab === "cover" ? "Export Letter" : "Export CV"}</span>
          </Button>
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

      {/* Hidden offscreen Classic template for PDF export — avoids clone inheritance issues */}
      <div
        ref={classicExportRef}
        style={{ display: "none", position: "absolute", left: "-9999px", top: 0, width: "794px", zIndex: -1 }}
        className={onePage ? "one-page-mode" : ""}
      >
        <TemplateClassic data={cvData} customisation={customisation} />
      </div>
    </div>
  );
};

export default Builder;
