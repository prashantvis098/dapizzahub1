import { redirect } from "next/navigation";
import { isAdminRequestAuthenticated } from "@/lib/adminAuth";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export default async function AdminOrdersPage() {
  const authed = await isAdminRequestAuthenticated();

  if (!authed) {
    redirect("/admin/login");
  }

  return <AdminOrdersClient />;
}
