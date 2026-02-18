import { CVData, CVCustomisation } from "@/types/cv";
import { Mail, Phone, MapPin, Linkedin, Github } from "lucide-react";

interface Props { data: CVData; customisation: CVCustomisation; }

const TemplateModern = ({ data, customisation: c }: Props) => {
  const { personal, experiences, education, skills } = data;

  return (
    <div className="cv-shadow rounded-lg overflow-hidden bg-white w-full max-w-[640px] mx-auto" style={{ fontFamily: c.fontFamily, fontSize: `${c.fontSize}px`, aspectRatio: "8.5/11" }}>
      {/* Header band */}
      <div className="px-6 py-4 text-white" style={{ backgroundColor: `hsl(${c.primaryColour})` }}>
        <div className="flex items-center gap-4">
          {personal.photo ? (
            <img src={personal.photo} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white/40" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center" style={{ fontFamily: c.headingFont }}>
              <span className="text-lg font-bold">{personal.fullName.split(" ").map(n => n[0]).join("")}</span>
            </div>
          )}
          <div>
            <h1 className="text-lg leading-tight" style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 700 : 500 }}>{personal.fullName}</h1>
            <p className="text-[11px] opacity-90">{personal.title}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-[8px] opacity-90">
          <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{personal.email}</span>
          <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{personal.phone}</span>
          <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{personal.location}</span>
          {personal.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-2.5 w-2.5" />{personal.linkedin}</span>}
          {personal.github && <span className="flex items-center gap-1"><Github className="h-2.5 w-2.5" />{personal.github}</span>}
        </div>
      </div>

      <div className="px-6 py-4 space-y-4" style={{ color: `hsl(${c.textColour})` }}>
        {personal.summary && (
          <div>
            <h2 className="text-[9px] uppercase tracking-widest font-semibold mb-1" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont }}>Profile</h2>
            <p className="text-[10px] leading-relaxed opacity-80" style={{ fontStyle: c.bodyItalic ? "italic" : "normal" }}>{personal.summary}</p>
          </div>
        )}

        <div>
          <h2 className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont }}>Experience</h2>
          {experiences.map(exp => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between">
                <div><p className="font-semibold text-[10px]">{exp.position}</p><p className="text-[9px] opacity-60">{exp.company}</p></div>
                <span className="text-[8px]" style={{ color: `hsl(${c.primaryColour})` }}>{exp.startDate} — {exp.endDate}</span>
              </div>
              <p className="text-[9px] opacity-75 mt-1 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <h2 className="text-[9px] uppercase tracking-widest font-semibold mb-1" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont }}>Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-1.5">
                <p className="font-semibold text-[9px]">{edu.degree} {edu.field}</p>
                <p className="text-[8px] opacity-60">{edu.institution} · {edu.startDate}–{edu.endDate}</p>
              </div>
            ))}
          </div>
          <div className="flex-1">
            <h2 className="text-[9px] uppercase tracking-widest font-semibold mb-1" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont }}>Skills</h2>
            <div className="flex flex-wrap gap-1">
              {skills.map(s => <span key={s} className="rounded-full px-2 py-0.5 text-[8px] text-white" style={{ backgroundColor: `hsl(${c.primaryColour})` }}>{s}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModern;
