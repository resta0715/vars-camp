import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { pageTitle } from "@/lib/brand";

export const metadata = { title: pageTitle("管理者ダッシュボード") };

export default function AdminPage() {
  return <AdminDashboard />;
}
