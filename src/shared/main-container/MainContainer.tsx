import React from "react";

interface MainContainerProps {
  children: React.ReactNode;
}

const MainContainer: React.FC<MainContainerProps> = ({ children }) => {
  return <div className={`w-11/12 max-w-7xl mx-auto`}>{children}</div>;
};

export default MainContainer;
