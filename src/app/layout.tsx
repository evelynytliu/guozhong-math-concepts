import type { Metadata } from "next";
import "./globals.css";
import { PasscodeGate } from "@/components/passcode-gate";

export const metadata: Metadata = {
  title: "升國中・暑假學習基地",
  description:
    "暑假作業引導打草稿（再親手抄到作業本）+ 國中數學概念理解。重點都一樣：用自己的話想出來，不是照背、照抄。",
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
