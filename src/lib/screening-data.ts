import type { ScreeningRecommendation, BarrierType, BarrierCategory, MessageFrameType, OccupationType, FamilyStructure } from "./types";

export const SCREENING_GUIDELINES: ScreeningRecommendation[] = [
  {
    id: "colon",
    cancerType: "大腸がん",
    cancerTypeEn: "Colorectal Cancer",
    description: "便潜血検査（2日法）",
    targetGender: "all",
    minAge: 40,
    intervalMonths: 12,
    intervalLabel: "毎年",
    evidence:
      "厚生労働省指針（2023年改訂）で40歳以上全員に推奨。USPSTF・日本消化器がん検診学会も同等の推奨。早期（I期）の5年生存率は約90%。",
    symptoms: ["血便", "残便感", "便が細くなる", "腹痛が続く", "体重減少"],
    plainLanguage:
      "便に血が混じっていないかを調べます。採便キットを使って自宅で採取するだけ。痛みはありません。大腸がんは早く見つければほぼ治ります。",
    citations: [
      {
        org: "厚生労働省",
        title: "がん予防重点健康教育及びがん検診実施のための指針",
        year: "2023",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/gan/index.html",
      },
      {
        org: "USPSTF",
        orgEn: "U.S. Preventive Services Task Force",
        title: "Colorectal Cancer: Screening",
        year: "2021",
        url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening",
        grade: "Grade A（45–75歳）",
      },
      {
        org: "日本消化器がん検診学会",
        title: "大腸がん検診の指針",
        year: "2022",
        url: "https://www.jsgcs.or.jp/files/uploads/guideline2022.pdf",
      },
    ],
  },
  {
    id: "lung",
    cancerType: "肺がん",
    cancerTypeEn: "Lung Cancer",
    description: "胸部X線検査（必要に応じ喀痰細胞診）",
    targetGender: "all",
    minAge: 40,
    intervalMonths: 12,
    intervalLabel: "毎年",
    evidence:
      "厚生労働省指針で40歳以上に推奨。USPSTFは50歳以上・喫煙歴あり（20pack-year以上）にLDCT推奨（Grade B）。肺がんは症状が出てからでは進行していることが多い。",
    symptoms: ["2週間以上続く咳", "血痰", "息切れ", "体重減少", "倦怠感"],
    plainLanguage:
      "胸のレントゲン写真を撮ります。撮影時間は数秒。肺がんは症状が出てから気づくことが多く、定期的な検査が重要です。",
    citations: [
      {
        org: "厚生労働省",
        title: "がん予防重点健康教育及びがん検診実施のための指針",
        year: "2023",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/gan/index.html",
      },
      {
        org: "USPSTF",
        orgEn: "U.S. Preventive Services Task Force",
        title: "Lung Cancer: Screening",
        year: "2021",
        url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening",
        grade: "Grade B（50–80歳・喫煙歴あり）",
      },
      {
        org: "日本肺癌学会",
        title: "肺癌診療ガイドライン",
        year: "2023",
        url: "https://www.haigan.gr.jp/guideline/",
      },
    ],
  },
  {
    id: "gastric",
    cancerType: "胃がん",
    cancerTypeEn: "Gastric Cancer",
    description: "胃内視鏡検査（または胃X線検査）",
    targetGender: "all",
    minAge: 50,
    intervalMonths: 24,
    intervalLabel: "2年に1回",
    evidence:
      "厚生労働省指針では50歳以上に内視鏡推奨（X線なら40歳以上毎年も可）。日本では胃がん罹患率が高く、ピロリ菌除菌後も定期検診が重要。日本消化器がん検診学会が推奨。",
    symptoms: ["みぞおちの不快感", "食欲不振", "体重減少", "黒色便", "吐き気"],
    plainLanguage:
      "胃カメラで胃の内側を直接確認します。ピロリ菌感染者はリスクが高いため特に重要です。早期胃がんは90%以上が治ります。",
    citations: [
      {
        org: "厚生労働省",
        title: "がん予防重点健康教育及びがん検診実施のための指針",
        year: "2023",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/gan/index.html",
      },
      {
        org: "日本消化器がん検診学会",
        title: "胃がん検診の指針（内視鏡検診）",
        year: "2022",
        url: "https://www.jsgcs.or.jp/",
      },
      {
        org: "日本ヘリコバクター学会",
        title: "H. pylori感染の診断と治療のガイドライン",
        year: "2023",
        url: "https://www.jshr.jp/",
      },
    ],
  },
  {
    id: "breast",
    cancerType: "乳がん",
    cancerTypeEn: "Breast Cancer",
    description: "マンモグラフィ検査",
    targetGender: "female_only",
    minAge: 40,
    intervalMonths: 24,
    intervalLabel: "2年に1回",
    evidence:
      "厚生労働省指針で40歳以上女性に推奨（2年に1回）。USPSTF（2024）は40歳以上に2年に1回推奨（Grade B）。日本乳癌学会もマンモグラフィの有効性を確認。女性のがん罹患数1位。",
    symptoms: ["しこり", "乳房の形の変化", "乳頭からの分泌", "皮膚のくぼみ・ひきつれ"],
    plainLanguage:
      "乳房をX線で撮影します。女性のがん罹患数1位が乳がんです。40代は特に発症しやすい年代。2年に1回の検査で早期発見できます。",
    citations: [
      {
        org: "厚生労働省",
        title: "がん予防重点健康教育及びがん検診実施のための指針",
        year: "2023",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/gan/index.html",
      },
      {
        org: "USPSTF",
        orgEn: "U.S. Preventive Services Task Force",
        title: "Breast Cancer: Screening",
        year: "2024",
        url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening",
        grade: "Grade B（40歳以上・2年に1回）",
      },
      {
        org: "日本乳癌学会",
        title: "乳癌診療ガイドライン",
        year: "2022",
        url: "https://jbcs.xsrv.jp/guideline/",
      },
    ],
  },
  {
    id: "cervical",
    cancerType: "子宮頸がん",
    cancerTypeEn: "Cervical Cancer",
    description: "子宮頸部細胞診（HPV検査との併用も選択肢）",
    targetGender: "female_only",
    minAge: 20,
    intervalMonths: 24,
    intervalLabel: "2年に1回",
    evidence:
      "厚生労働省指針で20歳以上女性に2年に1回推奨。USPSTF（2018）は21–65歳に3年に1回の細胞診、または30–65歳に5年に1回のHPV単独法を推奨（Grade A）。HPVワクチン接種者も検診継続が必要。",
    symptoms: ["不正出血", "性交後出血", "おりものの異常", "下腹部の違和感"],
    plainLanguage:
      "子宮の入り口の細胞を採取して調べます。20〜30代に多く発症します。HPVウイルスが原因で、予防できるがんです。",
    citations: [
      {
        org: "厚生労働省",
        title: "がん予防重点健康教育及びがん検診実施のための指針",
        year: "2023",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/gan/index.html",
      },
      {
        org: "USPSTF",
        orgEn: "U.S. Preventive Services Task Force",
        title: "Cervical Cancer: Screening",
        year: "2018",
        url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/cervical-cancer-screening",
        grade: "Grade A（21–65歳）",
      },
      {
        org: "日本産科婦人科学会 / 日本婦人科腫瘍学会",
        title: "子宮頸癌治療ガイドライン",
        year: "2022",
        url: "https://www.jsgo.or.jp/guideline/cervical.html",
      },
    ],
  },
];

export function getRecommendedScreenings(
  age: number,
  gender: "male" | "female"
): ScreeningRecommendation[] {
  return SCREENING_GUIDELINES.filter((s) => {
    if (s.targetGender === "female_only" && gender !== "female") return false;
    if (age < s.minAge) return false;
    if (s.maxAge && age > s.maxAge) return false;
    return true;
  });
}

export const ALL_SCREENING_NAMES: Record<string, string> = Object.fromEntries(
  SCREENING_GUIDELINES.map((s) => [s.id, s.cancerType])
);

// ── 障壁ラベル ──────────────────────────────────────────────────────────────

export const BARRIER_LABELS: Record<string, string> = {
  // 構造的・環境的
  no_workplace_program: "職場に健診制度がない（自営・中小企業）",
  no_paid_leave: "健診のために仕事を休めない",
  access_difficulty: "受診できる場所への交通・移動が不便",
  // 経済的
  cost_concern: "費用が心配",
  cost_unknown_subsidy: "補助制度があることを知らなかった",
  // 情報的
  no_information: "どこで受けられるかわからない",
  unsure_eligibility: "自分が対象かどうかわからない",
  unsure_how_to_apply: "申込方法がわからない",
  // 心理的
  afraid_of_results: "結果が怖い・受けたくない",
  anxiety_after_positive: "陽性だったときの対応が不安",
  fatalism: "早く見つかっても仕方がないと思っている",
  // 習慣・動機的
  busy_work: "仕事・育児・介護が忙しい",
  no_symptoms: "症状がないから大丈夫と思っている",
  forgot: "毎回忘れてしまう",
  no_urgency: "緊急性を感じない・後でいいと思っている",
  // 社会的
  no_accompaniment: "一人で行くのが不安・一緒に行く人がいない",
  other: "その他",
};

// ── 障壁グループ（オンボーディング表示用） ───────────────────────────────────

export const BARRIER_GROUPS: Array<{
  id: BarrierCategory;
  label: string;
  barriers: Array<[BarrierType, string]>;
}> = [
  {
    id: "structural",
    label: "環境・制度の問題",
    barriers: [
      ["no_workplace_program", "職場に健診制度がない（自営・中小企業）"],
      ["no_paid_leave", "健診のために仕事を休めない"],
      ["access_difficulty", "受診できる場所への交通・移動が不便"],
    ],
  },
  {
    id: "economic",
    label: "費用の問題",
    barriers: [
      ["cost_concern", "費用が心配"],
      ["cost_unknown_subsidy", "補助制度があることを知らなかった"],
    ],
  },
  {
    id: "informational",
    label: "情報の問題",
    barriers: [
      ["no_information", "どこで受けられるかわからない"],
      ["unsure_eligibility", "自分が対象かどうかわからない"],
      ["unsure_how_to_apply", "申込方法がわからない"],
    ],
  },
  {
    id: "psychological",
    label: "気持ちの問題",
    barriers: [
      ["afraid_of_results", "結果が怖い・受けたくない"],
      ["anxiety_after_positive", "陽性だったときの対応が不安"],
      ["fatalism", "早く見つかっても仕方がないと思っている"],
    ],
  },
  {
    id: "habitual",
    label: "習慣・動機の問題",
    barriers: [
      ["busy_work", "仕事・育児・介護が忙しい"],
      ["no_symptoms", "症状がないから大丈夫と思っている"],
      ["forgot", "毎回忘れてしまう"],
      ["no_urgency", "緊急性を感じない・後でいいと思っている"],
    ],
  },
  {
    id: "social",
    label: "社会的なつながり",
    barriers: [
      ["no_accompaniment", "一人で行くのが不安・一緒に行く人がいない"],
      ["other", "その他"],
    ],
  },
];

// ── 障壁カテゴリメタデータ（管理画面用） ────────────────────────────────────

export const BARRIER_CATEGORY_META: Record<
  BarrierCategory,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    insight: string;
    intervention: string;
    priority: number;
  }
> = {
  structural: {
    label: "構造的障壁",
    color: "#ef4444",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    insight: "自営業・中小企業勤務者に集中。門真市の構造的課題。",
    intervention: "土日・夜間枠の拡充／出張型検診／事業者向け啓発",
    priority: 1,
  },
  habitual: {
    label: "習慣・動機的障壁",
    color: "#f97316",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    insight: "アプリの通知機能で直接介入可能な最大ボリューム層。",
    intervention: "2週間前リマインド通知／損失回避フレームメッセージ",
    priority: 2,
  },
  informational: {
    label: "情報的障壁",
    color: "#3b82f6",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    insight: "情報提供だけで受診率が急上昇する高ポテンシャル層。",
    intervention: "このアプリによる一元案内／3ステップ申込フロー",
    priority: 3,
  },
  economic: {
    label: "経済的障壁",
    color: "#eab308",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    insight: "実際には安価だが補助制度が認知されていない。",
    intervention: "「大腸がん300円」等の費用情報を申込前に明示",
    priority: 4,
  },
  psychological: {
    label: "心理的障壁",
    color: "#8b5cf6",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    insight: "受診拒否の深層因子。陽性後サポートの明示が有効。",
    intervention: "早期発見治癒率の提示／陽性後相談窓口の案内",
    priority: 5,
  },
  social: {
    label: "社会的障壁",
    color: "#10b981",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    insight: "同行者がいることで受診率が大きく向上する。",
    intervention: "家族・友人への同行勧奨通知（本アプリのコア機能）",
    priority: 6,
  },
};

// ── 障壁ごとの介入マッピング（管理画面用） ───────────────────────────────────

export const BARRIER_INTERVENTIONS: Record<
  BarrierType,
  { category: BarrierCategory; intervention: string; appSupport: boolean }
> = {
  no_workplace_program: { category: "structural", intervention: "自営業者への直接アウトリーチ強化", appSupport: true },
  no_paid_leave:        { category: "structural", intervention: "土日・夜間検診枠の拡充", appSupport: false },
  access_difficulty:    { category: "structural", intervention: "出張型・移動型検診の導入", appSupport: false },
  cost_concern:         { category: "economic",   intervention: "補助額を申込前に明示（このアプリで対応）", appSupport: true },
  cost_unknown_subsidy: { category: "economic",   intervention: "「大腸300円・肺がん無料」等の積極周知", appSupport: true },
  no_information:       { category: "informational", intervention: "受診場所・予約方法の一元案内（このアプリ）", appSupport: true },
  unsure_eligibility:   { category: "informational", intervention: "年齢・性別で対象検診を自動判定", appSupport: true },
  unsure_how_to_apply:  { category: "informational", intervention: "3ステップ申込フロー・動画説明", appSupport: true },
  afraid_of_results:    { category: "psychological", intervention: "早期発見治癒率の強調・陽性後サポートの明示", appSupport: true },
  anxiety_after_positive: { category: "psychological", intervention: "精密検査後フォロー体制・相談窓口の案内", appSupport: true },
  fatalism:             { category: "psychological", intervention: "治癒率データ・当事者の声（コンテンツ追加）", appSupport: false },
  busy_work:            { category: "habitual",   intervention: "2週間前・当日朝のリマインド通知", appSupport: true },
  no_symptoms:          { category: "habitual",   intervention: "無症状でも進行中のケース提示（損失回避型）", appSupport: true },
  forgot:               { category: "habitual",   intervention: "自動リマインド通知（このアプリ）", appSupport: true },
  no_urgency:           { category: "habitual",   intervention: "〆切の明示・損失回避フレームのメッセージ", appSupport: true },
  no_accompaniment:     { category: "social",     intervention: "家族・友人への同行勧奨通知（このアプリのコア）", appSupport: true },
  other:                { category: "structural",  intervention: "個別ヒアリングが必要", appSupport: false },
};

// ── メッセージフレーム（RCT第2軸） ──────────────────────────────────────────

export const MESSAGE_FRAME_LABELS: Record<
  MessageFrameType,
  { label: string; desc: string; example: string }
> = {
  loss_frame: {
    label: "損失回避型",
    desc: "「今受けなければ…」という損失を強調",
    example: "がんは早期発見なら90%以上が治ります。でも症状が出てからでは手遅れになることも。",
  },
  gain_frame: {
    label: "利得強調型",
    desc: "「受けることで…」という利益を強調",
    example: "がん検診を受けると、もし早期がんがあっても安心して治療できます。毎年の習慣にしませんか？",
  },
  social_norm: {
    label: "社会規範型",
    desc: "「門真市の〇〇%が…」という社会的証拠",
    example: "門真市では昨年、対象者の約65%ながん検診を受けました。あなたも仲間に入りませんか？",
  },
  authority: {
    label: "権威推奨型",
    desc: "専門家・行政からの推薦",
    example: "門真市健康増進課より：今年のがん検診の受診をお勧めします。早期発見が命を守ります。",
  },
};

// ── プロフィール + 間接質問から障壁を自動推定 ────────────────────────────────

export type MindsetType = "curious" | "procrastinate" | "afraid" | "none";

export function buildBarriersFromProfile(params: {
  occupation: OccupationType | "";
  hasWorkplaceCheckup: boolean | null;
  familyStructure: FamilyStructure | "";
  mindset: MindsetType | null;
}): BarrierType[] {
  const set = new Set<BarrierType>();

  // 職業・職場健診 → 構造的障壁（ユーザーに直接聞かずに推定）
  if (
    params.occupation === "self_employed" ||
    params.occupation === "part_time" ||
    params.hasWorkplaceCheckup === false
  ) {
    set.add("no_workplace_program");
  }

  // 家族構成 → 社会的障壁（孤立リスク）
  if (params.familyStructure === "alone") {
    set.add("no_accompaniment");
  }

  // マインドセット（間接的な1問）→ 主要障壁を推定
  // ※ 直接「なぜ受けないか」を聞くより正直な回答が得られる
  switch (params.mindset) {
    case "curious":
      set.add("no_information");
      set.add("unsure_how_to_apply");
      break;
    case "procrastinate":
      set.add("forgot");
      set.add("no_urgency");
      break;
    case "afraid":
      set.add("afraid_of_results");
      break;
    case "none":
      set.add("no_symptoms");
      break;
  }

  return Array.from(set);
}

export const OCCUPATION_LABELS: Record<string, string> = {
  employee_large: "会社員・公務員（大きな会社）",
  employee_small: "会社員（中小企業・個人事業所）",
  self_employed: "自営業・フリーランス",
  part_time: "パートタイム・アルバイト",
  other: "専業主婦/主夫・その他",
};

// 職業から職場健診の有無を自動推定できるか
export const OCCUPATION_HAS_WORKPLACE_CHECKUP: Partial<Record<string, boolean | null>> = {
  employee_large: null,   // 大企業は多くが職場健診あり → 確認が必要
  employee_small: null,   // 中小は不明 → 確認が必要
  self_employed: false,   // 自営業は確実にない
  part_time: false,       // パートは確実にない
  other: null,            // 不明
};

// 門真市の公的検診費用（参考値）
export const KADOMA_SCREENING_COSTS: Record<string, string> = {
  colon: "300円",
  lung: "100円",
  gastric: "800円",
  breast: "400円",
  cervical: "400円",
};

export const FAMILY_STRUCTURE_LABELS: Record<string, string> = {
  alone: "一人暮らし",
  couple: "夫婦のみ",
  family_with_children: "子育て中（子どもと同居）",
  multi_generation: "親・祖父母と同居",
  other: "その他",
};
