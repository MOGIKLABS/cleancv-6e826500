import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Download, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CVEditor from "@/components/CVEditor";
import CVPreview from "@/components/CVPreview";
import ATSChecker from "@/components/ATSChecker";
import ApplicationLog from "@/components/ApplicationLog";
import CustomisationPanel from "@/components/CustomisationPanel";
import CVUpload from "@/components/CVUpload";
import { CVData, CVCustomisation, defaultCVData, defaultCustomisation } from "@/types/cv";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Builder = () => {
  const navigate = useNavigate();
  const [cvData, setCvData] = useState<CVData>(defaultCVData);
  const [customisation, setCustomisation] = useState<CVCustomisation>(defaultCustomisation);
  const [polishing, setPolishing] = useState(false);

  const handlePolish = async () => {
    setPolishing(true);
    try {
      const { data, error } = await supabase.functions.invoke("cv-ai", {
        body: { action: "polish", cvData },
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

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-display text-base font-bold text-foreground">ResumeForge</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={handlePolish} disabled={polishing}>
            {polishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {polishing ? "Polishing..." : "Polish CV"}
          </Button>
          <Button size="sm" className="gap-2" onClick={() => window.print()}>
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor side with tabs */}
        <div className="w-1/2 border-r border-border flex flex-col">
          <Tabs defaultValue="editor" className="flex flex-col flex-1 overflow-hidden">
            <div className="border-b border-border px-4 pt-2">
              <TabsList className="h-9">
                <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
                <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
                <TabsTrigger value="upload" className="text-xs">Import</TabsTrigger>
                <TabsTrigger value="ats" className="text-xs">ATS Check</TabsTrigger>
                <TabsTrigger value="log" className="text-xs">Applications</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="editor" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <CVEditor data={cvData} onChange={setCvData} />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="style" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <CustomisationPanel value={customisation} onChange={setCustomisation} />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="upload" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <CVUpload onParsed={setCvData} />
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="ats" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <ATSChecker cvData={cvData} />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="log" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <ApplicationLog />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview */}
        <div className="w-1/2 bg-muted/50 overflow-auto">
          <div className="p-8 flex items-start justify-center min-h-full">
            <CVPreview data={cvData} customisation={customisation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
