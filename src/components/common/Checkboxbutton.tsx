import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

interface CheckboxButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const CheckboxButton: React.FC<CheckboxButtonProps> = ({
  label,
  className,
  checked,
  ...props
}) => {
  const { currentTheme } = useTheme();

  return (
    <label
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all w-full select-none
            ${checked ? "shadow-md transform scale-[1.02]" : "hover:bg-black/5"} ${className || ''}`}
      style={{
        borderColor: checked ? "transparent" : currentTheme.borderColor,
        backgroundColor: checked ? currentTheme.primary : "transparent",
        color: checked ? "#fff" : currentTheme.textColor,
      }}
    >
      <div className={`text-xl ${checked ? "text-white" : "opacity-40"}`}>
        {checked ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
      </div>
      <span className={`text-sm font-bold ${checked ? "text-white" : ""}`}>
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        className="hidden"
        {...props}
      />
    </label>
  );
};
