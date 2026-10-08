const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export default function sitemap() {
  if (!siteUrl) return [];

  const baseUrl = siteUrl.replace(/\/$/, "");
  return ["/", "/collection", "/about", "/contact"].map((pathname) => ({
    url: `${baseUrl}${pathname}`,
    changeFrequency: pathname === "/" ? "weekly" : "monthly",
    priority: pathname === "/" ? 1 : 0.7,
  }));
}