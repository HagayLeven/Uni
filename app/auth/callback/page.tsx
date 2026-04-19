"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  useEffect(() => {
    let redirected = false;

    const redirect = (path: string) => {
      if (redirected) return;
      redirected = true;
      subscription.unsubscribe();
      window.location.replace(path);
    };

    // Listen for auth state — fires when Supabase auto-processes the code
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        redirect("/dashboard");
      } else if (event === "SIGNED_OUT") {
        redirect("/auth/login");
      }
    });

    // Also handle the case where session is already there or code needs manual exchange
    const handleCallback = async () => {
      // Small delay so Supabase client can auto-process detectSessionInUrl
      await new Promise((r) => setTimeout(r, 200));

      const { data: { session } } = await supabase.auth.getSession();
      if (session) { redirect("/dashboard"); return; }

      // If Supabase didn't auto-handle it, try manual exchange
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");

      if (error) { redirect("/auth/login"); return; }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("Exchange error:", exchangeError);
          redirect("/auth/login");
          return;
        }
        // onAuthStateChange will fire SIGNED_IN and redirect
        // but add a fallback
        await new Promise((r) => setTimeout(r, 1500));
        const { data: { session: s2 } } = await supabase.auth.getSession();
        redirect(s2 ? "/dashboard" : "/auth/login");
        return;
      }

      // No code and no session — bail out after a grace period
      await new Promise((r) => setTimeout(r, 2000));
      const { data: { session: s3 } } = await supabase.auth.getSession();
      redirect(s3 ? "/dashboard" : "/auth/login");
    };

    handleCallback();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">מתחבר...</p>
      </div>
    </div>
  );
}
