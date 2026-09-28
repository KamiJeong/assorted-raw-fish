"use client";

import { ServerError } from "@/components/server-error";
import styles from "@/components/server-error.module.css";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="ko"><head><title>서버 오류 · 모아</title></head><body className={styles.document}>
    <main><ServerError retry={retry} /></main>
  </body></html>;
}
