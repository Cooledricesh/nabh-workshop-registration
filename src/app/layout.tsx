import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '2026 낮병원 심포지엄',
  description: '2026-06-26 낮병원 심포지엄 일정과 워크숍 등록',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
