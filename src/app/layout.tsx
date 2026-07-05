import type { Metadata } from "next";
import "./globals.css";
import { PasscodeGate } from "@/components/passcode-gate";
import { VoiceProvider } from "@/components/voice/voice-provider";
import { VoicePanel } from "@/components/voice/voice-panel";

export const metadata: Metadata = {
  title: "國一學習基地｜五科概念與線上題目",
  description:
    "國文・數學・英文・自然・社會，用生動方式把概念弄懂，再做線上題目驗收。重點都一樣：用自己的話想出來，不是照背、照抄。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen antialiased">
        <VoiceProvider>
          <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 sm:px-6">
            <PasscodeGate>{children}</PasscodeGate>
          </div>
          <VoicePanel />
        </VoiceProvider>
      </body>
    </html>
  );
}
