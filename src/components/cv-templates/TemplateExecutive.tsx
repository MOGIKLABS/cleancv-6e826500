import { CVData, CVCustomisation } from "@/types/cv";
import { Mail, Smartphone, MapPin, Linkedin, Github } from "lucide-react";
import { renderDescription } from "./renderDescription";

interface Props { data: CVData; customisation: CVCustomisation; }

const TemplateExecutive = ({ data, customisation: c }: Props) => {
  const { personal, experiences, education, skills } = data;

  return (
    <div className="cv-shadow rounded-lg overflow-hidden bg-white w-full max-w-[640px] mx-auto" style={{ fontFamily: c.fontFamily, fontSize: `${c.fontSize}px`, color: `hsl(${c.textColour})`, aspectRatio: "8.5/11" }}>
      {/* Top gold/accent line */}
      <div className="h-1.5" style={{ backgroundColor: `hsl(${c.primaryColour})` }} />

      <div className="px-7 pt-5 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {personal.photo ? (
              <img src={personal.photo} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-offset-2" style={{ outlineColor: `hsl(${c.primaryColour})` }} />
            ) : null}
            <div>
              <h1 className="text-2xl tracking-tight" style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 700 : 500, letterSpacing: "-0.02em" }}>{personal.fullName}</h1>
              <p className="text-[11px] uppercase tracking-[0.15em] mt-0.5" style={{ color: `hsl(${c.primaryColour})` }}>{personal.title}</p>
            </div>
          </div>
          <div className="text-right text-[8px] opacity-60 space-y-0.5 pt-1">
            <p className="flex items-center justify-end gap-1"><Mail className="h-2.5 w-2.5" /><a href={`mailto:${personal.email}`} className="underline">{personal.email}</a></p>
            <p className="flex items-center justify-end gap-1"><Smartphone className="h-2.5 w-2.5" />{personal.phone}</p>
            <p className="flex items-center justify-end gap-1"><MapPin className="h-2.5 w-2.5" />{personal.location}</p>
            {personal.linkedin && <p className="flex items-center justify-end gap-1"><Linkedin className="h-2.5 w-2.5" /><a href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="underline">{personal.linkedin}</a></p>}
            {personal.github && <p className="flex items-center justify-end gap-1"><Github className="h-2.5 w-2.5" /><a href={personal.github.startsWith("http") ? personal.github : `https://${personal.github}`} target="_blank" rel="noopener noreferrer" className="underline">{personal.github}</a></p>}
          </div>
        </div>

        <div className="h-px mb-4" style={{ backgroundColor: `hsl(${c.primaryColour} / 0.3)` }} />

        {personal.summary && (
          <p className="text-[10px] leading-relaxed opacity-75 mb-4" style={{ fontStyle: c.bodyItalic ? "italic" : "normal" }}>{personal.summary}</p>
        )}

        <h2 className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2 pb-1" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont, borderBottom: `1px solid hsl(${c.primaryColour} / 0.2)` }}>Professional Experience</h2>
        {experiences.map(exp => (
          <div key={exp.id} className="mb-3">
            <div className="flex justify-between">
              <p className="text-[10px]"><span className="font-semibold">{exp.position}</span> · {exp.company}</p>
              <span className="text-[8px] opacity-50">{exp.startDate} — {exp.endDate}</span>
            </div>
            {renderDescription(exp.description, "text-[9px] opacity-70 mt-0.5 leading-relaxed")}
          </div>
        ))}

        <div className="flex gap-8 mt-3">
          <div className="flex-1">
            <h2 className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-1 pb-0.5" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont, borderBottom: `1px solid hsl(${c.primaryColour} / 0.2)` }}>Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-1.5">
                <p className="text-[9px] font-semibold">{edu.degree} {edu.field}{edu.grade ? ` — ${edu.grade}` : ""}</p>
                <p className="text-[8px] opacity-50">{edu.institution} · {edu.startDate}–{edu.endDate}</p>
              </div>
            ))}
          </div>
          <div className="flex-1">
            <h2 className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-1 pb-0.5" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont, borderBottom: `1px solid hsl(${c.primaryColour} / 0.2)` }}>Core Competencies</h2>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {skills.map(s => <span key={s} className="text-[8px] opacity-70">• {s}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateExecutive;
