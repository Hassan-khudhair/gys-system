import { createClient } from "../../lib/supabase/server";
import { DashboardShell } from "../../components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Super Admin";

  return (
    <DashboardShell adminName={adminName} email={user?.email}>
      {children}
    </DashboardShell>
  );
}
