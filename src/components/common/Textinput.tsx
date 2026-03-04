import React, { forwardRef } from "react";
import { useTheme } from "@/providers/ThemeProvider";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({ name, ...props }, ref) => {
  const { currentTheme } = useTheme();

  const inputStyle = `
        w-full h-[42px] rounded-lg border px-3 pl-10 text-sm outline-none transition-all
        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
    `;

  return (
    <input
      ref={ref}
      name={name}
      className={inputStyle}
      style={{
        backgroundColor: currentTheme.background,
        borderColor: currentTheme.borderColor,
        color: currentTheme.textColor,
      }}
      {...props}
    />
  );
});

TextInput.displayName = "TextInput";
