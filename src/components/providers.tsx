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
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
