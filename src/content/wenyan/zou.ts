// src/content/wenyan/zou.ts
// 走：今義「走路」；古義「跑、逃跑」。
// 最容易被背的點：背「走＝跑」這張對照，換一句沒看過的文言文就不敢套。
// 破法——從金文字形看出「走」本來畫的就是「奔跑的人」，古義是有道理的，
// 不是硬記；懂道理就能遷移到任何一句。

import type { ClassicalWord } from "./types";

export const zou: ClassicalWord = {
  id: "zou",
  order: 2,
  word: "走",
  pinyin: "zǒu",
  teaser: "古人說「走」不是散步，是拔腿狂奔——甚至是逃命。",

  hook: {
    modernBubble: "「走」不就是「走路」的意思嗎？還能有什麼別的意思？",
    twist: "哈哈，讓我們看看「走」在古代的意思，你就明白了——",
  },
  modernMeaning: "行走、走路（慢慢移動）。",
  ancientMeaning: "跑；再引申為「逃跑」。",

  glyph: {
    form: "金文的「走」上面是甩動雙臂跑步的人形，下面是一隻腳，合起來就是「人在跑」。",
    insight:
      "字本來畫的就是奔跑的動作，所以「走」的本義是「跑」，不是慢慢走。古代要說「慢慢走」反而用「行」「步」。",
  },
  example: {
    sentence: "於是賓客無不變色離席，奮袖出臂，兩股戰戰，幾欲先走。",
    target: "走",
    source: "〈口技〉．林嗣環",
    translation:
      "（聽到失火的口技）客人們沒有不嚇到變臉、離開座位的，捲起袖子露出手臂，兩腿發抖，幾乎想搶先逃跑。",
    notes: [
      { term: "變色", gloss: "臉色大變（嚇到）。" },
      { term: "奮袖出臂", gloss: "捲起袖子、露出手臂。" },
      { term: "股", gloss: "大腿。" },
      { term: "戰戰", gloss: "發抖、打哆嗦。" },
      { term: "走", gloss: "跑（這裡是逃跑）。" },
    ],
  },
  guessPrompt: "客人嚇得「幾欲先走」，這個「走」是什麼意思？",
  guessChoices: ["慢慢走開", "搶先逃跑", "站著不動"],
  guessAnswer: "搶先逃跑",
  derived:
    "「走」的本義是「跑」，引申為「逃跑」。客人被口技嚇到，「幾欲先走」＝幾乎想搶先逃命。成語「不脛而走」（沒有腿也能跑）、「奔走相告」都還保留這個古義。",

  explainPrompt:
    "用你自己的話說：為什麼古代的「走」是「跑」的意思？（提示：想想這個字最早畫的是什麼樣子。）",
  referenceExplain: [
    "因為「走」這個字最早畫的就是一個甩著雙臂、拔腿奔跑的人。",
    "既然字本身畫的是跑步的動作，本義自然是「跑」，而不是慢慢走。",
    "所以看到古文的「走」，先往「跑、逃」去想；要表達「慢慢走」，古人反而用「行、步」。",
  ],

  variants: [
    {
      id: "zou-v1",
      sentence: "棄甲曳兵而走。",
      target: "走",
      source: "《孟子・梁惠王上》",
      prompt: "打了敗仗的士兵「走」，是什麼意思？",
      choices: ["整隊走回去", "逃跑", "走來走去"],
      answer: "逃跑",
      translation: "（士兵）丟下盔甲、拖著兵器逃跑。",
      testingWhat: "換成打仗的情境，「走」還是「逃跑」。",
      likeTextbook: true,
    },
    {
      id: "zou-v2",
      sentence: "兔走觸株，折頸而死。",
      target: "走",
      source: "〈守株待兔〉．《韓非子》",
      prompt: "兔子「走」觸株，這個「走」是什麼意思？",
      choices: ["散步", "飛奔", "睡覺"],
      answer: "飛奔",
      translation: "一隻兔子飛奔過來撞上樹樁，扭斷脖子死了。",
      testingWhat: "主角換成動物、情境全變，你還認得「走＝跑」嗎？",
      likeTextbook: false,
    },
    {
      id: "zou-v3",
      sentence: "兩兔傍地走，安能辨我是雄雌？",
      target: "走",
      source: "〈木蘭詩〉",
      prompt: "兩隻兔子「傍地走」，這個「走」是什麼意思？",
      choices: ["貼著地面跑", "在地上散步", "趴在地上"],
      answer: "貼著地面跑",
      translation:
        "兩隻兔子貼著地面一起跑的時候，怎麼分得出哪隻是公、哪隻是母呢？",
      testingWhat: "詩句情境也一樣：走＝跑。你抓的是道理，不是課本那一句。",
      likeTextbook: false,
    },
  ],
  variantFeedback: {
    allCorrect:
      "🎉 三句情境都不一樣，你都答對了——代表你懂的是「走本來就是跑」的道理，不是背課本那一句。",
    firstOnlyCorrect:
      "📌 打仗那句（跟課本最像）對了，換成兔子就卡住——這就是「背了題型、概念沒遷移」。回第 2 拍看看那個奔跑的字形，再想一次。",
    someWrong:
      "沒關係，回去看看金文「走」畫的是什麼，把「走＝跑」的道理弄懂，再回來挑戰。",
  },

  recap:
    "闔上網站，用嘴巴跟家人說：古代的「走」為什麼是「跑」？再說一個還保留古義的成語（例如不脛而走）。",
  treasureBox:
    "小古寶箱・古代的「走路家族」：同樣是移動，古人分得很細——快慢、地形都有專字。",
  related: [
    { char: "行", meaning: "走（一般的走）", example: "行百里者半九十" },
    { char: "步", meaning: "慢慢走", example: "望而卻步" },
    { char: "趨", meaning: "快走、小跑", example: "亦步亦趨" },
    { char: "奔", meaning: "快跑", example: "猛浪若奔" },
    { char: "涉", meaning: "在水中走", example: "千里跋涉" },
    { char: "跋", meaning: "在山林草叢中走", example: "跋山涉水" },
  ],
};
