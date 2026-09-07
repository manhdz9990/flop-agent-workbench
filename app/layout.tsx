import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Technocore Protocol Inspector",
  description: "See exactly what Technocore evidence proves — and what it does not.",
  icons: { icon: "/brand/flop-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
