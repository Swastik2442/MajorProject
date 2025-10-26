import { useEffect } from "react";

export default function Metadata({
  title = import.meta.env.VITE_APP_TITLE,
  description = "Intelligent Attack Detection System using NMS Data, LLMs, and Interactive Dashboard",
  url = import.meta.env.VITE_APP_URL
}: {
  title?: string;
  description?: string;
  url?: string;
}) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={import.meta.env.VITE_APP_TITLE} />
      <meta property="og:image" content={`${import.meta.env.VITE_APP_URL}/logo.jpeg`} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${import.meta.env.VITE_APP_URL}/logo.jpeg`} />
    </>
  )
}
