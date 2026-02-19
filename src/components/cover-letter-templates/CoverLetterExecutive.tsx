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

const CoverLetterExecutive = ({ data, customisation: c, fullName, email, phone, location, linkedin, github, formatDate }: Props) => (
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
    {/* Top accent line – mirrors Executive CV */}
    <div style={{ height: "4mm", backgroundColor: `hsl(${c.primaryColour})` }} />

    <div style={{ padding: "22mm 25mm 20mm 25mm" }}>
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 700 : 500, fontSize: `${c.fontSize * 2.2}pt`, letterSpacing: "-0.02em" }}>
            {fullName}
          </h1>
        </div>
        <div className="text-right space-y-0.5" style={{ fontSize: `${c.fontSize * 0.8}pt`, opacity: 0.6 }}>
          {email && <p className="flex items-center justify-end gap-1"><Mail style={{ width: "0.9em", height: "0.9em" }} />{email}</p>}
          {phone && <p className="flex items-center justify-end gap-1"><Smartphone style={{ width: "0.9em", height: "0.9em" }} />{phone}</p>}
          {location && <p className="flex items-center justify-end gap-1"><MapPin style={{ width: "0.9em", height: "0.9em" }} />{location}</p>}
          {linkedin && <p className="flex items-center justify-end gap-1"><Linkedin style={{ width: "0.9em", height: "0.9em" }} />{linkedin}</p>}
          {github && <p className="flex items-center justify-end gap-1"><Github style={{ width: "0.9em", height: "0.9em" }} />{github}</p>}
        </div>
      </header>

      <div style={{ height: "1px", backgroundColor: `hsl(${c.primaryColour} / 0.3)`, marginBottom: "6mm" }} />

      {data.date && <p className="mb-4">{formatDate(data.date)}</p>}
      {data.jobTitle && (
        <p className="mb-4" style={{ fontWeight: c.headingBold ? 600 : 400, fontFamily: c.headingFont, color: `hsl(${c.primaryColour})`, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: `${c.fontSize * 0.9}pt` }}>
          Re: {data.jobTitle}
        </p>
      )}
      {data.recipientName && <p className="mb-4">{data.recipientName}</p>}

      {data.body && (
        <div className="mb-6 space-y-3" style={{ fontStyle: c.bodyItalic ? "italic" : "normal" }}>
          {data.body.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
        </div>
      )}

      <div className="relative">
        {data.signOff && <p className="mb-1">{data.signOff}</p>}
        {data.signatureImage && (
          <img src={data.signatureImage} alt="Signature" style={{ width: `${data.signatureSize ?? 30}mm`, height: `${data.signatureSize ?? 30}mm`, objectFit: "contain", marginLeft: `${data.signatureOffsetX ?? 0}mm`, marginTop: `${data.signatureOffsetY ?? 0}mm` }} className="my-2" />
        )}
        <p style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 600 : 400 }}>{fullName}</p>
      </div>
    </div>
  </div>
);

export default CoverLetterExecutive;
