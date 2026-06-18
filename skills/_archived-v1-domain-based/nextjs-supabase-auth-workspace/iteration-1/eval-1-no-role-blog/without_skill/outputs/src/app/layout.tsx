import type { ReactNode } from "react";

export const metadata = {
  title: "My Blog",
  description: "A simple personal blog",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
