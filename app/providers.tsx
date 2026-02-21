"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

type ProvidersProps = {
  children: ReactNode;
};

function queryRetryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** (attemptIndex - 1), 30000);
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            retry: 3,
            retryDelay: queryRetryDelay,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
