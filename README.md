# 國中數學・概念理解互動教材

為一位升國一的孩子做的數學**概念理解**網站。重點不是給更多題目，而是用同一套
**五段式流程**破解「背公式、看題型反射解題」的習慣。設計理念見 [`CLAUDE.md`](CLAUDE.md)。

## 怎麼跑（本機自用）

```bash
npm install
npm run dev
```

打開 http://localhost:3000 即可。**不要部署到雲端**——AI 環節用本機 `claude login`
的訂閱認證，部署上雲就沒辦法用訂閱認證了。

## 五段式流程（每個單元都一樣）

1. **情境引入**：先讓孩子感覺「現有工具不夠用」，概念是被需要而生的。
2. **引導推導**：用一連串可互動的小步驟（數線可點、可走），讓他**自己把規則推出來**，不直接給公式。
3. **用自己的話解釋**：逼他講出「為什麼」。背公式的孩子最怕這關。
4. **變形題驗證**：同一概念換外觀。第 1 題像教材、第 2/3 題換情境——**抓「會題型但概念沒遷移」**。
5. **回扣**：闔上螢幕，用嘴巴跟家人講一次。

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
    page.tsx              首頁（單元清單 + 進度）
    unit/[id]/page.tsx    單元頁（五段式流程）
    api/explain/route.ts  AI 解釋判斷（Agent SDK，含失敗退回）
  components/
    unit-flow.tsx         五段式流程的殼（進度、導覽、儲存）
    progress-stepper.tsx  五段進度指示
    number-line.tsx       互動數線（點 / 走路）SVG
    sections/             第 1–5 段各自的元件
    ui/                   按鈕、卡片等基礎元件
  content/
    types.ts              通用 Unit 型別
    unit-01/02/03.ts      三個單元的內容
    index.ts              單元註冊表
  lib/
    storage.ts            進度/解釋儲存（localStorage ⇄ Supabase）
    explanation.ts        AI 回饋型別 + 前端呼叫 helper
    supabase.ts           懶載入 Supabase client
```
