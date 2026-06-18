import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "중고 거래 플랫폼",
  description: "구매자와 판매자를 위한 중고 거래 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
