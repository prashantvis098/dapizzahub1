import { brand, branches } from "@/data/branches";

export function RestaurantSchema() {
  const primaryBranch = branches[0];

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