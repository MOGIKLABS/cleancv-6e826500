import { CoverLetterData, CVData, CVCustomisation, TemplateName } from "@/types/cv";
import {
  CoverLetterClassic,
  CoverLetterModern,
  CoverLetterMinimal,
  CoverLetterCreative,
  CoverLetterExecutive,
} from "@/components/cover-letter-templates";

interface CoverLetterPreviewProps {
  data: CoverLetterData;
  cvData: CVData;
  customisation: CVCustomisation;
}

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

const templateMap: Record<TemplateName, React.ComponentType<any>> = {
  classic: CoverLetterClassic,
  modern: CoverLetterModern,
  minimal: CoverLetterMinimal,
  creative: CoverLetterCreative,
  executive: CoverLetterExecutive,
};

const CoverLetterPreview = ({ data, cvData, customisation }: CoverLetterPreviewProps) => {
  const { personal } = cvData;

  const fullName = data.overrideFullName || personal.fullName;
  const phone = data.overridePhone || personal.phone;
  const email = data.overrideEmail || personal.email;
  const linkedin = data.overrideLinkedin || personal.linkedin || "";
  const github = data.overrideGithub || personal.github || "";
  const location = data.overrideLocation || personal.location;

  const Template = templateMap[customisation.template] || CoverLetterMinimal;

  return (
    <Template
      data={data}
      customisation={customisation}
      fullName={fullName}
      email={email}
      phone={phone}
      location={location}
      linkedin={linkedin}
      github={github}
      formatDate={formatDate}
    />
  );
};

export default CoverLetterPreview;
