import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '2026 나병원 심포지엄 워크숍 등록',
  description: '2026-06-26 나병원 심포지엄 워크숍 등록',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
