import { CVData, CVCustomisation } from "@/types/cv";
import { TemplateClassic, TemplateModern, TemplateMinimal, TemplateCreative, TemplateExecutive } from "./cv-templates";
import { useEffect, useRef, useState } from "react";

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

const CVPreview = ({ data, customisation, onePage }: CVPreviewProps) => {
  const Template = templates[customisation.template];
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!onePage || !contentRef.current) {
      setScale(1);
      return;
    }

    // A4 height in px at 96dpi ≈ 1122px (297mm)
    const a4Height = 1122;
    const contentHeight = contentRef.current.scrollHeight;

    if (contentHeight > a4Height) {
      // Calculate scale but cap minimum at 0.65 to keep text legible
      const newScale = Math.max(0.65, a4Height / contentHeight);
      setScale(newScale);
    } else {
      setScale(1);
    }
  }, [onePage, data, customisation]);

  return (
    <div
      id="cv-preview"
      style={onePage ? {
        width: "210mm",
        height: "297mm",
        overflow: "hidden",
        position: "relative",
      } : undefined}
    >
      <div
        ref={contentRef}
        style={onePage && scale < 1 ? {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${100 / scale}%`,
        } : undefined}
      >
        <Template data={data} customisation={customisation} />
      </div>
    </div>
  );
};

export default CVPreview;
