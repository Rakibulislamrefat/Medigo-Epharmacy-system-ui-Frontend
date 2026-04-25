import React from "react";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ children }) => {
  return <section className={`py-5 md:py-14 `}>{children}</section>;
};

export default SectionContainer;
