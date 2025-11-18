import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "bordered" | "elevated";
}

export function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  const variants = {
    default: "bg-white",
    bordered: "bg-white border-2 border-black",
    elevated:
      "bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black",
  };

  return (
    <div className={`p-6 ${variants[variant]} ${className}`}>{children}</div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return <h3 className={`text-2xl font-bold ${className}`}>{children}</h3>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={className}>{children}</div>;
}
