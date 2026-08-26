import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-ink-primary">
      <div className="flex min-h-screen">
        <AdminNav />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}