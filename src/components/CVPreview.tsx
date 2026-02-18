import { CVData, CVCustomisation } from "@/types/cv";
import { TemplateClassic, TemplateModern, TemplateMinimal, TemplateCreative, TemplateExecutive } from "./cv-templates";

interface CVPreviewProps {
  data: CVData;
  customisation: CVCustomisation;
}

const templates = {
  classic: TemplateClassic,
  modern: TemplateModern,
  minimal: TemplateMinimal,
  creative: TemplateCreative,
  executive: TemplateExecutive,
};

const CVPreview = ({ data, customisation }: CVPreviewProps) => {
  const Template = templates[customisation.template];
  return <Template data={data} customisation={customisation} />;
};

export default CVPreview;
