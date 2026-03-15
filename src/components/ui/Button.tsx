import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText = "Loading...",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-semibold transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden group";

  const variants = {
    primary:
      "bg-black text-white hover:bg-gray-900 focus:ring-red-500 shadow-lg hover:shadow-xl active:scale-[0.98]",
    secondary:
      "bg-white text-black border-2 border-black hover:bg-gray-50 focus:ring-black shadow-md hover:shadow-lg active:scale-[0.98]",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl active:scale-[0.98]",
    ghost:
      "bg-transparent text-black hover:bg-gray-100 focus:ring-gray-400 active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Animated gradient overlay */}
      <span className="absolute inset-0 w-full h-full">
        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
        {variant === "primary" && (
          <span className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
        )}
        {variant === "danger" && (
          <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
        )}
      </span>

      {/* Floating bubbles effect */}
      <span className="absolute inset-0 overflow-hidden rounded-inherit">
        <span className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-700 group-hover:scale-150"></span>
        <span className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-full opacity-0 group-hover:opacity-15 blur-lg transition-all duration-500 group-hover:scale-150"></span>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full opacity-0 group-hover:opacity-10 blur-md transition-all duration-600 group-hover:scale-200"></span>
      </span>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{loadingText}</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
