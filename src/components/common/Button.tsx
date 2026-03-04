import React, { ReactNode } from "react";
import { useTheme } from "@/providers/ThemeProvider";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: ReactNode;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  icon,
  className = "",
  ...props
}) => {
  const { currentTheme } = useTheme();

  const baseStyle =
    "flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2";

  if (variant === "primary") {
    return (
      <button
        className={`${baseStyle} text-white shadow-md hover:brightness-110 ${className}`}
        style={{ backgroundColor: currentTheme.primary }}
        {...props}
      >
        {icon}
        <span>{children}</span>
      </button>
    );
  }

  return (
    <button
      className={`${baseStyle} border hover:bg-black/5 ${className}`}
      style={{
        borderColor: currentTheme.borderColor,
        color: currentTheme.textColor,
      }}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};
