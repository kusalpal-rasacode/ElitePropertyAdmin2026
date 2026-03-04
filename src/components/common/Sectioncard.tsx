import React, { ReactNode } from "react";
import { useTheme } from "@/providers/ThemeProvider";

interface SectionCardProps {
  stepNumber: number;
  title: string;
  bgColor?: string;
  textColor?: string;
  children: ReactNode;
  height?: string | number;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  stepNumber,
  title,
  bgColor = "bg-blue-50",
  textColor = "text-blue-600",
  children,
  height = "100%",
}) => {
  const { currentTheme } = useTheme();

  const cardStyle = {
    backgroundColor: currentTheme.cardBg,
    border: `1px solid ${currentTheme.borderColor}`,
    borderRadius: "12px",
    padding: "24px",
    height,
    display: "flex",
    flexDirection: "column" as const,
  };

  const sectionHeaderStyle =
    "flex items-center gap-2 mb-5 pb-3 border-b border-dashed";

  return (
    <div style={cardStyle}>
      <div
        className={sectionHeaderStyle}
        style={{ borderColor: currentTheme.borderColor }}
      >
        <div
          className={`w-8 h-8 rounded-lg ${bgColor} ${textColor} flex items-center justify-center font-bold text-sm`}
        >
          {stepNumber}
        </div>
        <h2
          className="text-sm font-bold ml-1"
          style={{ color: currentTheme.headingColor }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
};
