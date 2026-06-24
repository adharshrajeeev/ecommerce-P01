"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { useWishlistStore } from "@/store/wishlist.store";
import type { UserProfile } from "@/types/auth";

async function fetchProfile(supabase: ReturnType<typeof createClient>, userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[auth] profile fetch error:", error.message, error.code);
    return null;
  }
  return data;
}

export function useAuthProvider() {
  const { setUser, setLoading, clearAuth } = useAuthStore();
  const { setProductIds } = useWishlistStore();

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      const profile = await fetchProfile(supabase, session.user.id);
      if (profile) {
        console.log("[auth] loaded profile role:", profile.role);
        setUser(profile);
      }
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[auth] event:", event);

      if (event === "SIGNED_OUT" || !session?.user) {
        clearAuth();
        setProductIds([]);
        setLoading(false);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        const profile = await fetchProfile(supabase, session.user.id);
        if (profile) {
          console.log("[auth] signed-in profile role:", profile.role);
          setUser(profile);
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, clearAuth, setProductIds]);
}
