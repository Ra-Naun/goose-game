import { forwardRef } from "react";
import { Skrepka } from "../Icons/Skrepka";
import { ErrorExclamationMarkInCircle } from "../Icons/ErrorExclamationMarkInCircle";

type InputSize = "sm" | "md" | "lg";

const sizeClasses: Record<InputSize, string> = {
  sm: "px-2 py-1 text-sm",
  md: "px-3 py-2 text-base",
  lg: "px-4 py-3 text-lg",
};

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  size?: InputSize;
  helperText?: string;
  color?: keyof typeof getColorClasses;
}

const getColorClasses = {
  default: (hasError: boolean) => `
    bg-zinc-900 placeholder-gray-500 text-gray-100
    focus:ring-2 focus:ring-blue-500/30
    ${hasError ? "border-red-500 focus:border-red-500" : "border-zinc-700 focus:border-blue-500/30"}
    disabled:bg-zinc-800 disabled:text-gray-500
  `,

  primary: (hasError: boolean) => `
    bg-gradient-to-r from-blue-700 to-blue-900 placeholder-blue-300 text-white
    focus:ring-4 focus:ring-blue-400/50
    ${hasError ? "border-red-600 focus:border-red-700" : "border-blue-600 focus:border-blue-700/30"}
    disabled:bg-blue-800 disabled:text-blue-300
  `,

  secondary: (hasError: boolean) => `
    bg-gray-800 placeholder-gray-400 text-gray-200
    focus:ring-2 focus:ring-gray-400/40
    ${hasError ? "border-red-500 focus:border-red-500" : "border-gray-600 focus:border-gray-700/30"}
    disabled:bg-gray-700 disabled:text-gray-500
  `,

  success: (hasError: boolean) => `
    bg-green-900 placeholder-green-300 text-green-100
    focus:ring-2 focus:ring-green-500/40
    ${hasError ? "border-red-500 focus:border-red-500" : "border-green-600 focus:border-green-700/30"}
    disabled:bg-green-800 disabled:text-green-400
  `,

  warning: (hasError: boolean) => `
    bg-yellow-900 placeholder-yellow-300 text-yellow-100
    focus:ring-2 focus:ring-yellow-500/40
    ${hasError ? "border-red-500 focus:border-red-500" : "border-yellow-600 focus:border-yellow-700/30"}
    disabled:bg-yellow-800 disabled:text-yellow-400
  `,
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { placeholder = "Enter...", color = "default", label, error, size = "md", className = "", helperText, ...props },
  ref,
) {
  return (
    <div className="w-full">
      {label && <label className="block mb-1.5 text-sm font-medium text-gray-300 select-none">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          className={`
            ${getColorClasses[color](!!error)}
            w-full rounded-lg border outline-none
            transition-colors duration-300 ease-in-out
            ${sizeClasses[size]}
             disabled:cursor-not-allowed
            ${className}
          `}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? "input-error" : helperText ? "input-helper" : undefined}
          {...props}
        />
        {error && (
          <ErrorExclamationMarkInCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
        )}
      </div>
      {error ? (
        <div id="input-error" className="text-xs text-red-500 mt-1 font-medium">
          {error}
        </div>
      ) : helperText ? (
        <div id="input-helper" className="text-xs text-gray-400 mt-1">
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

interface SelectFileProps extends React.InputHTMLAttributes<HTMLLabelElement> {
  selectedFile: File | null;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SelectFile = forwardRef<HTMLLabelElement, SelectFileProps>(function SelectFile(
  { selectedFile, handleFileChange, className = "", ...props },
  ref,
) {
  return (
    <>
      <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <label
        htmlFor="file-upload"
        className={`
          inline-flex items-center cursor-pointer px-5 py-3 
          bg-gradient-to-r from-blue-600 to-indigo-600 
          text-white font-semibold rounded-lg shadow-lg 
          hover:from-blue-700 hover:to-indigo-700 active:scale-95 
          transition-transform select-none
          ${className}
        `}
        {...props}
        ref={ref}
      >
        <Skrepka className="w-5 h-5 mr-2" />
        Выбрать файл
      </label>
      {selectedFile && (
        <div className="mt-4 flex flex-col items-center space-y-2">
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-md border border-gray-300 shadow"
          />
          <p className="text-gray-700 text-sm font-medium">{selectedFile.name}</p>
        </div>
      )}
    </>
  );
});
