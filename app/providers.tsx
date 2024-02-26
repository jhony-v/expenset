"use client";

import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 0,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    },
  },
});

export function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale?: string;
  messages?: any;
}) {
  return (
    <QueryClientProvider client={client}>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <NextUIProvider>{children}</NextUIProvider>
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}
