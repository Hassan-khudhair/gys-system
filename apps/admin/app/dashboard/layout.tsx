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
    // Handle the case where gyms might be returned as an array or a single object
    const gymsData = admin?.gyms;
    if (Array.isArray(gymsData)) {
      gymName = gymsData[0]?.name;
    } else if (gymsData) {
      gymName = (gymsData as { name: string }).name;
    }
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
