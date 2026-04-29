import { createClient } from "../../lib/supabase/server";
import { Sidebar } from "../../components/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let gymName: string | undefined;
  if (user) {
    const { data: admin } = await supabase
      .from("gym_admins")
      .select("gym_id, gyms(name)")
      .eq("user_id", user.id)
      .single();
    gymName = (admin?.gyms as { name: string } | null)?.name ?? undefined;
  }

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar gymName={gymName} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
