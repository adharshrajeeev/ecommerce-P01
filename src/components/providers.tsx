"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";
import { useAuthProvider } from "@/hooks/use-auth";
import { CartSheet } from "@/components/layout/cart-sheet";

function AuthInitializer() {
  useAuthProvider();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 3 * 60 * 1000,   // 3 min — prevents refetch on every tab switch
            gcTime: 10 * 60 * 1000,     // keep cache 10 min
            retry: 1,
            refetchOnWindowFocus: false, // kills the lag when switching browser tabs
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
      <CartSheet />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "rgba(20, 20, 20, 0.82)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />
    </QueryClientProvider>
  );
}
