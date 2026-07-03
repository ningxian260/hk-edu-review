import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "香港教育評價平台",
    template: "%s | 香港教育評價平台",
  },
  description: "以真實身份和已驗證評論協助香港家長選擇學校、教育中心和學習課程。",
  openGraph: {
    title: "香港教育評價平台",
    description: "真實身份、可信評論、清晰比較香港教育機構。",
    type: "website",
    locale: "zh_HK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant-HK" className="h-full antialiased">
      <body className="min-h-full">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
