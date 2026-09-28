"use client";

import styles from "./server-error.module.css";

export function ServerError({ retry }: { retry: () => void }) {
  return <section className={styles.error} aria-labelledby="server-error-title">
    <p className={styles.code}>500 · 서버 오류</p>
    <svg className={styles.art} viewBox="0 0 240 180" fill="none" aria-hidden="true" focusable="false">
      <ellipse cx="120" cy="158" rx="76" ry="10" fill="var(--error-soft)" />
      <circle cx="120" cy="83" r="70" fill="var(--error-soft)" />
      <g className={styles.server} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="67" y="38" width="106" height="100" rx="14" fill="var(--error-surface)" />
        <path d="M68 86h104M85 57h31M85 68h20M85 106h31M85 117h20" />
        <circle cx="150" cy="63" r="4" fill="currentColor" stroke="none" />
        <circle className={styles.light} cx="150" cy="111" r="4" fill="currentColor" stroke="none" />
      </g>
      <g className={styles.tool} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M175 111a15 15 0 0 0 18-19l-9 9-8-8 9-9a15 15 0 0 0-19 18l-24 24a7 7 0 0 0 10 10z" fill="var(--error-surface)" />
      </g>
    </svg>
    <h1 id="server-error-title">잠시 쉬어가는 중이에요</h1>
    <p className={styles.description}>요청을 처리하는 중 문제가 발생했습니다.<br />잠시 후 다시 시도해 주세요.</p>
    <div className={styles.actions}>
      <button className={styles.primary} onClick={retry}>다시 시도</button>
      {/* A full navigation also recovers when the app shell has failed. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/">대시보드로 이동</a>
    </div>
  </section>;
}
