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

const CoverLetterCreative = ({ data, customisation: c, fullName, email, phone, location, linkedin, github, formatDate }: Props) => (
  <div
    className="bg-white shadow-sm mx-auto overflow-hidden"
    style={{
      fontFamily: c.fontFamily,
      fontSize: `${c.fontSize}pt`,
      color: `hsl(${c.textColour})`,
      width: "210mm",
      minHeight: "297mm",
      lineHeight: 1.6,
    }}
  >
    {/* Diagonal gradient header – mirrors Creative CV */}
    <div className="relative text-white" style={{ background: `linear-gradient(135deg, hsl(${c.sidebarColour}), hsl(${c.primaryColour}))`, padding: "22mm 25mm 16mm 25mm" }}>
      <h1 className="relative z-10" style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 700 : 500, fontSize: `${c.fontSize * 2}pt` }}>
        {fullName}
      </h1>
      <div className="relative z-10 flex flex-wrap gap-x-4 gap-y-1 mt-2 opacity-90" style={{ fontSize: `${c.fontSize * 0.8}pt` }}>
        {email && <span className="flex items-center gap-1"><Mail style={{ width: "0.9em", height: "0.9em" }} />{email}</span>}
        {phone && <span className="flex items-center gap-1"><Smartphone style={{ width: "0.9em", height: "0.9em" }} />{phone}</span>}
        {location && <span className="flex items-center gap-1"><MapPin style={{ width: "0.9em", height: "0.9em" }} />{location}</span>}
        {linkedin && <span className="flex items-center gap-1"><Linkedin style={{ width: "0.9em", height: "0.9em" }} />{linkedin}</span>}
        {github && <span className="flex items-center gap-1"><Github style={{ width: "0.9em", height: "0.9em" }} />{github}</span>}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-white" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
    </div>

    <div style={{ padding: "12mm 25mm 20mm 25mm" }}>
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
        {data.signatureImage && (
          <img src={data.signatureImage} alt="Signature" style={{ width: `${data.signatureSize ?? 30}mm`, height: `${data.signatureSize ?? 30}mm`, objectFit: "contain", marginLeft: `${data.signatureOffsetX ?? 0}mm`, marginTop: `${data.signatureOffsetY ?? 0}mm` }} className="my-2" />
        )}
        <p style={{ fontFamily: c.headingFont, fontWeight: c.headingBold ? 600 : 400 }}>{fullName}</p>
      </div>
    </div>
  </div>
);

export default CoverLetterCreative;
