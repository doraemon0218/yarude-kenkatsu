import type { ScreeningRecommendation } from "./types";

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
      "厚生労働省「がん予防重点健康教育及びがん検診実施のための指針」（2023年改訂）。40歳以上全員が対象。早期発見で5年生存率90%超。",
    symptoms: [
      "血便",
      "残便感",
      "便が細くなる",
      "腹痛が続く",
      "体重減少",
    ],
    plainLanguage:
      "便に血が混じっていないかを調べます。採便キットを使って自宅で採取するだけ。痛みはありません。大腸がんは早く見つければほぼ治ります。",
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
      "厚生労働省指針準拠。喫煙者（50歳以上・喫煙指数600以上）は喀痰細胞診も推奨。",
    symptoms: [
      "2週間以上続く咳",
      "血痰",
      "息切れ",
      "体重減少",
      "倦怠感",
    ],
    plainLanguage:
      "胸のレントゲン写真を撮ります。撮影時間は数秒。肺がんは症状が出てから気づくことが多く、定期的な検査が重要です。",
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
      "厚生労働省指針では50歳以上が内視鏡推奨。X線なら40歳以上で毎年も可。",
    symptoms: [
      "みぞおちの不快感",
      "食欲不振",
      "体重減少",
      "黒色便",
      "吐き気",
    ],
    plainLanguage:
      "胃カメラで胃の内側を直接確認します。ピロリ菌感染者はリスクが高いため特に重要です。早期胃がんは90%以上が治ります。",
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
      "厚生労働省指針。40歳以上女性が対象。乳がんは女性のがん罹患率1位。",
    symptoms: [
      "しこり",
      "乳房の形の変化",
      "乳頭からの分泌",
      "皮膚のくぼみ・ひきつれ",
    ],
    plainLanguage:
      "乳房をX線で撮影します。女性のがん罹患数1位が乳がんです。40代は特に発症しやすい年代。2年に1回の検査で早期発見できます。",
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
      "厚生労働省指針。20歳以上女性が対象。HPVワクチン接種者も定期検査が必要。",
    symptoms: [
      "不正出血",
      "性交後出血",
      "おりものの異常",
      "下腹部の違和感",
    ],
    plainLanguage:
      "子宮の入り口の細胞を採取して調べます。20〜30代に多く発症します。HPVウイルスが原因で、予防できるがんです。",
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

export const BARRIER_LABELS: Record<string, string> = {
  busy_work: "仕事・育児が忙しい",
  no_symptoms: "症状がないから大丈夫と思っている",
  afraid_of_results: "結果が怖い",
  cost_concern: "費用が心配",
  no_information: "どこで受けられるか知らない",
  forgot: "毎年忘れてしまう",
  other: "その他",
};

export const OCCUPATION_LABELS: Record<string, string> = {
  employee_large: "会社員（大企業・組合健保）",
  employee_small: "会社員（中小企業・協会けんぽ）",
  self_employed: "自営業・フリーランス",
  part_time: "パートタイム・アルバイト",
  other: "その他",
};

export const FAMILY_STRUCTURE_LABELS: Record<string, string> = {
  alone: "一人暮らし",
  couple: "夫婦のみ",
  family_with_children: "子育て中（子どもと同居）",
  multi_generation: "親・祖父母と同居",
  other: "その他",
};
