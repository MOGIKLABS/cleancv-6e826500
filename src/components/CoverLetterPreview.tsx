import { CoverLetterData, CVData, CVCustomisation } from "@/types/cv";

interface CoverLetterPreviewProps {
  data: CoverLetterData;
  cvData: CVData;
  customisation: CVCustomisation;
}

const CoverLetterPreview = ({ data, cvData, customisation: c }: CoverLetterPreviewProps) => {
  const { personal } = cvData;

  // Use override values when set, otherwise fall back to CV data
  const fullName = data.overrideFullName || personal.fullName;
  const phone = data.overridePhone || personal.phone;
  const email = data.overrideEmail || personal.email;
  const linkedin = data.overrideLinkedin || personal.linkedin || "";
  const github = data.overrideGithub || personal.github || "";
  const location = data.overrideLocation || personal.location;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="bg-white text-black shadow-sm mx-auto"
      style={{
        fontFamily: c.fontFamily,
        fontSize: `${c.fontSize}pt`,
        color: `hsl(${c.textColour})`,
        width: "210mm",
        minHeight: "297mm",
        padding: "25mm 25mm 20mm 25mm",
        lineHeight: 1.6,
      }}
    >
      {/* Header - matches CV style */}
      <header className="mb-6">
        <h1
          style={{
            fontFamily: c.headingFont,
            fontWeight: c.headingBold ? 700 : 400,
            fontSize: `${c.fontSize * 2}pt`,
            color: `hsl(${c.primaryColour})`,
            letterSpacing: "-0.02em",
          }}
        >
          {fullName}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1" style={{ fontSize: `${c.fontSize * 0.85}pt` }}>
          {phone && <span>{phone}</span>}
          {email && <span>{email}</span>}
          {linkedin && <span>{linkedin}</span>}
          {github && <span>{github}</span>}
        </div>
        {location && (
          <p className="mt-0.5" style={{ fontSize: `${c.fontSize * 0.85}pt` }}>
            {location}
          </p>
        )}
      </header>

      {/* Date */}
      {data.date && <p className="mb-4">{formatDate(data.date)}</p>}

      {/* Job reference */}
      {data.jobTitle && (
        <p className="mb-4" style={{ fontWeight: c.headingBold ? 600 : 400 }}>
          Re: {data.jobTitle}
        </p>
      )}

      {/* Greeting */}
      {data.recipientName && <p className="mb-4">{data.recipientName}</p>}

      {/* Body */}
      {data.body && (
        <div className="mb-6 space-y-3" style={{ fontStyle: c.bodyItalic ? "italic" : "normal" }}>
          {data.body.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {/* Sign-off */}
      {data.signOff && <p className="mb-1">{data.signOff}</p>}

      {/* Signature */}
      {data.signatureImage && (
        <img src={data.signatureImage} alt="Signature" className="h-14 object-contain my-2" />
      )}

      {/* Name */}
      <p
        style={{
          fontFamily: c.headingFont,
          fontWeight: c.headingBold ? 600 : 400,
        }}
      >
        {fullName}
      </p>
    </div>
  );
};

export default CoverLetterPreview;
