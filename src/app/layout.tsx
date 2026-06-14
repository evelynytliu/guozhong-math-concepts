import type { Metadata } from "next";
import "./globals.css";
import { PasscodeGate } from "@/components/passcode-gate";

export const metadata: Metadata = {
  title: "國中數學・概念理解",
  description:
    "不是給更多題目，而是讓你看到概念怎麼來、用自己的話講清楚、再用變形題驗證你是真懂。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen antialiased">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 sm:px-6">
          <PasscodeGate>{children}</PasscodeGate>
        </div>
      </body>
    </html>
  );
}
