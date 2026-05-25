"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  // Use useState to ensure QueryClient is only initialized once in Client Components
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute stale time
            refetchOnWindowFocus: false, // Turn off refetching on focus for simpler demo
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
