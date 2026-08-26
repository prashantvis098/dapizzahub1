import { brand } from "@/data/branches";
import type { Branch } from "@/types";

interface RestaurantSchemaProps {
  /** Primary branch fetched server-side (DB-backed when configured) —
   * see getBranches() in src/lib/data.ts — so this structured data
   * reflects admin-edited address/phone/coordinates. */
  primaryBranch: Branch;
}

export function RestaurantSchema({ primaryBranch }: RestaurantSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",

    name: brand.name,

    url: `https://${brand.website}`,

    logo: `https://${brand.website}/brand/logo.png`,

    image: `https://${brand.website}/brand/og-image.jpg`,

    telephone: primaryBranch.phone,

    servesCuisine: [
      "Pizza",
      "Italian",
      "Fast Food",
      "Vegetarian",
    ],

    priceRange: "₹₹",

    address: {
      "@type": "PostalAddress",
      streetAddress: primaryBranch.address,
      addressLocality: "Kanpur",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },

    geo: {
      "@type": "GeoCoordinates",
      latitude: primaryBranch.lat,
      longitude: primaryBranch.lng,
    },

    hasMap: primaryBranch.mapsUrl,

    sameAs: [
      brand.social.instagram,
      brand.social.facebook,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}