import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function PATCH(req: NextRequest) {
  try {
    const { userId, updates } = await req.json();

    if (!userId || !updates) {
      return NextResponse.json({ error: "Missing userId or updates" }, { status: 400 });
    }

    // Validate userId is a valid UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      return NextResponse.json({ error: "invalid userId" }, { status: 400 });
    }

    // Whitelist allowed fields
    const ALLOWED_FIELDS = ["role", "faculty", "permissions", "full_name", "medical_role"];
    const sanitizedUpdates: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in updates) sanitizedUpdates[key] = updates[key];
    }
    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Verify caller is root/admin via their JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check caller role fresh from DB (not JWT)
    const { data: caller } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!caller || caller.role !== "root") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent privilege escalation: only root can set role to root/מנהל מערכת
    if ("role" in sanitizedUpdates) {
      const newRole = sanitizedUpdates["role"] as string;
      if ((newRole === "root" || newRole === "מנהל מערכת") && caller.role !== "root") {
        return NextResponse.json({ error: "Forbidden: cannot escalate to root" }, { status: 403 });
      }
    }

    // Perform update with service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(sanitizedUpdates)
      .eq("id", userId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ profile: data });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
