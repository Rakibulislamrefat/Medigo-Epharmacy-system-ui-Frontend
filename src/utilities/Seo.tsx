import { Helmet } from "react-helmet";
import Path from "./paths";

interface SEOProps {
  isHomepage?: boolean;
  pathname?: string;
}

export const SEO = ({ isHomepage = false }: SEOProps) => {
  const baseUrl = Path.client;

  return (
    <Helmet>
      <link rel="canonical" href={baseUrl} />
      {isHomepage ? (
        <meta name="robots" content="index, follow" />
      ) : (
        <meta name="robots" content="noindex, nofollow" />
      )}
      <meta property="og:url" content={baseUrl} />
    </Helmet>
  );
};
