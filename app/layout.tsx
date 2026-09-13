import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Shuttle Feud",
  description: "Tech Shuttle's Family-Feud-style live event system"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}