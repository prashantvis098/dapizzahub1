import type { Metadata } from "next";

import { ContactHero } from "@/components/contact/ContactHero";
import { ContactCards } from "@/components/contact/ContactCards";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactMap } from "@/components/contact/ContactMap";
import { ContactFAQ } from "@/components/contact/ContactFAQ";
import { ContactCTA } from "@/components/contact/ContactCTA";

export const metadata: Metadata = {
  title: "Contact Us | Da Pizza Hub",
  description:
    "Get in touch with Da Pizza Hub. Call, WhatsApp, visit our restaurant in Kanpur, or send us a message for orders, catering and enquiries.",
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactCards />
      <ContactForm />
      <ContactMap />
      <ContactFAQ />
      <ContactCTA />
    </>
  );
}