import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image to Prompt — Innowebic",
  description: "Turn any image into a detailed AI generation prompt using Claude.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
