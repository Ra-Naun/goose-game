import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: keyof typeof BUTTON_COLOR_CLASSES;
}

const BUTTON_COLOR_CLASSES = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-900",
  secondary: "bg-gray-600 text-white hover:bg-gray-700 hover:border-gray-900",
  success: "bg-green-600 text-white hover:bg-green-700 hover:border-green-900",
  danger: "bg-red-600 text-white hover:bg-red-700 hover:border-red-900",
  warning: "bg-yellow-600 text-white hover:bg-yellow-700 hover:border-yellow-900",
  info: "bg-teal-600 text-white hover:bg-teal-700 hover:border-teal-900",
  light: "bg-gray-200 text-black hover:bg-gray-300 hover:border-gray-500",
  dark: "bg-gray-800 text-white hover:bg-gray-900",
  transparent: "bg-transparent text-blue-600 hover:border-transparent",
};

export const Button: React.FC<ButtonProps> = ({ children, color = "primary", className = "", ...props }) => (
  <button
    className={`
      ${BUTTON_COLOR_CLASSES[color]}
      text-white text-sm uppercase
      rounded-lg border border-transparent 
      px-4 py-2 font-medium font-inherit
      cursor-pointer transition-all duration-200 ease-in-out
      focus:outline-none focus-visible:outline-4 focus-visible:outline-blue-400
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);

export const ButtonWithOpacity: React.FC<ButtonProps> = ({ children, className = "", ...props }) => (
  <Button
    className={`
      opacity-30 hover:opacity-100 duration-400
      ${className}
    `}
    {...props}
  >
    {children}
  </Button>
);
