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
import { getMenuItems, getBranches } from "@/lib/data";

export default async function HomePage() {
  // Fetched server-side from the database (falls back to the static menu
  // files if DATABASE_URL isn't configured — see src/lib/data.ts) so
  // Best Sellers / Categories / Branches reflect admin edits without a
  // redeploy.
  const [menuItems, branches] = await Promise.all([getMenuItems(), getBranches()]);
  const bestSellers = menuItems.filter((item) => item.isBestSeller);
  const combos = menuItems.filter((item) => item.category === "combo");

  return (
    <>
      <Hero />

      {/* Quick Actions */}
      <QuickOrder branches={branches} />

      {/* Promotional Offers */}
      <Offers />

      {/* Browse Categories */}
      <FeaturedCategories menuItems={menuItems} />

      {/* Most Ordered */}
      <BestSellers items={bestSellers} />

      {/* Combo Deals */}
      <Combos combos={combos} />

      {/* Why Us */}
      <WhyChooseUs />

      {/* Brand Story */}
      <About />

      {/* Customer Reviews */}
      <Reviews />

      {/* Food Gallery */}
      <InstagramGallery />

      {/* Store Locations */}
      <Branches branches={branches} />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <FinalCTA primaryBranch={branches.find((b) => b.id === "Panki") ?? branches[0]} />
    </>
  );
}