import { CVData, CVCustomisation } from "@/types/cv";
import { Linkedin, Github, Mail, Smartphone, MapPin } from "lucide-react";
import { renderDescription } from "./renderDescription";

interface Props { data: CVData; customisation: CVCustomisation; }

const TemplateMinimal = ({ data, customisation: c }: Props) => {
  const { personal, experiences, education, skills } = data;

  return (
    <div className="cv-shadow rounded-lg overflow-hidden bg-white w-full max-w-[640px] mx-auto p-8" style={{ fontFamily: c.fontFamily, fontSize: `${c.fontSize}px`, color: `hsl(${c.textColour})`, aspectRatio: "8.5/11" }}>
      <div className="flex items-center gap-4 mb-4">
        {personal.photo && <img src={personal.photo} alt="" className="w-12 h-12 rounded-full object-cover" />}
        <div>
          <h1 className="text-xl leading-tight" style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 700 : 500 }}>{personal.fullName}</h1>
          <p className="text-[10px] opacity-60">{personal.title}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] opacity-60 mb-4 pb-3" style={{ borderBottom: `1px solid hsl(${c.primaryColour} / 0.3)` }}>
        <a href={`mailto:${personal.email}`} className="flex items-center gap-1 underline"><Mail className="h-2.5 w-2.5" />{personal.email}</a>
        <span className="flex items-center gap-1"><Smartphone className="h-2.5 w-2.5" />{personal.phone}</span>
        <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{personal.location}</span>
        {personal.linkedin && <a href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline"><Linkedin className="h-2.5 w-2.5" />{personal.linkedin}</a>}
        {personal.github && <a href={personal.github.startsWith("http") ? personal.github : `https://${personal.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline"><Github className="h-2.5 w-2.5" />{personal.github}</a>}
      </div>

      {personal.summary && <p className="text-[10px] leading-relaxed opacity-75 mb-4" style={{ fontStyle: c.bodyItalic ? "italic" : "normal" }}>{personal.summary}</p>}

      <h2 className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont }}>Experience</h2>
      {experiences.map(exp => (
        <div key={exp.id} className="mb-3 pl-3" style={{ borderLeft: `2px solid hsl(${c.primaryColour} / 0.4)` }}>
          <p className="font-semibold text-[10px]">{exp.position} <span className="font-normal opacity-50">at {exp.company}</span></p>
          <p className="text-[8px] opacity-50">{exp.startDate} — {exp.endDate}</p>
          {renderDescription(exp.description, "text-[9px] opacity-70 mt-0.5 leading-relaxed")}
        </div>
      ))}

      <div className="flex gap-6 mt-3">
        <div className="flex-1">
          <h2 className="text-[9px] uppercase tracking-widest font-semibold mb-1" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont }}>Education</h2>
          {education.map(edu => (
            <div key={edu.id} className="mb-1">
              <p className="text-[9px] font-semibold">{edu.degree} {edu.field}</p>
              <p className="text-[8px] opacity-50">{edu.institution} · {edu.startDate}–{edu.endDate}</p>
            </div>
          ))}
        </div>
        <div className="flex-1">
          <h2 className="text-[9px] uppercase tracking-widest font-semibold mb-1" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont }}>Skills</h2>
          <p className="text-[9px] opacity-70">{skills.join(" · ")}</p>
        </div>
      </div>
    </div>
  );
};

export default TemplateMinimal;
