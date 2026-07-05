// 英文（翰林七上 Unit 1 範圍）：be 動詞・am / is / are
// 混合選擇與填空：選擇題考「為什麼選這個」，填空題逼他自己拼出來。

import type { QuizSet } from "./types";

export const quizEnglishBe1: QuizSet = {
  id: "quiz-english-be-1",
  subjectId: "english",
  topicId: "english-7a-1",
  title: "be 動詞・am / is / are",
  description:
    "8 題搞定 be 動詞：主詞是誰，決定用 am、is 還是 are——含填空題，要自己打出來。",
  order: 1,
  questions: [
    {
      id: "q1",
      type: "choice",
      question: "I ___ a junior high school student.",
      choices: ["am", "is", "are", "be"],
      answerIndex: 0,
      explanation:
        "主詞是 I（我），be 動詞永遠配 am。\n口訣沒用的地方在這：你要知道「be 動詞跟著主詞變」這個規則本身，I→am、you→are、他/她/它一個人→is、兩個以上→are。",
      concept: "be 動詞由主詞決定：I → am",
    },
    {
      id: "q2",
      type: "choice",
      question: "My brother and I ___ in the same school.",
      choices: ["am", "is", "are", "be"],
      answerIndex: 2,
      explanation:
        "主詞是 My brother and I（哥哥和我）＝兩個人＝複數 → are。\n陷阱：看到句尾的 I 就選 am。be 動詞看的是「整個主詞」，不是離空格最近的那個字。",
      concept: "複合主詞（A and B）是複數 → are",
    },
    {
      id: "q3",
      type: "choice",
      question: "___ your father a doctor?",
      choices: ["Am", "Is", "Are", "Do"],
      answerIndex: 1,
      explanation:
        "問句把 be 動詞搬到句首，但「跟著主詞變」的規則不變：主詞是 your father（一個人）→ Is。\n選 Do 的人是把一般動詞問句的規則背過來套——這句沒有一般動詞，不需要 Do。",
      concept: "be 動詞問句＝主詞和 be 對調；主詞單數 → Is",
    },
    {
      id: "q4",
      type: "choice",
      question: "The students ___ not in the classroom now.",
      choices: ["am", "is", "are", "be"],
      answerIndex: 2,
      explanation:
        "主詞 The students 是複數 → are。否定句只是在 be 動詞後面加 not，be 的選法完全一樣。\nare not 可以縮寫成 aren't。",
      concept: "否定句不改變 be 的選法：複數主詞 → are not",
    },
    {
      id: "q5",
      type: "text",
      question: "填入正確的 be 動詞：\nMy dog ___ three years old.",
      answerText: ["is"],
      explanation:
        "My dog 是一隻（單數、第三人稱）→ is。\n動物、東西也一樣：單數就是 is，不是只有「人」才適用。",
      concept: "第三人稱單數（動物/物品也算）→ is",
    },
    {
      id: "q6",
      type: "text",
      question: "填入正確的 be 動詞：\nYou and Tom ___ good friends.",
      answerText: ["are"],
      explanation:
        "You and Tom 是兩個人 → are。\n就算把 You and Tom 換成 We 或 They，答案也一樣是 are——會換句話想，代表你抓到規則了。",
      concept: "複合主詞可換成代名詞驗證（You and Tom = you/they → are）",
    },
    {
      id: "q7",
      type: "choice",
      question: "下列哪一句是「正確」的？",
      choices: [
        "He are my classmate.",
        "They is my classmates.",
        "It is my book.",
        "I is happy.",
      ],
      answerIndex: 2,
      explanation:
        "It（單數）→ is，正確。\n其他三句都是主詞和 be 不搭：He → is、They → are、I → am。改錯題是最好的檢驗——你必須真的知道規則，才能看出哪裡怪。",
      concept: "主詞與 be 動詞的一致性（改錯驗收）",
    },
    {
      id: "q8",
      type: "text",
      question:
        "把這句改成問句（整句打出來）：\nShe is your sister. → ___ she your sister?",
      answerText: ["is"],
      explanation:
        "be 動詞問句＝把 be 搬到句首：Is she your sister?\n不用加 Do，也不用改其他字——be 動詞自己就能當問句的開頭。",
      concept: "be 動詞問句的造法：be 移到句首",
    },
  ],
};
