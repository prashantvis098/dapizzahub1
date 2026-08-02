import type { Metadata } from "next";
import { Inter, Fraunces, Bebas_Neue, Allura } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileOrderBar } from "@/components/cart/MobileOrderBar";

import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { AIAssistant } from "@/components/assistant/AIAssistant";
import { RestaurantSchema } from "@/components/seo/RestaurantSchema"; 


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
  display: "swap",
});

const allura = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dapizzahub.in"),

  title: {
    default: "Da Pizza Hub | 100% Pure Veg Premium Pizza",
    template: "%s | Da Pizza Hub",
  },

  description:
    "Freshly baked 100% Pure Veg pizzas, burgers, pasta, wraps, garlic bread, shakes and more. Order online from Da Pizza Hub with fast delivery and premium taste.",

  keywords: [
    "Da Pizza Hub",
    "Pizza",
    "Pure Veg Pizza",
    "Pizza Delivery",
    "Kanpur Pizza",
    "Best Pizza in Kanpur",
    "Veg Pizza",
    "Burgers",
    "Pasta",
    "Wraps",
    "Garlic Bread",
    "Shakes",
    "Restaurant",
    "Food Delivery",
  ],

  applicationName: "Da Pizza Hub",

  authors: [
    {
      name: "Da Pizza Hub",
    },
  ],

  creator: "Da Pizza Hub",

  publisher: "Da Pizza Hub",

  category: "Restaurant",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://dapizzahub.in",
    siteName: "Da Pizza Hub",

    title: "Da Pizza Hub | 100% Pure Veg Premium Pizza",

    description:
      "Freshly baked premium pizzas, burgers, pasta, wraps and more. Order online from Da Pizza Hub.",

    images: [
      {
        url: "/brand/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Da Pizza Hub",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Da Pizza Hub | 100% Pure Veg Premium Pizza",
    description:
      "Freshly baked premium pizzas, burgers, pasta, wraps and more.",

    images: ["/brand/og-image.jpg"],
  },

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  manifest: "/manifest.webmanifest",

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${bebasNeue.variable} ${allura.variable}`}
    >
      <body className="bg-bg text-ink-primary antialiased">
        <SmoothScrollProvider>

          <Navbar />

          <main>{children}</main>

          <Footer />

          <CartDrawer />

          <MobileOrderBar />

          <FloatingWhatsApp />

          <AIAssistant />

        </SmoothScrollProvider>
        <RestaurantSchema />
      </body>
    </html>
  );
}