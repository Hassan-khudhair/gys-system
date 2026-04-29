import { createAdminClient } from "../../../../lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { applicationId } = await request.json();
    const admin = createAdminClient();

    // Fetch application
    const { data: app, error: fetchError } = await admin
      .from("gym_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (fetchError || !app) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // Create the gym
    const { data: gym, error: gymError } = await admin
      .from("gyms")
      .insert({
        name:    app.gym_name,
        city:    app.city,
        address: app.address,
        phone:   app.phone,
        email:   app.gym_email,
        status:  "active",
      })
      .select()
      .single();

    if (gymError) {
      return NextResponse.json({ error: gymError.message }, { status: 400 });
    }

    // Create gym_admin record
    const { error: adminError } = await admin.from("gym_admins").insert({
      gym_id:  gym.id,
      user_id: app.user_id,
      name:    app.admin_name,
      email:   app.admin_email,
    });

    if (adminError) {
      return NextResponse.json({ error: adminError.message }, { status: 400 });
    }

    // Update user metadata: role = gym_admin, gym_id = gym.id
    if (app.user_id) {
      await admin.auth.admin.updateUserById(app.user_id, {
        user_metadata: { role: "gym_admin", gym_id: gym.id },
      });
    }

    // Mark application as approved
    await admin
      .from("gym_applications")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", applicationId);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
