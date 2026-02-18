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

/**
 * One-page strategy (in order of priority):
 * 1. Reduce margins & padding via a CSS class
 * 2. Tighten line-height & spacing
 * 3. Only then, scale transform as a last resort (min 0.78 to stay legible)
 */
const CVPreview = ({ data, customisation, onePage }: CVPreviewProps) => {
  const Template = templates[customisation.template];
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!onePage || !contentRef.current) {
      setScale(1);
      return;
    }

    // Wait a tick for the CSS class to apply first
    requestAnimationFrame(() => {
      if (!contentRef.current) return;
      const a4Height = 1122; // 297mm at 96dpi
      const contentHeight = contentRef.current.scrollHeight;

      if (contentHeight > a4Height) {
        // Scale only the remaining overflow — margins already reduced
        const newScale = Math.max(0.78, a4Height / contentHeight);
        setScale(newScale);
      } else {
        setScale(1);
      }
    });
  }, [onePage, data, customisation]);

  return (
    <div
      id="cv-preview"
      className={onePage ? "one-page-mode" : ""}
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
