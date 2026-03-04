import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { MdCloudUpload } from "react-icons/md";

interface FileUploadProps {
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileCount: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  onChange,
  fileCount,
}) => {
  const { currentTheme } = useTheme();

  return (
    <div
      className="border-2 border-dashed rounded-xl flex-1 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-black/5 transition-all group min-h-[200px]"
      style={{ borderColor: currentTheme.borderColor }}
    >
      <input
        type="file"
        name="images"
        multiple
        onChange={onChange}
        className="hidden"
        id={id}
      />
      <label
        htmlFor={id}
        className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6"
      >
        <div className="w-16 h-16 rounded-full bg-blue-50 mx-auto flex items-center justify-center mb-4 text-blue-500 group-hover:scale-110 transition-transform">
          <MdCloudUpload size={32} />
        </div>
        <h3
          className="text-sm font-bold mb-1"
          style={{ color: currentTheme.headingColor }}
        >
          Drop files here or click to upload
        </h3>
        {fileCount > 0 ? (
          <div className="mt-2 text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
            {fileCount} files selected
          </div>
        ) : (
          <p
            className="text-xs opacity-50"
            style={{ color: currentTheme.textColor }}
          >
            Support for bulk upload (Max 5MB)
          </p>
        )}
      </label>
    </div>
  );
};
