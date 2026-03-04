import React from "react";
import { useTheme } from "@/providers/ThemeProvider";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  required?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  name,
  className = "",
  required = false,
  ...props
}, ref) => {
  const { currentTheme } = useTheme();

  const textareaStyle = `
        w-full rounded-lg border p-3 text-sm outline-none 
        focus:border-blue-500 resize-none transition-all
        ${className}
    `;

  return (
    <textarea
      ref={ref}
      name={name}
      className={textareaStyle}
      style={{
        backgroundColor: currentTheme.background,
        borderColor: currentTheme.borderColor,
        color: currentTheme.textColor,
      }}
      {...props}
    />
  );
});

TextArea.displayName = "TextArea";
