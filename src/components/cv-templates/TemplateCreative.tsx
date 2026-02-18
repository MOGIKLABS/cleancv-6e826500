import { CVData, CVCustomisation } from "@/types/cv";
import { Mail, Smartphone, MapPin, Linkedin, Github } from "lucide-react";

interface Props { data: CVData; customisation: CVCustomisation; }

const TemplateCreative = ({ data, customisation: c }: Props) => {
  const { personal, experiences, education, skills } = data;

  return (
    <div className="cv-shadow rounded-2xl overflow-hidden bg-white w-full max-w-[640px] mx-auto" style={{ fontFamily: c.fontFamily, fontSize: `${c.fontSize}px`, aspectRatio: "8.5/11" }}>
      {/* Diagonal header */}
      <div className="relative px-6 pt-5 pb-8" style={{ background: `linear-gradient(135deg, hsl(${c.sidebarColour}), hsl(${c.primaryColour}))` }}>
        <div className="flex items-center gap-4 text-white relative z-10">
          {personal.photo ? (
            <img src={personal.photo} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-xl font-bold" style={{ fontFamily: c.headingFont }}>
              {personal.fullName.split(" ").map(n => n[0]).join("")}
            </div>
          )}
          <div>
            <h1 className="text-lg leading-tight" style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 700 : 500 }}>{personal.fullName}</h1>
            <p className="text-[11px] opacity-80 mt-0.5">{personal.title}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-white" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </div>

      <div className="px-6 py-3 space-y-3" style={{ color: `hsl(${c.textColour})` }}>
        {/* Contact row */}
        <div className="flex flex-wrap gap-3 text-[8px] opacity-60">
          <a href={`mailto:${personal.email}`} className="flex items-center gap-1 underline"><Mail className="h-2.5 w-2.5" />{personal.email}</a>
          <span className="flex items-center gap-1"><Smartphone className="h-2.5 w-2.5" />{personal.phone}</span>
          <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{personal.location}</span>
          {personal.linkedin && <a href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline"><Linkedin className="h-2.5 w-2.5" />{personal.linkedin}</a>}
          {personal.github && <a href={personal.github.startsWith("http") ? personal.github : `https://${personal.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline"><Github className="h-2.5 w-2.5" />{personal.github}</a>}
        </div>

        {personal.summary && <p className="text-[10px] leading-relaxed opacity-75 rounded-lg p-2" style={{ backgroundColor: `hsl(${c.primaryColour} / 0.06)`, fontStyle: c.bodyItalic ? "italic" : "normal" }}>{personal.summary}</p>}

        {/* Skills pills */}
        <div className="flex flex-wrap gap-1">
          {skills.map(s => <span key={s} className="rounded-full px-2 py-0.5 text-[8px] font-medium" style={{ border: `1px solid hsl(${c.primaryColour} / 0.4)`, color: `hsl(${c.primaryColour})` }}>{s}</span>)}
        </div>

        <h2 className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont }}>Experience</h2>
        {experiences.map(exp => (
          <div key={exp.id} className="mb-2">
            <div className="flex justify-between items-start">
              <div><p className="font-semibold text-[10px]">{exp.position}</p><p className="text-[9px] opacity-50">{exp.company}</p></div>
              <span className="rounded-full px-2 py-0.5 text-[7px]" style={{ backgroundColor: `hsl(${c.primaryColour} / 0.1)`, color: `hsl(${c.primaryColour})` }}>{exp.startDate} — {exp.endDate}</span>
            </div>
            <p className="text-[9px] opacity-70 mt-0.5 leading-relaxed">{exp.description}</p>
          </div>
        ))}

        <h2 className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont }}>Education</h2>
        {education.map(edu => (
          <div key={edu.id} className="mb-1">
            <p className="font-semibold text-[9px]">{edu.degree} {edu.field}</p>
            <p className="text-[8px] opacity-50">{edu.institution} · {edu.startDate}–{edu.endDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateCreative;
