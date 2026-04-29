import { createAdminClient } from "../../../../lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { applicationId, reason } = await request.json();
    const admin = createAdminClient();

    const { error } = await admin
      .from("gym_applications")
      .update({
        status:           "rejected",
        rejection_reason: reason || null,
        reviewed_at:      new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
