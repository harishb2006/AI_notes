import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartNotes",
  description: "AI summaries for your notes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
