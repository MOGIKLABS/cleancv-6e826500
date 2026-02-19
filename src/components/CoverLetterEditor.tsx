import { useState } from "react";
import { CoverLetterData, CVData, CVCustomisation } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Sparkles, Loader2, Upload, ImageIcon, Trash2, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BulletTextarea from "@/components/BulletTextarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CoverLetterEditorProps {
  data: CoverLetterData;
  cvData: CVData;
  jobDescription: string;
  onChange: (data: CoverLetterData) => void;
}

const CoverLetterEditor = ({ data, cvData, jobDescription, onChange }: CoverLetterEditorProps) => {
  const [generating, setGenerating] = useState(false);

  const update = (partial: Partial<CoverLetterData>) => onChange({ ...data, ...partial });

  const generateBody = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description in the ATS tab first.");
      return;
    }
    setGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("cv-ai", {
        body: { action: "cover-letter", cvData, jobDescription },
      });
      if (error) throw error;
      if (result?.body) {
        update({ body: result.body });
        toast.success("Cover letter generated in UK English.");
      }
    } catch (e: any) {
      toast.error(e.message || "Cover letter generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/jpeg") && !file.type.startsWith("image/png") && file.type !== "image/jpg") {
      toast.error("Please upload a JPG or PNG file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update({ signatureImage: reader.result, signatureMode: "image" });
      }
    };
    reader.readAsDataURL(file);
  };

  const wordCount = data.body.trim().split(/\s+/).filter(Boolean).length;
  const sigMode = data.signatureMode || "image";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
        <Mail className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">Cover Letter</h2>
      </div>

      {/* Editable contact fields (pre-filled from CV) */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Details (editable)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <Input
              value={data.overrideFullName !== undefined && data.overrideFullName !== "" ? data.overrideFullName : cvData.personal.fullName}
              onChange={(e) => update({ overrideFullName: e.target.value })}
              placeholder="Full Name"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Phone</Label>
            <Input
              value={data.overridePhone !== undefined && data.overridePhone !== "" ? data.overridePhone : cvData.personal.phone}
              onChange={(e) => update({ overridePhone: e.target.value })}
              placeholder="Phone"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              value={data.overrideEmail !== undefined && data.overrideEmail !== "" ? data.overrideEmail : cvData.personal.email}
              onChange={(e) => update({ overrideEmail: e.target.value })}
              placeholder="Email"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">LinkedIn</Label>
            <Input
              value={data.overrideLinkedin !== undefined && data.overrideLinkedin !== "" ? data.overrideLinkedin : (cvData.personal.linkedin || "")}
              onChange={(e) => update({ overrideLinkedin: e.target.value })}
              placeholder="LinkedIn URL"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Location</Label>
            <Input
              value={data.overrideLocation !== undefined && data.overrideLocation !== "" ? data.overrideLocation : cvData.personal.location}
              onChange={(e) => update({ overrideLocation: e.target.value })}
              placeholder="Location"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">GitHub / Portfolio URL</Label>
            <Input
              value={data.overrideGithub !== undefined && data.overrideGithub !== "" ? data.overrideGithub : (cvData.personal.github || "")}
              onChange={(e) => update({ overrideGithub: e.target.value })}
              placeholder="GitHub or Portfolio URL"
            />
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <Label className="text-xs text-muted-foreground">Additional Info (custom URL or note)</Label>
        <Input
          value={data.additionalInfo || ""}
          onChange={(e) => update({ additionalInfo: e.target.value })}
          placeholder="e.g. cleancv.mogiklabs.com or any extra info"
        />
        <p className="text-[10px] text-muted-foreground mt-1">Displayed as a clickable link with a globe icon in the preview.</p>
      </div>

      {/* Date */}
      <div>
        <Label className="text-xs text-muted-foreground">Date</Label>
        <Input type="date" value={data.date} onChange={(e) => update({ date: e.target.value })} />
      </div>

      {/* Job title */}
      <div>
        <Label className="text-xs text-muted-foreground">Re: Job Title / Role</Label>
        <Input
          value={data.jobTitle}
          onChange={(e) => update({ jobTitle: e.target.value })}
          placeholder="Events Manager - London - FTC"
        />
        <p className="text-[10px] text-muted-foreground mt-1">Tip: This auto-populates when you run an ATS check.</p>
      </div>

      {/* Greeting */}
      <div>
        <Label className="text-xs text-muted-foreground">Greeting</Label>
        <Input value={data.recipientName} onChange={(e) => update({ recipientName: e.target.value })} placeholder="Dear Hiring Manager," />
      </div>

      {/* AI Generate Button */}
      <Button onClick={generateBody} disabled={generating} variant="outline" className="w-full gap-2">
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {generating ? "Generating..." : "Generate ATS-Optimised Cover Letter"}
      </Button>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] ${wordCount > 500 ? "text-destructive" : "text-muted-foreground"}`}>
            {wordCount}/500 words
          </span>
        </div>
        <BulletTextarea
          label="Cover Letter Body"
          value={data.body}
          onChange={(v) => update({ body: v })}
          placeholder="Write or generate your cover letter body..."
          rows={12}
        />
      </div>

      {/* Sign-off */}
      <div>
        <Label className="text-xs text-muted-foreground">Sign-off</Label>
        <Input value={data.signOff} onChange={(e) => update({ signOff: e.target.value })} placeholder="Yours sincerely," />
      </div>

      {/* Signature section with tabs for image vs typed */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          <Label className="text-xs text-muted-foreground">Signature</Label>
        </div>

        <Tabs value={sigMode} onValueChange={(v) => update({ signatureMode: v as "image" | "typed" })}>
          <TabsList className="h-8">
            <TabsTrigger value="image" className="text-xs gap-1"><Upload className="h-3 w-3" />Upload Image</TabsTrigger>
            <TabsTrigger value="typed" className="text-xs gap-1"><Type className="h-3 w-3" />Type Signature</TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="mt-3 space-y-3">
            {data.signatureImage ? (
              <div className="flex items-center gap-2">
                <img
                  src={data.signatureImage}
                  alt="Signature"
                  className="h-16 object-contain rounded border border-border bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)_0_0/16px_16px] p-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => update({ signatureImage: "" })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                  <span>
                    <Upload className="h-3.5 w-3.5" />
                    Upload Signature Image
                    <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={handleSignatureUpload} />
                  </span>
                </Button>
              </label>
            )}
            <p className="text-[10px] text-muted-foreground">Supports JPG and PNG. Works for signatures, seals, or stamps.</p>
          </TabsContent>

          <TabsContent value="typed" className="mt-3 space-y-3">
            <Input
              value={data.signatureTyped || ""}
              onChange={(e) => update({ signatureTyped: e.target.value })}
              placeholder="Type your name"
              className="text-lg"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            />
            {data.signatureTyped && (
              <div className="rounded border border-border p-3 bg-background">
                <p className="text-muted-foreground text-[10px] mb-1">Preview:</p>
                <p style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: "24pt" }}>
                  {data.signatureTyped}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Shared size/offset controls */}
        {((sigMode === "image" && data.signatureImage) || (sigMode === "typed" && data.signatureTyped)) && (
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Size ({data.signatureSize ?? 30}mm)</Label>
              <Slider
                min={10}
                max={60}
                step={1}
                value={[data.signatureSize ?? 30]}
                onValueChange={([v]) => update({ signatureSize: v })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Horizontal offset ({data.signatureOffsetX ?? 0}mm)</Label>
              <Slider
                min={-50}
                max={100}
                step={1}
                value={[data.signatureOffsetX ?? 0]}
                onValueChange={([v]) => update({ signatureOffsetX: v })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Vertical offset ({data.signatureOffsetY ?? 0}mm)</Label>
              <Slider
                min={-30}
                max={30}
                step={1}
                value={[data.signatureOffsetY ?? 0]}
                onValueChange={([v]) => update({ signatureOffsetY: v })}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverLetterEditor;
