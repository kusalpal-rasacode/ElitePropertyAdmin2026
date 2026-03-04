import React, { ReactNode } from "react";
import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";
import { MdArrowBack } from "react-icons/md";

interface PageHeaderProps {
  backLink: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  backLink,
  title,
  subtitle,
  actions,
}) => {
  const { currentTheme } = useTheme();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <Link
          href={backLink}
          className="p-2 rounded-lg hover:bg-black/5 transition-colors shrink-0"
        >
          <MdArrowBack size={22} color={currentTheme.textColor} />
        </Link>
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: currentTheme.headingColor }}
          >
            {title}
          </h1>
          <p
            className="text-xs opacity-60"
            style={{ color: currentTheme.textColor }}
          >
            {subtitle}
          </p>
        </div>
      </div>
      {actions && <div className="flex gap-3 w-full md:w-auto">{actions}</div>}
    </div>
  );
};
