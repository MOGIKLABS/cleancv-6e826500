import { CVData } from "@/types/cv";
import { Mail, Phone, MapPin } from "lucide-react";

interface CVPreviewProps {
  data: CVData;
}

const CVPreview = ({ data }: CVPreviewProps) => {
  const { personal, experiences, education, skills } = data;

  return (
    <div className="cv-shadow rounded-lg overflow-hidden bg-cv-paper w-full max-w-[640px] mx-auto" style={{ aspectRatio: "8.5/11", fontSize: "11px" }}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-[35%] bg-cv-sidebar text-cv-sidebar-foreground p-5 flex flex-col gap-5">
          {/* Avatar placeholder */}
          <div className="w-16 h-16 rounded-full bg-cv-accent/20 border-2 border-cv-accent mx-auto flex items-center justify-center">
            <span className="text-cv-accent font-display font-bold text-lg">
              {personal.fullName.split(" ").map(n => n[0]).join("")}
            </span>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[9px] uppercase tracking-widest text-cv-accent font-semibold mb-2">Contact</h3>
            <div className="space-y-1.5 text-[9px]">
              <div className="flex items-center gap-1.5">
                <Mail className="h-2.5 w-2.5 text-cv-accent flex-shrink-0" />
                <span className="truncate">{personal.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-2.5 w-2.5 text-cv-accent flex-shrink-0" />
                <span>{personal.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-2.5 w-2.5 text-cv-accent flex-shrink-0" />
                <span>{personal.location}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-[9px] uppercase tracking-widest text-cv-accent font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((skill) => (
                <span key={skill} className="inline-block rounded bg-cv-accent/15 px-1.5 py-0.5 text-[8px] text-cv-accent">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-[9px] uppercase tracking-widest text-cv-accent font-semibold mb-2">Education</h3>
            {education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <p className="font-semibold text-[9px]">{edu.degree} {edu.field}</p>
                <p className="text-[8px] text-cv-sidebar-foreground/70">{edu.institution}</p>
                <p className="text-[8px] text-cv-accent">{edu.startDate} — {edu.endDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-5">
          {/* Header */}
          <div className="mb-4 border-b border-border pb-3">
            <h1 className="font-display text-xl font-bold text-foreground leading-tight">
              {personal.fullName}
            </h1>
            <p className="text-cv-accent font-medium text-[11px] mt-0.5">{personal.title}</p>
          </div>

          {/* Summary */}
          {personal.summary && (
            <div className="mb-4">
              <h2 className="text-[9px] uppercase tracking-widest text-cv-accent font-semibold mb-1.5">Profile</h2>
              <p className="text-foreground/80 text-[10px] leading-relaxed">{personal.summary}</p>
            </div>
          )}

          {/* Experience */}
          <div>
            <h2 className="text-[9px] uppercase tracking-widest text-cv-accent font-semibold mb-2">Experience</h2>
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[10px] text-foreground">{exp.position}</p>
                      <p className="text-[9px] text-muted-foreground">{exp.company}</p>
                    </div>
                    <span className="text-[8px] text-cv-accent whitespace-nowrap">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <p className="mt-1 text-[9px] text-foreground/75 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVPreview;
