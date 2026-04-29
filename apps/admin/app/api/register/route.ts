import { createAdminClient } from "../../../lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Register API request body:", body);
    const { gymName, city, address, phone, gymEmail, adminName, adminEmail, password } = body;

    if (!gymName || !adminName || !adminEmail || !password) {
      console.log("Missing fields:", { gymName, adminName, adminEmail, hasPassword: !!password });
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Create Supabase auth user
    const { data: userData, error: userError } = await admin.auth.admin.createUser({
      email: adminEmail,
      password,
      email_confirm: true,
      user_metadata: { role: "pending_gym_admin" },
    });

    if (userError) {
      console.error("Supabase user creation error:", userError);
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    // Insert the gym application
    const { error: appError } = await admin.from("gym_applications").insert({
      gym_name:   gymName,
      city:       city       || null,
      address:    address    || null,
      phone:      phone      || null,
      gym_email:  gymEmail   || null,
      admin_name: adminName,
      admin_email: adminEmail,
      user_id:    userData.user.id,
      status:     "pending",
    });

    if (appError) {
      console.error("Supabase gym_applications insert error:", appError);
      // Roll back user creation
      await admin.auth.admin.deleteUser(userData.user.id);
      return NextResponse.json({ error: appError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Server error in register API:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
