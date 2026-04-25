import React from "react";
import { Helmet } from "react-helmet";

interface PageTitleProps {
  title: string;
  description?: string; // optional meta description
}

const Title: React.FC<PageTitleProps> = ({ title }) => {
  return (
    <Helmet>
      <title>{title} | Musafir</title>
      {/* {description && <meta name="description" content={description} />} */}
    </Helmet>
  );
};

export default Title;
