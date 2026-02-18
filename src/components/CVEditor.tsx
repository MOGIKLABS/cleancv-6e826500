import { CVData, Experience, Education } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, User, Briefcase, GraduationCap, Wrench } from "lucide-react";

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
  const updatePersonal = (field: string, value: string) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    onChange({ ...data, experiences: [...data.experiences, newExp] });
  };

  const updateExperience = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      experiences: data.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experiences: data.experiences.filter((e) => e.id !== id) });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      education: data.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter((e) => e.id !== id) });
  };

  const updateSkills = (value: string) => {
    onChange({ ...data, skills: value.split(",").map((s) => s.trim()).filter(Boolean) });
  };

  return (
    <div className="space-y-8 p-6">
      {/* Personal Info */}
      <section>
        <SectionHeader icon={User} title="Personal Information" />
        <div className="grid gap-3">
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
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input value={data.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} placeholder="email@example.com" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input value={data.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} placeholder="+1 555 123 4567" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Location</Label>
            <Input value={data.personal.location} onChange={(e) => updatePersonal("location", e.target.value)} placeholder="San Francisco, CA" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Professional Summary</Label>
            <Textarea value={data.personal.summary} onChange={(e) => updatePersonal("summary", e.target.value)} placeholder="Brief professional summary..." rows={3} />
          </div>
        </div>
      </section>

      {/* Experience */}
      <section>
        <SectionHeader icon={Briefcase} title="Experience" />
        <div className="space-y-4">
          {data.experiences.map((exp) => (
            <div key={exp.id} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity"
                onClick={() => removeExperience(exp.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
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
                  <Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} placeholder="2021" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">End</Label>
                  <Input value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} placeholder="Present" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} placeholder="Key achievements and responsibilities..." rows={2} />
              </div>
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
          {data.education.map((edu) => (
            <div key={edu.id} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity"
                onClick={() => removeEducation(edu.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
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
                  <Input value={edu.startDate} onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} placeholder="2014" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">End</Label>
                  <Input value={edu.endDate} onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} placeholder="2018" />
                </div>
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
          <Label className="text-xs text-muted-foreground">Skills (comma separated)</Label>
          <Textarea
            value={data.skills.join(", ")}
            onChange={(e) => updateSkills(e.target.value)}
            placeholder="React, TypeScript, Node.js..."
            rows={2}
          />
        </div>
      </section>
    </div>
  );
};

export default CVEditor;
