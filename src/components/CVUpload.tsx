import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CVData } from "@/types/cv";
import { toast } from "sonner";

interface Props {
  onParsed: (data: CVData) => void;
}

const CVUpload = ({ onParsed }: Props) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB.");
      return;
    }

    setLoading(true);
    try {
      // Read file as text (works for .txt, .docx text extraction is limited)
      const text = await file.text();

      const { data, error } = await supabase.functions.invoke("cv-ai", {
        body: { action: "parse", rawText: text, fileName: file.name },
      });

      if (error) throw error;
      onParsed(data as CVData);
      toast.success("CV imported successfully. Review and edit as needed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to parse CV. Try copy-pasting the text instead.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground mb-3">Upload your existing CV to auto-fill the editor</p>
      <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {loading ? "Parsing..." : "Upload CV"}
      </Button>
      <p className="text-[10px] text-muted-foreground mt-2">Supports .txt, .md, plain text files · Max 5 MB</p>
      <input ref={inputRef} type="file" accept=".txt,.md,.text,.rtf" className="hidden" onChange={handleFile} />
    </div>
  );
};

export default CVUpload;
