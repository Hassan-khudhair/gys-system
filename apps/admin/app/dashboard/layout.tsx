import { createClient } from "../../lib/supabase/server";
import { DashboardShell } from "../../components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let gymName: string | undefined;
  let adminName: string | undefined;
  let gymId: string | null = null;

  if (user) {
    const { data: admin } = await supabase
      .from("gym_admins")
      .select("gym_id, name, gyms(name)")
      .eq("user_id", user.id)
      .single();

    gymId = admin?.gym_id ?? null;
    adminName = admin?.name ?? user.user_metadata?.full_name;
    const gymsData = admin?.gyms;
    if (Array.isArray(gymsData)) gymName = gymsData[0]?.name;
    else if (gymsData) gymName = (gymsData as { name: string }).name;
  }

  return (
    <DashboardShell
      gymName={gymName}
      adminName={adminName}
      email={user?.email}
      gymId={gymId}
    >
      {children}
    </DashboardShell>
  );
}
