import { CVData, CVCustomisation } from "@/types/cv";
import { TemplateClassic, TemplateModern, TemplateMinimal, TemplateCreative, TemplateExecutive } from "./cv-templates";

interface CVPreviewProps {
  data: CVData;
  customisation: CVCustomisation;
  onePage?: boolean;
}

const templates = {
  classic: TemplateClassic,
  modern: TemplateModern,
  minimal: TemplateMinimal,
  creative: TemplateCreative,
  executive: TemplateExecutive,
};

/**
 * One-page mode: removes fixed aspect-ratio and applies moderate CSS spacing
 * adjustments so content reflows naturally within A4 dimensions.
 * NO scale transform — text stays readable at native font sizes.
 */
const CVPreview = ({ data, customisation, onePage }: CVPreviewProps) => {
  const Template = templates[customisation.template];

  return (
    <div
      id="cv-preview"
      className={onePage ? "one-page-mode" : ""}
    >
      <Template data={data} customisation={customisation} />
    </div>
  );
};

export default CVPreview;
