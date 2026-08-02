import { PolicyPage } from "@/components/policy/PolicyPage";

export const metadata = {
  title: "Refund Policy | Da Pizza Hub",
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      description="At Da Pizza Hub, customer satisfaction is our priority. This Refund Policy explains the situations where refunds or replacements may be provided."
      sections={[
        {
          heading: "Order Cancellation",
          content: [
            "Orders can only be cancelled before preparation begins.",
            "Once the kitchen starts preparing your order, cancellations may not be possible.",
          ],
        },
        {
          heading: "Refund Eligibility",
          content: [
            "Refunds may be issued if your order was not delivered.",
            "Refunds may be approved for incorrect or damaged orders after verification.",
            "Refund requests are reviewed individually by our support team.",
          ],
        },
        {
          heading: "Replacement Policy",
          content: [
            "If you receive an incorrect or damaged item, we may provide a replacement instead of a refund.",
          ],
        },
        {
          heading: "Refund Processing",
          content: [
            "Approved refunds are processed to the original payment method.",
            "Processing time may vary depending on your bank or payment provider.",
          ],
        },
        {
          heading: "Need Help?",
          content: [
            "For refund-related questions, please contact our support team through the Contact page or call the nearest Da Pizza Hub branch.",
          ],
        },
      ]}
    />
  );
}