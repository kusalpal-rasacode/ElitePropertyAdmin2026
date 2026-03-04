import React from "react";
import { useTheme } from "@/providers/ThemeProvider";

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  options: (string | SelectOption)[];
  placeholder?: string;
}

export const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(({
  name,
  options,
  placeholder = "Select an option",
  className,
  ...props
}, ref) => {
  const { currentTheme } = useTheme();

  const inputStyle = `
        w-full h-[42px] rounded-lg border px-3 pl-10 text-sm outline-none transition-all
        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
        ${className || ''}
    `;

  return (
    <select
      ref={ref}
      name={name}
      className={inputStyle}
      style={{
        backgroundColor: currentTheme.background,
        borderColor: currentTheme.borderColor,
        color: currentTheme.textColor,
      }}
      {...props}
    >
      <option value="">
        {placeholder}
      </option>
      {options.map((option, index) => {
        if (typeof option === 'object') {
          return <option key={option.value} value={option.value}>{option.label}</option>;
        }
        return <option key={option} value={option}>{option}</option>;
      })}
    </select>
  );
});

SelectInput.displayName = "SelectInput";
