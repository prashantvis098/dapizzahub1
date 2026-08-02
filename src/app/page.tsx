import { Hero } from "@/components/home/Hero";
import { QuickOrder } from "@/components/home/QuickOrder";
import { Offers } from "@/components/home/Offers";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { BestSellers } from "@/components/home/BestSellers";
import { Combos } from "@/components/home/Combos";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { About } from "@/components/home/About";
import { Reviews } from "@/components/home/Reviews";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { Branches } from "@/components/home/Branches";
import { FAQ } from "@/components/home/FAQ";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Quick Actions */}
      <QuickOrder />

      {/* Promotional Offers */}
      <Offers />

      {/* Browse Categories */}
      <FeaturedCategories />

      {/* Most Ordered */}
      <BestSellers />

      {/* Combo Deals */}
      <Combos />

      {/* Why Us */}
      <WhyChooseUs />

      {/* Brand Story */}
      <About />

      {/* Customer Reviews */}
      <Reviews />

      {/* Food Gallery */}
      <InstagramGallery />

      {/* Store Locations */}
      <Branches />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <FinalCTA />
    </>
  );
}