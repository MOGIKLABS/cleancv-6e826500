/**
 * Renders a description string that may contain bullet points (lines starting with "• ").
 * Returns either a <p> or a <ul> depending on content.
 */
export const renderDescription = (
  description: string,
  className?: string,
  style?: React.CSSProperties
) => {
  if (!description) return null;

  const lines = description.split("\n").filter(Boolean);
  const hasBullets = lines.some((l) => l.startsWith("• "));

  if (hasBullets) {
    const bulletLines = lines.filter((l) => l.startsWith("• "));
    const plainLines = lines.filter((l) => !l.startsWith("• "));

    return (
      <>
        {plainLines.length > 0 && (
          <p className={className} style={style}>
            {plainLines.join(" ")}
          </p>
        )}
        <ul className={`list-disc list-inside ${className || ""}`} style={style}>
          {bulletLines.map((line, i) => (
            <li key={i}>{line.replace(/^• /, "")}</li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <p className={className} style={style}>
      {description}
    </p>
  );
};
