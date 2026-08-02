import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {

  const baseUrl = "https://dapizzahub.in";

  return [
    {
      url: baseUrl,
      priority: 1,
      changeFrequency: "weekly",
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/menu`,
      priority: 0.9,
      changeFrequency: "weekly",
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,
      priority: 0.8,
      changeFrequency: "monthly",
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/policies/privacy`,
      priority: 0.5,
      changeFrequency: "yearly",
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/policies/refund`,
      priority: 0.5,
      changeFrequency: "yearly",
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/policies/terms`,
      priority: 0.5,
      changeFrequency: "yearly",
      lastModified: new Date(),
    },
  ];
}