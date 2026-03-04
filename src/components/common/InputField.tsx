import React, { ReactNode } from "react";
import { useTheme } from "@/providers/ThemeProvider";

interface InputFieldProps {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  required?: boolean;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  children,
  required = false,
  error,
}) => {
  const { currentTheme } = useTheme();

  const labelStyle =
    "block text-xs font-extrabold uppercase tracking-wide mb-1.5 opacity-90";
  const iconWrapperStyle =
    "absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none";

  return (
    <div className="relative">
      <label
        className={labelStyle}
        style={{ color: currentTheme.headingColor }}
      >
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div
            className={iconWrapperStyle}
            style={{ color: currentTheme.textColor }}
          >
            {icon}
          </div>
        )}
        {children}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 font-medium  p-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
};
