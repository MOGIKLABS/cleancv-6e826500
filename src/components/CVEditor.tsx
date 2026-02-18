import { useState, KeyboardEvent, useRef } from "react";
import { CVData, Experience, Education } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, User, Briefcase, GraduationCap, Wrench, RotateCcw, Mail, Smartphone, MapPin, Linkedin, Github, ChevronUp, ChevronDown, X, Upload, Loader2 } from "lucide-react";
import PhotoUpload from "@/components/PhotoUpload";
import { defaultCVData } from "@/types/cv";
import MonthYearPicker from "@/components/MonthYearPicker";
import BulletTextarea from "@/components/BulletTextarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

interface CVEditorProps {
  data: CVData;
  onChange: (data: CVData) => void;
}

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
    <Icon className="h-4 w-4 text-primary" />
    <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
  </div>
);

const CVEditor = ({ data, onChange }: CVEditorProps) => {
  const [skillInput, setSkillInput] = useState("");
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const parseWithAI = async (text: string, source: string) => {
    setImporting(true);
    try {
      const { data: parsed, error } = await supabase.functions.invoke("cv-ai", {
        body: { action: "parse", rawText: text, fileName: source },
      });
      if (error) throw error;
      onChange(parsed as CVData);
      toast.success("CV imported — review and edit as needed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to parse CV.");
    } finally {
      setImporting(false);
    }
  };


  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = (textContent.items as any[]).map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File must be under 10 MB."); return; }

    toast.info(`"${file.name}" received — extracting content...`);

    try {
      let text = "";
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        text = await extractTextFromPdf(file);
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        text = await extractTextFromDocx(file);
      } else {
        toast.error("Please upload a .pdf or .docx file.");
        return;
      }

      if (!text.trim()) {
        toast.error("Could not extract any text from this file. It may be a scanned image.");
        return;
      }

      await parseWithAI(text, file.name);
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error("Failed to read file. Please try a different format.");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const updatePersonal = (field: string, value: string) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  // ── Experience helpers ──
  const addExperience = () => {
    const newExp: Experience = { id: Date.now().toString(), company: "", position: "", startDate: "", endDate: "", description: "" };
    onChange({ ...data, experiences: [...data.experiences, newExp] });
  };

  const updateExperience = (id: string, field: string, value: string) => {
    onChange({ ...data, experiences: data.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)) });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experiences: data.experiences.filter((e) => e.id !== id) });
  };

  const moveExperience = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= data.experiences.length) return;
    const items = [...data.experiences];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    onChange({ ...data, experiences: items });
  };

  // ── Education helpers ──
  const addEducation = () => {
    const newEdu: Education = { id: Date.now().toString(), institution: "", degree: "", field: "", startDate: "", endDate: "", inProgress: false };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: string, value: string | boolean) => {
    onChange({
      ...data,
      education: data.education.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, [field]: value };
        if (field === "inProgress" && value === true) {
          updated.endDate = "In Progress";
        }
        if (field === "inProgress" && value === false && e.endDate === "In Progress") {
          updated.endDate = "";
        }
        return updated;
      }),
    });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter((e) => e.id !== id) });
  };

  const moveEducation = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= data.education.length) return;
    const items = [...data.education];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    onChange({ ...data, education: items });
  };

  // ── Skills helpers ──
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !data.skills.includes(trimmed)) {
      onChange({ ...data, skills: [...data.skills, trimmed] });
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    onChange({ ...data, skills: data.skills.filter((s) => s !== skill) });
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
    if (e.key === "Backspace" && skillInput === "" && data.skills.length > 0) {
      removeSkill(data.skills[data.skills.length - 1]);
    }
  };

  const handleSkillInputChange = (value: string) => {
    if (value.includes(",")) {
      const parts = value.split(",");
      const newSkills = parts
        .slice(0, -1)
        .map((p) => p.trim())
        .filter((p) => p && !data.skills.includes(p));
      if (newSkills.length > 0) {
        onChange({ ...data, skills: [...data.skills, ...newSkills] });
      }
      setSkillInput(parts[parts.length - 1]);
    } else {
      setSkillInput(value);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* Personal Info */}
      <section>
        <SectionHeader icon={User} title="Personal Information" />
        <div className="grid gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <PhotoUpload
              photo={data.personal.photo}
              onPhotoChange={(url) => updatePersonal("photo", url)}
              onPhotoRemove={() => updatePersonal("photo", "")}
            />
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={importing} onClick={() => importRef.current?.click()}>
              {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {importing ? "Importing..." : "Import CV"}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => onChange({ personal: { fullName: "", title: "", email: "", phone: "", location: "", summary: "", linkedin: "", github: "", photo: data.personal.photo }, experiences: [], education: [], skills: [] })}>
              <RotateCcw className="h-3.5 w-3.5" />
              Clear All
            </Button>
            <input ref={importRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleImport} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input value={data.personal.fullName} onChange={(e) => updatePersonal("fullName", e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Job Title</Label>
              <Input value={data.personal.title} onChange={(e) => updatePersonal("title", e.target.value)} placeholder="Software Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />Email</Label>
              <Input value={data.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} placeholder="email@example.com" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1"><Smartphone className="h-3 w-3" />Phone</Label>
              <Input value={data.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} placeholder="+1 555 123 4567" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />Location</Label>
            <Input value={data.personal.location} onChange={(e) => updatePersonal("location", e.target.value)} placeholder="San Francisco, CA" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1"><Linkedin className="h-3 w-3" />LinkedIn</Label>
              <Input value={data.personal.linkedin || ""} onChange={(e) => updatePersonal("linkedin", e.target.value)} placeholder="linkedin.com/in/username" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1"><Github className="h-3 w-3" />GitHub</Label>
              <Input value={data.personal.github || ""} onChange={(e) => updatePersonal("github", e.target.value)} placeholder="github.com/username" />
            </div>
          </div>
          <BulletTextarea
            label="Professional Summary"
            value={data.personal.summary}
            onChange={(v) => updatePersonal("summary", v)}
            placeholder="Brief professional summary..."
            rows={3}
          />
        </div>
      </section>

      {/* Experience */}
      <section>
        <SectionHeader icon={Briefcase} title="Experience" />
        <div className="space-y-4">
          {data.experiences.map((exp, index) => (
            <div key={exp.id} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 relative group">
              {/* Top-right actions */}
              <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={index === 0} onClick={() => moveExperience(index, -1)} title="Move up">
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={index === data.experiences.length - 1} onClick={() => moveExperience(index, 1)} title="Move down">
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeExperience(exp.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Position</Label>
                  <Input value={exp.position} onChange={(e) => updateExperience(exp.id, "position", e.target.value)} placeholder="Software Engineer" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <Input value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} placeholder="Company Inc." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Start</Label>
                  <MonthYearPicker value={exp.startDate} onChange={(v) => updateExperience(exp.id, "startDate", v)} placeholder="Jan 2021" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">End</Label>
                  <MonthYearPicker value={exp.endDate} onChange={(v) => updateExperience(exp.id, "endDate", v)} placeholder="Present" />
                </div>
              </div>
              <BulletTextarea
                label="Description"
                value={exp.description}
                onChange={(v) => updateExperience(exp.id, "description", v)}
                placeholder="Key achievements and responsibilities..."
                rows={3}
              />
            </div>
          ))}
          <Button variant="outline" onClick={addExperience} className="w-full border-dashed">
            <Plus className="h-4 w-4 mr-2" /> Add Experience
          </Button>
        </div>
      </section>

      {/* Education */}
      <section>
        <SectionHeader icon={GraduationCap} title="Education" />
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={edu.id} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 relative group">
              {/* Top-right actions */}
              <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={index === 0} onClick={() => moveEducation(index, -1)} title="Move up">
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={index === data.education.length - 1} onClick={() => moveEducation(index, 1)} title="Move down">
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeEducation(edu.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Degree</Label>
                  <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} placeholder="B.S." />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Field</Label>
                  <Input value={edu.field} onChange={(e) => updateEducation(edu.id, "field", e.target.value)} placeholder="Computer Science" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Institution</Label>
                <Input value={edu.institution} onChange={(e) => updateEducation(edu.id, "institution", e.target.value)} placeholder="University Name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Start</Label>
                  <MonthYearPicker value={edu.startDate} onChange={(v) => updateEducation(edu.id, "startDate", v)} placeholder="Sep 2014" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">End</Label>
                  <MonthYearPicker value={edu.endDate} onChange={(v) => updateEducation(edu.id, "endDate", v)} placeholder="Jun 2018" />
                </div>
              </div>
              {/* In Progress checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`inProgress-${edu.id}`}
                  checked={edu.inProgress || false}
                  onCheckedChange={(checked) => updateEducation(edu.id, "inProgress", !!checked)}
                />
                <Label htmlFor={`inProgress-${edu.id}`} className="text-xs text-muted-foreground cursor-pointer">
                  In Progress (not yet graduated)
                </Label>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addEducation} className="w-full border-dashed">
            <Plus className="h-4 w-4 mr-2" /> Add Education
          </Button>
        </div>
      </section>

      {/* Skills */}
      <section>
        <SectionHeader icon={Wrench} title="Skills" />
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Type a skill and press Enter or comma to add</Label>
          <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-input bg-background min-h-[42px] items-center cursor-text" onClick={() => document.getElementById("skill-input")?.focus()}>
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeSkill(skill); }}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              id="skill-input"
              type="text"
              value={skillInput}
              onChange={(e) => handleSkillInputChange(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              onBlur={() => { if (skillInput.trim()) addSkill(skillInput); }}
              placeholder={data.skills.length === 0 ? "React, TypeScript, Node.js..." : "Add more..."}
              className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CVEditor;
