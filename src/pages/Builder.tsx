import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CVEditor from "@/components/CVEditor";
import CVPreview from "@/components/CVPreview";
import { CVData, defaultCVData } from "@/types/cv";

const Builder = () => {
  const navigate = useNavigate();
  const [cvData, setCvData] = useState<CVData>(defaultCVData);

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
        <Button size="sm" className="gap-2" onClick={() => window.print()}>
          <Download className="h-3.5 w-3.5" />
          Export PDF
        </Button>
      </header>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="w-1/2 border-r border-border">
          <ScrollArea className="h-full">
            <CVEditor data={cvData} onChange={setCvData} />
          </ScrollArea>
        </div>

        {/* Preview */}
        <div className="w-1/2 bg-muted/50 overflow-auto">
          <div className="p-8 flex items-start justify-center min-h-full">
            <CVPreview data={cvData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
