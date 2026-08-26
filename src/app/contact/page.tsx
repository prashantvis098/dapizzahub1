import type { Metadata } from "next";

import { ContactHero } from "@/components/contact/ContactHero";
import { ContactCards } from "@/components/contact/ContactCards";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactMap } from "@/components/contact/ContactMap";
import { ContactFAQ } from "@/components/contact/ContactFAQ";
import { ContactCTA } from "@/components/contact/ContactCTA";
import { getBranches } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact Us | Da Pizza Hub",
  description:
    "Get in touch with Da Pizza Hub. Call, WhatsApp, visit our restaurant in Kanpur, or send us a message for orders, catering and enquiries.",
};

export default async function ContactPage() {
  // Server-fetched so admin edits to phone/WhatsApp/maps links (from
  // /admin/branches) show up here immediately, same as the homepage.
  const branches = await getBranches();
  const primaryBranch = branches.find((b) => b.id === "Panki") ?? branches[0];

  return (
    <>
      <ContactHero primaryBranch={primaryBranch} />
      <ContactCards branches={branches} />
      <ContactForm primaryBranch={primaryBranch} />
      <ContactMap primaryBranch={primaryBranch} />
      <ContactFAQ />
      <ContactCTA primaryBranch={primaryBranch} />
    </>
  );
}