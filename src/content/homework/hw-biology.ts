// src/content/homework/hw-biology.ts
// 生物科：物種・脊椎動物五大類（暑假作業 1 面）
//
// 作業要求：脊椎動物分五大類（魚類、兩生類、爬蟲類、鳥類、哺乳類），
// 查書或網路，寫出每一類的「基本特徵」和「代表生物」。
// 作業本範例：青蛙是兩生類，小時候蝌蚪在水中用鰓，長大用肺在陸地，代表生物台北樹蛙。
//
// 這是「查資料」型作業。提示不直接給答案，而是給『要從哪幾個面向觀察』
// （呼吸、體表、體溫、繁殖、棲地）+ 幾個代表生物讓他挑，
// 真正的特徵要他自己查、自己用一句話講清楚。

import type { DraftHomework, DraftField } from "./types";

// 五大類共用的「特徵」思考面向（openers，點一下幫他開頭）
function traitSparks(): string[] {
  return [
    "牠們用＿＿呼吸（鰓／肺／皮膚）",
    "身體表面是＿＿（鱗片／溼黏的皮膚／羽毛／毛）",
    "牠們是＿＿生的（卵生／胎生）",
    "體溫會隨環境變嗎？牠們是＿＿（變溫／恆溫）",
    "主要住在＿＿（水裡／水陸兩邊／陸地／天空）",
  ];
}

function classFields(
  key: string,
  className: string,
  candidateAnimals: string[],
): DraftField[] {
  return [
    {
      id: `${key}-trait`,
      label: `${className}・基本特徵`,
      guide: `查一下，用一兩句話講清楚「${className}」最關鍵的特徵。可以從呼吸、體表、體溫、怎麼繁殖、住哪裡這幾個面向挑著說。`,
      type: "long",
      placeholder: `${className}的特徵是…（用你自己的話，一兩句）`,
      minChars: 15,
      sparks: traitSparks(),
      aiContext: `孩子要寫脊椎動物「${className}」的基本特徵。判斷他是否查到並用自己的話說清楚關鍵特徵（呼吸方式、體表、變溫/恆溫、卵生/胎生、棲地），而不是只抄一句。`,
    },
    {
      id: `${key}-rep`,
      label: `${className}・代表生物`,
      guide: "挑一個這一類的代表動物。下面有幾個可以選，你也可以寫自己想到的。",
      type: "short",
      placeholder: "寫一個代表動物…",
      sparks: candidateAnimals.map((a) => `代表生物：${a}`),
      aiContext: `孩子要舉一個「${className}」的代表動物。`,
    },
  ];
}

export const biologyHomework: DraftHomework = {
  id: "hw-biology-vertebrates",
  subject: "生物",
  subjectEmoji: "🐸",
  title: "脊椎動物五大類",
  order: 4,
  kind: "draft",
  aiCoach: true,
  pdfNote: "暑假作業・生物科 物種（1 面）",
  intro: [
    "脊椎動物（有脊椎骨的動物）分成五大類：魚類、兩生類、爬蟲類、鳥類、哺乳類。",
    "這份作業要你查書或網路，寫出每一類的『基本特徵』和一個『代表生物』。",
    "作業本上有個範例給你看深度：「青蛙是兩生類，小時候是蝌蚪、在水中用鰓呼吸，長大到陸地用肺呼吸；代表生物有台北樹蛙。」——你要寫到差不多這麼清楚。",
    "提示只會告訴你『要觀察哪幾個面向』，真正的答案要你自己查、用自己的話寫。",
  ],
  paperNote:
    "作業本上是一個表格，左邊「特色／特徵」、右邊「代表生物」，共五列。先在這裡每一類都查好、寫順，再抄到表格裡。",
  assembleHeading: "脊椎動物五大類・草稿",
  fields: [
    ...classFields("fish", "魚類", ["鯉魚", "鯊魚", "金魚", "吳郭魚"]),
    ...classFields("amphibian", "兩生類", ["蟾蜍", "山椒魚", "蠑螈", "盤古蟾蜍"]),
    ...classFields("reptile", "爬蟲類", ["蛇", "烏龜", "蜥蜴", "壁虎", "鱷魚"]),
    ...classFields("bird", "鳥類", ["麻雀", "老鷹", "企鵝", "貓頭鷹", "鴿子"]),
    ...classFields("mammal", "哺乳類", ["狗", "鯨魚", "蝙蝠", "大象", "人類"]),
  ],
};
