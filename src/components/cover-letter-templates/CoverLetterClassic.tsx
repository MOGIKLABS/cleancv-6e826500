import { CoverLetterData, CVCustomisation } from "@/types/cv";
import { Mail, Smartphone, MapPin, Linkedin, Github } from "lucide-react";

interface Props {
  data: CoverLetterData;
  customisation: CVCustomisation;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  formatDate: (d: string) => string;
}

const CoverLetterClassic = ({ data, customisation: c, fullName, email, phone, location, linkedin, github, formatDate }: Props) => (
  <div
    className="bg-white shadow-sm mx-auto"
    style={{
      fontFamily: c.fontFamily,
      fontSize: `${c.fontSize}pt`,
      color: `hsl(${c.textColour})`,
      width: "210mm",
      minHeight: "297mm",
      lineHeight: 1.6,
    }}
  >
    {/* Sidebar-style left accent + header – mirrors Classic CV */}
    <div className="flex" style={{ minHeight: "297mm" }}>
      {/* Left accent strip */}
      <div className="flex-shrink-0" style={{ width: "8mm", backgroundColor: `hsl(${c.sidebarColour})` }} />

      <div style={{ flex: 1, padding: "25mm 25mm 20mm 20mm" }}>
        <header className="mb-6 pb-3" style={{ borderBottom: `1px solid hsl(${c.textColour} / 0.15)` }}>
          <h1 style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 700 : 500, fontSize: `${c.fontSize * 2}pt` }}>
            {fullName}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1" style={{ fontSize: `${c.fontSize * 0.85}pt`, opacity: 0.6 }}>
            {email && <span className="flex items-center gap-1"><Mail style={{ width: "0.9em", height: "0.9em" }} />{email}</span>}
            {phone && <span className="flex items-center gap-1"><Smartphone style={{ width: "0.9em", height: "0.9em" }} />{phone}</span>}
            {location && <span className="flex items-center gap-1"><MapPin style={{ width: "0.9em", height: "0.9em" }} />{location}</span>}
            {linkedin && <span className="flex items-center gap-1"><Linkedin style={{ width: "0.9em", height: "0.9em" }} />{linkedin}</span>}
            {github && <span className="flex items-center gap-1"><Github style={{ width: "0.9em", height: "0.9em" }} />{github}</span>}
          </div>
        </header>

        {data.date && <p className="mb-4">{formatDate(data.date)}</p>}
        {data.jobTitle && <p className="mb-4" style={{ fontWeight: c.headingBold ? 600 : 400 }}>Re: {data.jobTitle}</p>}
        {data.recipientName && <p className="mb-4">{data.recipientName}</p>}

        {data.body && (
          <div className="mb-6 space-y-3" style={{ fontStyle: c.bodyItalic ? "italic" : "normal" }}>
            {data.body.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
          </div>
        )}

        <div className="relative">
          {data.signOff && <p className="mb-1">{data.signOff}</p>}
          {data.signatureImage && <img src={data.signatureImage} alt="Signature" className="h-14 object-contain my-2" />}
          <p style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 600 : 400 }}>{fullName}</p>
          {data.sealImage && (
            <img src={data.sealImage} alt="Seal" style={{ position: "absolute", width: `${data.sealSize ?? 30}mm`, height: `${data.sealSize ?? 30}mm`, objectFit: "contain", right: `${-(data.sealOffsetX ?? 0)}mm`, top: `${data.sealOffsetY ?? 0}mm`, pointerEvents: "none" }} />
          )}
        </div>
      </div>
    </div>
  </div>
);

export default CoverLetterClassic;
