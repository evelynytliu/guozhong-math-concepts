# 升國中・暑假學習基地

為一位升國一的孩子做的學習網站，兩大功能：

1. **暑假作業引導** — 帶他把各科暑假作業一步步想清楚、打成草稿，再**親手抄到作業本上**。
2. **國中數學・概念理解** — 用同一套**五段式流程**破解「背公式、看題型反射解題」的習慣。

兩者重點一樣：**用自己的話想出來，不是照背、照抄**。設計理念見 [`CLAUDE.md`](CLAUDE.md)。

## 怎麼跑（本機自用）

```bash
npm install
npm run dev
```

打開 http://localhost:3000 即可。本機版本是**完整版**：單元 1–3、單元二的 AI 判斷
（需先 `claude login`）、Supabase 雲端存進度，全部都在。

## 兩個版本：本機完整版 vs 公開靜態版

| | 五段式流程 / 單元 1、3 | 單元 2 的 AI 追問 | 進度儲存 | 進入需要密碼 |
|---|---|---|---|---|
| **本機 `npm run dev`** | ✅ | ✅（用 `claude login` 訂閱） | ✅ Supabase 雲端 | ❌（自己電腦免密碼） |
| **公開版（GitHub Pages）** | ✅ | ❌ 自動退回靜態參考解釋 | ✅ Supabase 雲端（**與本機共通**） | ✅ 要輸入密碼 |

進度與孩子寫的解釋兩邊**共用同一個 Supabase**，所以不管在哪台裝置、哪個版本，進度都接得起來。
AI 判斷靠本機 `claude login` 的訂閱認證跑，**只能在自己電腦上用**，雲端靜態網站登不進訂閱，所以公開版的 AI 會自動退回靜態模式（孩子不會卡住）。

因為公開版會把 Supabase 金鑰打進網頁，所以加了一道**密碼門**（`NEXT_PUBLIC_APP_PASSCODE`，設在 GitHub Secrets）擋住路過的陌生人；資料庫也已收緊權限（只允許讀取/新增/更新，**禁止刪除**）。這是靜態站的輕量保護，不是正式登入系統。

### 公開網址（GitHub Pages）

- 網址：`https://evelynytliu.github.io/guozhong-math-concepts/`
- 部署方式：push 到 `main` 就會由 [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) 自動建置（`BUILD_TARGET=pages`，產出靜態 `out/`）並發佈。
- 本機要預覽靜態版：`BUILD_TARGET=pages npm run build`，產物在 `out/`。

## 暑假作業引導（5 科）

依 2026 竹光國中新生暑假作業（[`參考文件/竹光2026暑假作業.pdf`](參考文件)）做成引導工具。
**核心原則：這裡只是「打草稿、想清楚」的地方，草稿好了一定要親手抄到作業本上才算交作業**，
全程都有提醒。作業內容放在 `src/content/homework/`，分兩種型態：

| 科目 | 作業 | 型態 | 怎麼引導 |
|------|------|------|----------|
| 英文 | 單字表（約 300 字） | **拼字 drill** | 看中文拼英文，答錯的字自動回鍋，**整組每個字都拼對才過關**（容錯大小寫/空白/標點） |
| 國文 | 閱讀大挑戰・讀書報告 | 草稿 builder | 7 題逐題引導 |
| 數學 | 生活中的數學概念 | 草稿 builder | 刻意不抄範例，給不同生活物件讓他自己觀察 |
| 生物 | 脊椎動物五大類 | 草稿 builder | 給「該查哪些面向」+ 代表生物選項，內容自己查 |
| 社會 | 我的成長小書（六階段） | 草稿 builder | 不同回憶角度 + 鼓勵問家人 |

- **草稿 builder**：每一題給一組「不同角度的提示（sparks）」，點一下幫他開頭、填空，他再用自己的話接下去 → 草稿慢慢成形 → 組稿預覽 →「我已抄到作業本上」才算完成。
- **AI 追問（混合模式）**：每個草稿欄位有一顆「給我幾個不同方向」按鈕，送 `/api/coach`，依他寫的內容給幾個方向 + 一個追問（**不直接幫他寫答案**）。AI 連不上一律自動退回靜態提示，孩子不會卡住（跟單元二的 AI 同一套作法）。

## 五段式流程（每個數學單元都一樣）

1. **情境引入**：先讓孩子感覺「現有工具不夠用」，概念是被需要而生的。
2. **引導推導**：用一連串可互動的小步驟（數線可點、可走），讓他**自己把規則推出來**，不直接給公式。
3. **用自己的話解釋**：逼他講出「為什麼」。背公式的孩子最怕這關。
4. **變形題驗證**：同一概念換外觀。第 1 題像教材、第 2/3 題換情境——**抓「會題型但概念沒遷移」**。
5. **回扣**：闔上螢幕，用嘴巴跟家人講一次。

## 🎙️ 老師語音（朗讀旁白）

每一段標題旁都有一顆「🔊 聽老師講」按鈕，會用台灣腔老師的聲音把那一段念出來；
右下角還有一個浮動的「語音老師」面板，可以切換音色、調語速、試聽。設計同 `emmett-review`：

- **自然版（預設）**：用 [edge-tts](https://github.com/rany2/edge-tts) 神經網路語音預先生成的 mp3
  （`zh-TW-HsiaoChenNeural`，台灣女聲），最自然。音檔放在 `public/audio/<單元>/<段落>.mp3`，**已生成並一起 commit，開箱即用**。
- **系統版（備援）**：瀏覽器內建語音（Web Speech API），零成本、離線也能用。
  自然版音檔載入失敗時會**自動退回**系統版，孩子不會卡住。

念的文字稿在 [`src/content/narration.ts`](src/content/narration.ts)（六單元 × 五段，手寫成「給耳朵聽」的口語），
公開版（GitHub Pages）的音檔路徑會自動帶上 repo 前綴。

### 改了旁白稿要重新生成音檔

```bash
pip install edge-tts      # 需要 Python（只有重生才需要）
npm run audio             # 重新生成 public/audio 下所有 mp3 + manifest.json
```

換音色：設環境變數 `TTS_VOICE`（如 `zh-TW-YunJheNeural` 男聲）再跑 `npm run audio`。

## 三個單元

| 單元 | 概念 | 檢查模式 | 針對的「背公式」死角 |
|------|------|----------|----------------------|
| 1 | 負數與數線 | 靜態 | 「負負得正」「絕對值＝去掉負號」 |
| 2 | 一元一次方程式應用題 | **AI** | 背題型（年齡題、雞兔同籠…），情境一變就錯 |
| 3 | 因數倍數 / GCD / LCM | 靜態 | 背短除法，不知道何時用 GCD、何時用 LCM |

## 檢查機制：靜態 vs AI

- **靜態模式**（單元 1、3）：孩子寫完解釋 → 展開預寫好的參考解釋自我對照 → 三選一自評。零成本、離線可用。
- **AI 模式**（單元 2，最關鍵）：解釋送 `/api/explain`，用 Agent SDK（關閉工具、單回合）判斷
  「理解型 / 複述型」、給一個追問、一句鼓勵。
  **AI 連不上一律自動退回靜態模式**，孩子不會卡住。
  - 要讓 AI 真的回應，先在這台電腦執行 `claude login`（或在 `.env.local` 填 `ANTHROPIC_API_KEY`）。

## 儲存

- **預設 localStorage**：進度與解釋存在這台電腦的瀏覽器，零設定、馬上能用。
- **要改用 Supabase**（選用）：把 [`supabase/schema.sql`](supabase/schema.sql) 貼到 Supabase SQL Editor 執行，
  再把網址與 anon key 填進 `.env.local`（複製 `.env.local.example`）。程式會自動改用 Supabase。

## 加新單元

1. 在 `src/content/` 仿照 `unit-01.ts` 寫一個新檔（符合 `types.ts` 的 `Unit` 型別）。
2. 在 `src/content/index.ts` import 進來、放進 `units` 陣列。
3. UI 會自動跑同一套五段式流程，不用改畫面。

> 設計新單元時，永遠先問：**「這個單元最容易被背的點是什麼？」** 再針對那個點設計引導推導與變形題。

## 專案結構

```
src/
  app/
    page.tsx                 首頁（暑假作業區 + 數學單元 + 進度）
    unit/[id]/page.tsx       數學單元頁（五段式流程）
    homework/[id]/page.tsx   暑假作業頁（草稿 builder / 單字 drill）
    api/explain/route.ts     數學 AI 解釋判斷（Agent SDK，含失敗退回）
    api/coach/route.ts       暑假作業 AI 追問（Agent SDK，含失敗退回）
  components/
    unit-flow.tsx            五段式流程的殼（進度、導覽、儲存）
    progress-stepper.tsx     五段進度指示
    number-line.tsx          互動數線（點 / 走路）SVG
    sections/                第 1–5 段各自的元件
    voice/                   老師語音：provider（播放控制）+ button（各段喇叭）+ panel（浮動設定）
    homework/                暑假作業 UI（draft-flow / vocab-drill / spark-chips / 殼）
    ui/                      按鈕、卡片等基礎元件
  content/
    types.ts                 通用 Unit 型別
    unit-01…06.ts            數學單元內容
    narration.ts             老師語音旁白稿（六單元 × 五段）
    index.ts                 數學單元註冊表
    homework/                暑假作業內容（types、5 科資料、單字清單與批改）
  lib/
    storage.ts               數學進度/解釋儲存（localStorage ⇄ Supabase）
    homework-storage.ts      暑假作業草稿/單字進度儲存（localStorage ⇄ Supabase）
    explanation.ts / coach.ts AI 回饋型別 + 前端呼叫 helper
    narration.ts             旁白文字清理 + 取用（系統版與 mp3 共用同一份文字）
    supabase.ts              懶載入 Supabase client
scripts/
  generate-audio.mts         用 edge-tts 生成老師語音 mp3（npm run audio）
public/audio/                生成好的 mp3 + manifest.json（哪些段落有自然版）
```
