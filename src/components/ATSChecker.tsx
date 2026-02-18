import { useState } from "react";
import { CVData } from "@/types/cv";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ATSResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

interface ATSCheckerProps {
  cvData: CVData;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
}

const ATSChecker = ({ cvData, jobDescription, onJobDescriptionChange }: ATSCheckerProps) => {
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("cv-ai", {
        body: { action: "ats", cvData, jobDescription },
      });
      if (error) throw error;
      setResult(data as ATSResult);
    } catch (e: any) {
      toast.error(e.message || "ATS check failed.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-destructive";
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">ATS Optimiser</h2>
      </div>
      <p className="text-xs text-muted-foreground">Paste the job description below to check how well your CV matches.</p>
      <Textarea
        value={jobDescription}
        onChange={(e) => onJobDescriptionChange(e.target.value)}
        placeholder="Paste the full job description here..."
        rows={6}
        className="text-sm"
      />
      <Button onClick={runCheck} disabled={loading} className="w-full gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
        {loading ? "Analysing..." : "Check ATS Match"}
      </Button>

      {result && (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          {/* Score */}
          <div className="text-center space-y-2">
            <p className={`font-display text-4xl font-bold ${scoreColor(result.score)}`}>{result.score}%</p>
            <Progress value={result.score} className="h-2" />
            <p className="text-xs text-muted-foreground">ATS Match Score</p>
          </div>

          {/* Matched */}
          {result.matchedKeywords.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs font-medium text-foreground">Matched Keywords</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {result.matchedKeywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="text-[10px]">{kw}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Missing */}
          {result.missingKeywords.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
                <span className="text-xs font-medium text-foreground">Missing Keywords</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {result.missingKeywords.map((kw) => (
                  <Badge key={kw} variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-700">{kw}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Suggestions</p>
              <ul className="space-y-1.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-primary font-semibold">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ATSChecker;
