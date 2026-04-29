import { supabase } from "@/lib/supabase";

export async function sendNotification({
  userId, type, title, body, link,
}: {
  userId: string;
  type: "upvote" | "comment" | "reply" | "announcement";
  title: string;
  body?: string;
  link?: string;
}) {
  // Don't notify yourself
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === userId) return;

  await supabase.from("notifications").insert({ user_id: userId, type, title, body, link });
}
