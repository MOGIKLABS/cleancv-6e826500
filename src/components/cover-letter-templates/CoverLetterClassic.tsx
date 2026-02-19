import { CoverLetterData, CVCustomisation } from "@/types/cv";
import { Mail, Smartphone, MapPin, Linkedin, Github, Globe } from "lucide-react";

interface Props {
  data: CoverLetterData;
  customisation: CVCustomisation;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  additionalInfo: string;
  formatDate: (d: string) => string;
}

const renderSignature = (data: CoverLetterData, c: CVCustomisation, fullName: string) => (
  <div className="relative">
    {data.signOff && <p className="mb-1">{data.signOff}</p>}
    {data.signatureMode === "typed" && data.signatureTyped ? (
      <p className="my-2" style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: `${(data.signatureSize ?? 30) * 0.8}pt`, marginLeft: `${data.signatureOffsetX ?? 0}mm`, marginTop: `${data.signatureOffsetY ?? 0}mm` }}>
        {data.signatureTyped}
      </p>
    ) : data.signatureImage ? (
      <img src={data.signatureImage} alt="Signature" style={{ width: `${data.signatureSize ?? 30}mm`, height: `${data.signatureSize ?? 30}mm`, objectFit: "contain", marginLeft: `${data.signatureOffsetX ?? 0}mm`, marginTop: `${data.signatureOffsetY ?? 0}mm` }} className="my-2" />
    ) : null}
    <p style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 600 : 400 }}>{fullName}</p>
  </div>
);

const CoverLetterClassic = ({ data, customisation: c, fullName, email, phone, location, linkedin, github, additionalInfo, formatDate }: Props) => (
  <div
    className="bg-white shadow-sm mx-auto"
    style={{
      fontFamily: c.fontFamily,
      fontSize: `${c.fontSize}pt`,
      color: `hsl(${c.textColour})`,
      width: "210mm",
      minHeight: "297mm",
      lineHeight: 1.45,
    }}
  >
    <div className="flex" style={{ minHeight: "297mm" }}>
      <div className="flex-shrink-0" style={{ width: "8mm", backgroundColor: `hsl(${c.sidebarColour})` }} />
      <div style={{ flex: 1, padding: "20mm 22mm 18mm 18mm" }}>
        <header className="mb-4 pb-3" style={{ borderBottom: `1px solid hsl(${c.textColour} / 0.15)` }}>
          <h1 style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 700 : 500, fontSize: `${c.fontSize * 2}pt` }}>
            {fullName}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1" style={{ fontSize: `${c.fontSize * 0.85}pt`, opacity: 0.6 }}>
            {email && <a href={`mailto:${email}`} className="flex items-center gap-1 no-underline" style={{ color: "inherit" }}><Mail style={{ width: "0.9em", height: "0.9em" }} />{email}</a>}
            {phone && <span className="flex items-center gap-1"><Smartphone style={{ width: "0.9em", height: "0.9em" }} />{phone}</span>}
            {location && <span className="flex items-center gap-1"><MapPin style={{ width: "0.9em", height: "0.9em" }} />{location}</span>}
            {linkedin && <a href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ color: "inherit" }}><Linkedin style={{ width: "0.9em", height: "0.9em" }} />{linkedin}</a>}
            {github && <a href={github.startsWith("http") ? github : `https://${github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ color: "inherit" }}><Github style={{ width: "0.9em", height: "0.9em" }} />{github}</a>}
            {additionalInfo && <a href={additionalInfo.startsWith("http") ? additionalInfo : `https://${additionalInfo}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ color: "inherit" }}><Globe style={{ width: "0.9em", height: "0.9em" }} />{additionalInfo}</a>}
          </div>
        </header>

        {data.date && <p className="mb-3">{formatDate(data.date)}</p>}
        {data.jobTitle && <p className="mb-3" style={{ fontWeight: c.headingBold ? 600 : 400 }}>Re: {data.jobTitle}</p>}
        {data.recipientName && <p className="mb-3">{data.recipientName}</p>}

        {data.body && (
          <div className="mb-4 space-y-2" style={{ fontStyle: c.bodyItalic ? "italic" : "normal" }}>
            {data.body.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
          </div>
        )}

        {renderSignature(data, c, fullName)}
      </div>
    </div>
  </div>
);

export default CoverLetterClassic;
