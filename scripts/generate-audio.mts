// scripts/generate-audio.mts
// 用 Microsoft Edge 神經網路語音（edge-tts）把每個單元、每一段的老師旁白
// 生成成 mp3，輸出到 public/audio/<unitId>/<key>.mp3，並更新 manifest.json。
//
// 念的文字來源跟「系統版」瀏覽器語音完全一樣（都走 lib/narration 的 getNarrationText），
// 所以兩種語音內容一致。
//
// 執行方式：
//   npm run audio
// 需求：本機要有 Python 並安裝 edge-tts → `pip install edge-tts`
// 換音色：設定環境變數 TTS_VOICE（預設 zh-TW-HsiaoChenNeural，台灣女聲、親切）
//   其他台灣語音：zh-TW-YunJheNeural（男聲）、zh-TW-HsiaoYuNeural（女聲）
//
// 備註：音檔已經先生成並 commit，平常不用跑這支；只有改了旁白稿才需要重生。

import { units } from "../src/content/index";
import { getNarrationText, NARRATION_KEYS } from "../src/lib/narration";
import {
  mkdirSync,
  writeFileSync,
  rmSync,
  existsSync,
  statSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "audio");
const VOICE = process.env.TTS_VOICE || "zh-TW-HsiaoChenNeural";

// 找出可用的 edge-tts 呼叫方式（回傳基底指令陣列）
function detectEdgeTts(): string[] | null {
  const candidates: Array<[string, string[]]> = [
    ["python", ["-m", "edge_tts", "--version"]],
    ["py", ["-m", "edge_tts", "--version"]],
    ["python3", ["-m", "edge_tts", "--version"]],
    ["edge-tts", ["--version"]],
  ];
  for (const [cmd, args] of candidates) {
    try {
      const r = spawnSync(cmd, args, { encoding: "utf8" });
      if (r.status === 0) {
        return cmd === "edge-tts" ? ["edge-tts"] : [cmd, "-m", "edge_tts"];
      }
    } catch {
      /* 換下一個候選 */
    }
  }
  return null;
}

const base = detectEdgeTts();
if (!base) {
  console.error(
    "✗ 找不到 edge-tts。請先安裝：pip install edge-tts（需要 Python）。",
  );
  process.exit(1);
}
console.log(`使用語音：${VOICE}（指令：${base.join(" ")}）\n`);

mkdirSync(OUT, { recursive: true });
const tmp = join(OUT, "_tmp_narration.txt");
const manifest: Record<string, string[]> = {};
let ok = 0;
let fail = 0;

for (const unit of units) {
  const dir = join(OUT, unit.id);
  mkdirSync(dir, { recursive: true });
  const done: string[] = [];

  for (const key of NARRATION_KEYS) {
    const text = getNarrationText(unit, key);
    if (!text) continue;

    // 透過暫存檔傳文字（避免中文標點在命令列被吃掉 / 長度限制）
    writeFileSync(tmp, text, "utf8");
    const outFile = join(dir, `${key}.mp3`);
    const args = [
      ...base.slice(1),
      "--voice",
      VOICE,
      "--file",
      tmp,
      "--write-media",
      outFile,
    ];
    const r = spawnSync(base[0], args, { encoding: "utf8" });

    if (r.status === 0 && existsSync(outFile) && statSync(outFile).size > 0) {
      done.push(key);
      ok++;
      console.log(`  ✓ ${unit.id}/${key}.mp3`);
    } else {
      fail++;
      console.error(
        `  ✗ ${unit.id}/${key} 失敗：${(r.stderr || r.error || "未知錯誤").toString().trim()}`,
      );
    }
  }

  if (done.length) manifest[unit.id] = done;
}

rmSync(tmp, { force: true });
writeFileSync(
  join(OUT, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8",
);

console.log(`\n完成：成功 ${ok} 段、失敗 ${fail} 段。manifest.json 已更新。`);
if (fail > 0) process.exitCode = 1;
