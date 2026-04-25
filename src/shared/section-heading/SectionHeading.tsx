import React from "react";

interface SectionHeadingProps {
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export const SectionParagraph: React.FC<{
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}> = ({ children, align = "left", className = "" }) => {
  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
        ? "text-right"
        : "text-center";
  return (
    <p className={`${alignClass} text-sm sm:text-base leading-relaxed text-slate-600 ${className}`}>
      {children}
    </p>
  );
};

const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  description,
  align = "center",
  className = "",
}) => {
  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
        ? "text-right"
        : "text-center";

  return (
    <div
      className={`
        
        max-w-full
        ${alignClass}
        ${className}
      `}
    >
      <h2
        className="
           
          text-lg sm:text-xl md:text-2xl lg:text-3xl
          mb-2 sm:mb-6
        "
      >
        {title}
      </h2>

      {description && (
        <p
          className="
           text-justify
            text-sm sm:text-base 
            leading-relaxed 
          "
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
