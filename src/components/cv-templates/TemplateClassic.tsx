import { CVData, CVCustomisation } from "@/types/cv";
import { Mail, Smartphone, MapPin, Linkedin, Github } from "lucide-react";
import { renderDescription } from "./renderDescription";

interface Props {
  data: CVData;
  customisation: CVCustomisation;
}

const TemplateClassic = ({ data, customisation }: Props) => {
  const { personal, experiences, education, skills } = data;
  const c = customisation;

  const style = {
    "--cv-primary": c.primaryColour,
    "--cv-sidebar-bg": c.sidebarColour,
    "--cv-text": c.textColour,
    fontFamily: c.fontFamily,
    fontSize: `${c.fontSize}px`,
  } as React.CSSProperties;

  return (
    <div className="cv-shadow rounded-lg overflow-hidden bg-white w-full max-w-[640px] mx-auto" style={{ ...style, aspectRatio: "8.5/11" }}>
      <div className="flex h-full min-h-full">
        {/* Sidebar */}
        <div className="w-[38%] p-5 flex flex-col gap-4 text-white/90" style={{ backgroundColor: `hsl(${c.sidebarColour})` }}>
          {/* Photo / Initials */}
          <div className="w-24 h-24 rounded-full border-2 mx-auto flex items-center justify-center overflow-hidden" style={{ borderColor: `hsl(${c.primaryColour})` }}>
            {personal.photo ? (
              <img src={personal.photo} alt={personal.fullName} className="w-full h-full object-cover" style={{ imageRendering: "auto" }} />
            ) : (
              <span style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont, fontWeight: c.headingBold ? 700 : 500 }} className="text-xl">
                {personal.fullName.split(" ").map(n => n[0]).join("")}
              </span>
            )}
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: `hsl(${c.primaryColour})` }}>Contact</h3>
            <div className="space-y-2 text-[10px]">
              <div className="flex items-start gap-2"><Mail className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: `hsl(${c.primaryColour})` }} /><a href={`mailto:${personal.email}`} className="break-all underline">{personal.email}</a></div>
              <div className="flex items-start gap-2"><Smartphone className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: `hsl(${c.primaryColour})` }} /><span>{personal.phone}</span></div>
              <div className="flex items-start gap-2"><MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: `hsl(${c.primaryColour})` }} /><span>{personal.location}</span></div>
              {personal.linkedin && <div className="flex items-start gap-2"><Linkedin className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: `hsl(${c.primaryColour})` }} /><a href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="break-all underline">{personal.linkedin}</a></div>}
              {personal.github && <div className="flex items-start gap-2"><Github className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: `hsl(${c.primaryColour})` }} /><a href={personal.github.startsWith("http") ? personal.github : `https://${personal.github}`} target="_blank" rel="noopener noreferrer" className="break-all underline">{personal.github}</a></div>}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: `hsl(${c.primaryColour})` }}>Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span key={skill} className="inline-block rounded px-2 py-0.5 text-[9px]" style={{ backgroundColor: `hsl(${c.primaryColour} / 0.2)`, color: "white" }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: `hsl(${c.primaryColour})` }}>Education</h3>
            {education.map((edu) => (
              <div key={edu.id} className="mb-2.5">
                <p className="font-semibold text-[10px]">{edu.degree} {edu.field}{edu.grade ? ` — ${edu.grade}` : ""}</p>
                <p className="text-[9px] opacity-70">{edu.institution}</p>
                <p className="text-[9px]" style={{ color: `hsl(${c.primaryColour})` }}>{edu.startDate} — {edu.endDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-5" style={{ color: `hsl(${c.textColour})` }}>
          <div className="mb-4 border-b pb-3" style={{ borderColor: `hsl(${c.textColour} / 0.15)` }}>
            <h1 className="text-xl leading-tight" style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 700 : 500 }}>
              {personal.fullName}
            </h1>
            <p className="text-[11px] mt-0.5 font-medium" style={{ color: `hsl(${c.primaryColour})` }}>{personal.title}</p>
          </div>

          {personal.summary && (
            <div className="mb-4">
              <h2 className="text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont }}> Profile</h2>
              <p className="text-[10px] leading-relaxed opacity-80" style={{ fontStyle: c.bodyItalic ? "italic" : "normal" }}>{personal.summary}</p>
            </div>
          )}

          <div>
            <h2 className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: `hsl(${c.primaryColour})`, fontFamily: c.headingFont }}>Experience</h2>
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[10px]">{exp.position}</p>
                      <p className="text-[9px] opacity-60">{exp.company}</p>
                    </div>
                    <span className="text-[8px] whitespace-nowrap" style={{ color: `hsl(${c.primaryColour})` }}>{exp.startDate} — {exp.endDate}</span>
                  </div>
                  {renderDescription(exp.description, "mt-1 text-[9px] opacity-75 leading-relaxed", { fontStyle: c.bodyItalic ? "italic" : "normal" })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateClassic;
