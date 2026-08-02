import { PolicyPage } from "@/components/policy/PolicyPage";

export const metadata = {
  title: "Terms & Conditions | Da Pizza Hub",
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      description="Welcome to Da Pizza Hub. By accessing our website or placing an order, you agree to the following terms and conditions."
      sections={[
        {
          heading: "Use of Website",
          content: [
            "You agree to use this website only for lawful purposes.",
            "Any misuse of the website may result in restriction of access.",
          ],
        },
        {
          heading: "Orders",
          content: [
            "All orders are subject to confirmation and product availability.",
            "Da Pizza Hub reserves the right to refuse or cancel any order when necessary.",
          ],
        },
        {
          heading: "Pricing",
          content: [
            "Prices displayed on the website are subject to change without prior notice.",
            "Applicable taxes and delivery charges may be added during checkout.",
          ],
        },
        {
          heading: "Delivery",
          content: [
            "Estimated delivery times are approximate and may vary depending on weather, traffic or operational conditions.",
            "Delays caused by circumstances beyond our control do not automatically qualify for compensation.",
          ],
        },
        {
          heading: "Intellectual Property",
          content: [
            "All website content including logos, images, graphics and text belongs to Da Pizza Hub unless otherwise stated.",
            "Unauthorized copying or reproduction is prohibited.",
          ],
        },
        {
          heading: "Limitation of Liability",
          content: [
            "Da Pizza Hub shall not be liable for indirect or consequential damages arising from the use of this website or our services.",
          ],
        },
        {
          heading: "Changes to Terms",
          content: [
            "We reserve the right to update these Terms & Conditions at any time without prior notice.",
          ],
        },
        {
          heading: "Contact",
          content: [
            "If you have any questions regarding these Terms & Conditions, please contact us through our Contact page.",
          ],
        },
      ]}
    />
  );
}