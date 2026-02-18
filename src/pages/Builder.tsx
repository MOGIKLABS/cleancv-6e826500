import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Download, Sparkles, Loader2, Eye, PenLine, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CVEditor from "@/components/CVEditor";
import CVPreview from "@/components/CVPreview";
import ATSChecker from "@/components/ATSChecker";
import ApplicationLog from "@/components/ApplicationLog";
import CustomisationPanel from "@/components/CustomisationPanel";
import CVUpload from "@/components/CVUpload";
import CoverLetterEditor from "@/components/CoverLetterEditor";
import CoverLetterPreview from "@/components/CoverLetterPreview";
import { CVData, CVCustomisation, CoverLetterData, defaultCVData, defaultCustomisation, defaultCoverLetterData } from "@/types/cv";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_KEY = "cleancv-draft";

interface DraftData {
  cvData: CVData;
  customisation: CVCustomisation;
  coverLetter: CoverLetterData;
  jobDescription: string;
  savedAt: string;
}

const loadDraft = (): DraftData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
};

const Builder = () => {
  const navigate = useNavigate();
  const draft = loadDraft();

  const [cvData, setCvData] = useState<CVData>(draft?.cvData ?? defaultCVData);
  const [customisation, setCustomisation] = useState<CVCustomisation>(draft?.customisation ?? defaultCustomisation);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData>(draft?.coverLetter ?? defaultCoverLetterData);
  const [jobDescription, setJobDescription] = useState(draft?.jobDescription ?? "");
  const [activeTab, setActiveTab] = useState("editor");
  const [polishing, setPolishing] = useState(false);
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [lastSaved, setLastSaved] = useState<Date | null>(draft?.savedAt ? new Date(draft.savedAt) : null);
  const [justSaved, setJustSaved] = useState(false);

  const saveDraft = useCallback(() => {
    const payload: DraftData = {
      cvData,
      customisation,
      coverLetter,
      jobDescription,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setLastSaved(new Date());
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [cvData, customisation, coverLetter, jobDescription]);

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

  const editorPanel = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
      <div className="border-b border-border px-3 sm:px-4 pt-2 overflow-x-auto">
        <TabsList className="h-9 w-full sm:w-auto">
          <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
          <TabsTrigger value="cover" className="text-xs">Cover Letter</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          <TabsTrigger value="upload" className="text-xs">Import</TabsTrigger>
          <TabsTrigger value="ats" className="text-xs">ATS</TabsTrigger>
          <TabsTrigger value="log" className="text-xs">Apps</TabsTrigger>
        </TabsList>
      </div>
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
      <TabsContent value="upload" className="flex-1 overflow-hidden mt-0">
        <ScrollArea className="h-full">
          <div className="p-4 sm:p-6">
            <CVUpload onParsed={setCvData} />
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="ats" className="flex-1 overflow-hidden mt-0">
        <ScrollArea className="h-full">
          <ATSChecker cvData={cvData} jobDescription={jobDescription} onJobDescriptionChange={setJobDescription} />
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
          <CVPreview data={cvData} customisation={customisation} />
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
          <Button size="sm" variant="outline" className="gap-1.5 hidden sm:inline-flex" onClick={handlePolish} disabled={polishing}>
            {polishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{polishing ? "Polishing..." : "Polish CV"}</span>
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 sm:hidden" onClick={handlePolish} disabled={polishing}>
            {polishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
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
    </div>
  );
};

export default Builder;
