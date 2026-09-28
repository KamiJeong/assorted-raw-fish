"use client";

import { ServerError } from "@/components/server-error";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ServerError retry={retry} />;
}
