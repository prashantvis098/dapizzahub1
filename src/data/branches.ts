import { Branch } from "@/types";

// Primary branch confirmed from client menu artwork.
// Other 3 branches are placeholders — replace with real addresses/numbers
// before going live. Search "PANKI_BRANCH_TODO" to find every field to update.
//
// IMPORTANT: Swiggy/Zomato only apply to the Panki branch (confirmed by
// client — the other 3 branches aren't listed on those platforms). Do not
// add swiggyUrl/zomatoUrl to other branches unless the client confirms
// they've since been listed.
export const branches: Branch[] = [
  {
    id: "Panki",
    name: "Da Pizza Hub – Panki",
    address: "Shop No. 9, K.D.A. Market, Near MIG Police Chowki, Panki, Kanpur (U.P.)",
    phone: "8081664965",
    whatsapp: "918081664965",
    mapsUrl: "https://maps.app.goo.gl/gieCWMwTnQwa9QtY8",
    swiggyUrl: "https://www.swiggy.com/city/kanpur/da-pizza-hub-panki-rest157167", // PANKI_BRANCH_TODO: replace with real Da Pizza Hub Panki Swiggy store link
    zomatoUrl: "https://www.zomato.com/kanpur/da-pizza-hub-2-panki", // PANKI_BRANCH_TODO: replace with real Da Pizza Hub Panki Zomato store link
    lat: 26.4726,
    lng: 80.2530,
  },
  {
    id: "Raniya",
    name: "Da Pizza Hub – Raniya", // PANKI_BRANCH_TODO: replace with real branch name
    address: "Raniya, Bhaunti, Rania, Uttar Pradesh 209305", // PANKI_BRANCH_TODO
    phone: "6393758677",
    whatsapp: "916393758677",
    mapsUrl: "https://maps.app.goo.gl/2y6Vdo9wDmqG9ZH47",
    lat: 26.4499,
    lng: 80.3319,
  },
  {
    id: "Rasulabad",
    name: "Da Pizza Hub – Rasulabad", // PANKI_BRANCH_TODO: replace with real branch name
    address: "SR Petrol Pump, Kanpur Road, Rasulabad, Uttar Pradesh 209306", // PANKI_BRANCH_TODO
    phone: "8318574525",
    whatsapp: "918318574525",
    mapsUrl: "https://maps.app.goo.gl/b3mWm1nudbUdBMoM6",
    lat: 26.4620,
    lng: 80.3450,
  },
  {
    id: "Jhinjhak",
    name: "Da Pizza Hub – Jhinjhak", // PANKI_BRANCH_TODO
    address: "Da Pizza Hub, Jhinjhak, Uttar Pradesh 209302",// PANKI_BRANCH_TODO
    phone: "9120609857".slice(0, 10),
    whatsapp: "919120609857",
    mapsUrl: "https://maps.app.goo.gl/hRR8qpaoaBX3VjBs8",
    lat: 26.4380,
    lng: 80.3120,
  },
];

export const brand = {
  name: "Da Pizza Hub",
  tagline: "Freshly Baked. 100% Pure Veg. Crafted To Perfection.",
  website: "www.dapizzahub.in",
  minOrder: 300,
  freeDeliveryRadiusKm: 3,
  // How far (in km) we search for "your nearest branch" via geolocation.
  // Per client: branches should be discoverable within a 25km radius of
  // the customer's detected location.
  nearestBranchSearchRadiusKm: 25,
  social: {
    instagram: "https://www.instagram.com/dapizzahubpanki/",
    facebook: "https://www.facebook.com/dapizzahubpankii/?ref=NONE_xav_ig_profile_page_web#",
    twitter: "#", // client doesn't have a Twitter account
  },
  footerLink: {
    label: "Upfigure",
    url: "https://www.upfigure.in/",
  },
  // Founder story — placeholder professional copy per client's brief
  // (husband-wife founders, ~8-9 years running Da Pizza Hub). Client will
  // supply the real photo and may want to adjust wording; search
  // "FOUNDER_TODO" to find everything to swap out.
  founders: {
    names: "Praveen Dixit", // FOUNDER_TODO: replace with real names
    photo: "/images/founder/husband-wife.webp", // FOUNDER_TODO: replace with real founder photo
    yearsInBusiness: 9,
    story: [
      "Da Pizza Hub began nearly a decade ago with a simple idea: pure vegetarian pizza that didn't compromise on taste, freshness, or honesty about what goes into it.",
      "What started as a single kitchen in Panki, run by a husband-and-wife team who believed Kanpur deserved a proper pure-veg pizza experience, has grown into four branches across the city — without ever losing the handmade, family-run feel that started it all.",
      "Every dough is still made fresh, every topping still chosen with the same care as the first day. Nine years in, that's still the whole point.",
    ],
  },
};