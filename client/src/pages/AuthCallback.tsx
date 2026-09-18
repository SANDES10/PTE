import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function completeAuth() {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session?.access_token) {
        if (!cancelled) {
          setError(sessionError?.message ?? "No session found. Please sign in again.");
        }
        return;
      }

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ access_token: data.session.access_token }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (!cancelled) {
          setError((body as { error?: string }).error ?? "Failed to start app session");
        }
        return;
      }

      if (!cancelled) {
        setLocation("/dashboard");
      }
    }

    completeAuth();
    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-600 mb-4">{error}</p>
            <a href="/login" className="text-teal-600 font-medium">
              Try again
            </a>
          </>
        ) : (
          <p className="text-slate-600">Signing you in…</p>
        )}
      </div>
    </div>
  );
}
