// 自費で受ける検査と、門真市内・近隣の実在施設
// 情報は2026年10月時点の各施設公開情報・検診予約サイト（マーソ等）から確認したもの。
// 費用は目安。必ず予約時に施設へ確認してもらう前提で表示する。

export type SelfPayFacilityId =
  | "seikoukai"
  | "aiyukai"
  | "setsunan"
  | "matsushita"
  | "kmu";

export interface SelfPayFacility {
  id: SelfPayFacilityId;
  name: string;
  city: "門真市" | "守口市";
  address: string;
  phone?: string;
  access: string;
  hours: string;
  url: string;
  urlLabel: string;
  highlights: string[];
  priceExamples: Array<{ label: string; price: string }>;
  note?: string;
}

export const SELF_PAY_FACILITIES: SelfPayFacility[] = [
  {
    id: "seikoukai",
    name: "正幸会病院",
    city: "門真市",
    address: "大阪府門真市中町11-54",
    phone: "06-6905-8833",
    access: "京阪 古川橋駅・門真市駅",
    hours: "日・祝休み／水・土は午前のみ",
    url: "https://www.mrso.jp/osaka/kadoma/",
    urlLabel: "プランと料金を見る（マーソ）",
    highlights: ["CTを使ったがん検診", "胃カメラ・大腸カメラ", "人間ドック", "駐車場あり"],
    priceExamples: [
      { label: "定期健康診断", price: "4,950円〜" },
      { label: "CTがん検診プラン", price: "44,000円〜" },
      { label: "CT＋内視鏡がん検診", price: "99,000円〜" },
    ],
  },
  {
    id: "aiyukai",
    name: "愛悠会クリニック",
    city: "門真市",
    address: "大阪府門真市殿島町6-4 守口門真商工会館2階",
    access: "京阪 門真市駅から徒歩約5分",
    hours: "受付 9:00〜17:00（日・祝休み）",
    url: "https://www.mrso.jp/osaka/kadoma/h00004910/",
    urlLabel: "予約・料金を見る（マーソ）",
    highlights: ["健診専門のクリニック", "腹部エコー", "腫瘍マーカー・肝炎検査", "土曜も実施日あり"],
    priceExamples: [
      { label: "定期健康診断", price: "8,800円" },
      { label: "生活習慣病予防健診＋腹部エコー", price: "22,440円" },
      { label: "人間ドック（バリウム＋腫瘍マーカー）", price: "34,100円" },
    ],
    note: "電話番号は予約サイトの施設ページで確認してください。",
  },
  {
    id: "setsunan",
    name: "摂南総合病院",
    city: "門真市",
    address: "大阪府門真市柳町1-10",
    phone: "06-6909-0300",
    access: "京阪 古川橋駅",
    hours: "平日 9:00〜12:00・16:00〜19:00／土 午前（日・祝休み）",
    url: "https://setsunan.or.jp/",
    urlLabel: "病院の公式サイト",
    highlights: ["眼科", "耳鼻咽喉科", "整形外科", "産婦人科・乳腺外科"],
    priceExamples: [],
    note: "目・耳・骨・婦人科の検査ができる診療科がそろっています。検査だけ受けたいときは、予約時に「自費の検査を受けたい」と伝え、費用を確認してください。",
  },
  {
    id: "matsushita",
    name: "松下記念病院 予防医療センター",
    city: "守口市",
    address: "大阪府守口市外島町5-55",
    phone: "0120-130-533",
    access: "地下鉄 守口駅から徒歩10分／京阪 守口市駅から徒歩15分（無料シャトルバスあり）",
    hours: "予約電話 平日 8:30〜16:45",
    url: "https://kenpo.jpn.panasonic.com/kinen/dock-kenshin/",
    urlLabel: "公式サイト（個人のWeb予約あり）",
    highlights: ["人間ドック", "乳がん・子宮頸がん検診", "骨粗しょう症検査", "大阪府がん診療拠点病院"],
    priceExamples: [
      { label: "人間ドック（標準）", price: "46,200円" },
      { label: "男性5大がん検診", price: "69,300円" },
    ],
    note: "パナソニック健保以外の一般の方も予約できます。",
  },
  {
    id: "kmu",
    name: "関西医科大学総合医療センター",
    city: "守口市",
    address: "大阪府守口市文園町10-15",
    phone: "06-6992-1001",
    access: "京阪 滝井駅から徒歩2分／地下鉄 太子橋今市駅から徒歩6分",
    hours: "ドック受付 平日 9:00〜16:00",
    url: "https://www.mrso.jp/osaka/moriguchi/h00005169/",
    urlLabel: "ドックの種類と料金を見る（マーソ）",
    highlights: ["肺がんドック", "脳ドック・認知症ドック", "心臓ドック", "レディースドック・骨密度", "PET検査"],
    priceExamples: [
      { label: "人間ドック（標準）", price: "51,700円〜" },
    ],
    note: "電話番号は病院代表です。専門ドックがそろう大学病院です。",
  },
];

export const FACILITY_BY_ID: Record<SelfPayFacilityId, SelfPayFacility> = Object.fromEntries(
  SELF_PAY_FACILITIES.map((f) => [f.id, f])
) as Record<SelfPayFacilityId, SelfPayFacility>;

// 根拠の強さ（医学知識がなくても分かる表現）
export type EvidenceLevel = "strong" | "conditional" | "limited";

export const EVIDENCE_LABELS: Record<EvidenceLevel, { label: string; desc: string; className: string }> = {
  strong: {
    label: "おすすめ度 高",
    desc: "海外の公的機関も対象の人に受けるよう勧めています",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  conditional: {
    label: "人によっておすすめ",
    desc: "当てはまる条件がある人に勧められています",
    className: "bg-sky-100 text-sky-800 border-sky-200",
  },
  limited: {
    label: "参考程度",
    desc: "受けて得をするという証拠はまだ十分ではありません",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export interface SelfPayTest {
  id: string;
  icon: string;
  name: string;
  forWhom: string;
  why: string;
  evidence: EvidenceLevel;
  costRange: string;
  where: Array<{ facility: SelfPayFacilityId; how: string }>;
  tip?: string;
}

export const SELF_PAY_TESTS: SelfPayTest[] = [
  {
    id: "lung-ct",
    icon: "🫁",
    name: "肺がんCT（低線量CT）",
    forWhom: "50歳以上で、タバコを長く・たくさん吸ってきた人（やめた人も含む）",
    why: "市の検診はレントゲンです。CTはもっと小さい肺がんを見つけられます。",
    evidence: "conditional",
    costRange: "約1〜2万円",
    where: [
      { facility: "kmu", how: "肺がんドック" },
      { facility: "seikoukai", how: "CTがん検診プラン" },
    ],
    tip: "タバコを吸わない人には、市のレントゲン検診で十分です。",
  },
  {
    id: "hpv",
    icon: "🌸",
    name: "HPV検査（子宮頸がん）",
    forWhom: "30歳以上の女性",
    why: "子宮頸がんの原因ウイルスがいるかを調べます。市の細胞診と組み合わせると見逃しが減ります。",
    evidence: "strong",
    costRange: "約5,000〜8,000円",
    where: [
      { facility: "setsunan", how: "産婦人科で相談" },
      { facility: "matsushita", how: "子宮頸がん検診（オプションを確認）" },
    ],
  },
  {
    id: "gastroscopy",
    icon: "🔦",
    name: "胃カメラ（胃内視鏡）",
    forWhom: "50歳以上で、バリウムが苦手な人・ピロリ菌がいると言われた人",
    why: "市の胃がん検診はバリウムです。胃カメラは胃の中を直接見られます。",
    evidence: "strong",
    costRange: "約1.5〜2万円",
    where: [
      { facility: "seikoukai", how: "胃カメラを含むプラン" },
      { facility: "kmu", how: "人間ドック" },
    ],
    tip: "胃の痛みなど症状があるときは、検診ではなく保険診療で受けられます。まず内科へ。",
  },
  {
    id: "breast-echo",
    icon: "🎀",
    name: "乳房エコー（超音波）",
    forWhom: "40代の女性、「高濃度乳房」と言われた女性",
    why: "マンモグラフィで白く写りやすい乳房でも、しこりを見つけやすくなります。",
    evidence: "limited",
    costRange: "約4,000〜6,000円",
    where: [
      { facility: "setsunan", how: "乳腺外科で相談" },
      { facility: "matsushita", how: "乳がん検診" },
      { facility: "kmu", how: "レディースドック" },
    ],
    tip: "市のマンモグラフィ（2年に1回）の代わりではなく、追加で考えるものです。",
  },
  {
    id: "bone",
    icon: "🦴",
    name: "骨密度検査",
    forWhom: "50歳以上の女性（閉経後）、70歳以上の男性",
    why: "骨がもろくなると、転んだだけで骨折し、寝たきりの原因になります。痛みなく進むので測らないと分かりません。",
    evidence: "strong",
    costRange: "約1,000〜3,000円",
    where: [
      { facility: "setsunan", how: "整形外科で相談" },
      { facility: "matsushita", how: "骨粗しょう症検査" },
      { facility: "kmu", how: "骨密度検査" },
    ],
  },
  {
    id: "eye",
    icon: "👁️",
    name: "目の検査（緑内障・白内障）",
    forWhom: "40歳以上のすべての人",
    why: "緑内障は失明の原因1位。視野が欠けても自分では気づきにくく、40歳以上の20人に1人がかかっています。",
    evidence: "conditional",
    costRange: "約1,000〜3,000円",
    where: [
      { facility: "setsunan", how: "眼科で相談" },
    ],
    tip: "近所の眼科クリニックでも受けられます。「検診で目を診てほしい」と伝えるだけでOK。",
  },
  {
    id: "hearing",
    icon: "👂",
    name: "聞こえの検査（聴力）",
    forWhom: "65歳以上、聞き返すことが増えた人",
    why: "聞こえにくさは、認知症の「防げる原因」の中で最も大きいもののひとつです。補聴器で対策できます。",
    evidence: "conditional",
    costRange: "約1,000〜3,000円",
    where: [
      { facility: "setsunan", how: "耳鼻咽喉科で相談" },
    ],
  },
  {
    id: "brain",
    icon: "🧠",
    name: "もの忘れ・脳の検査",
    forWhom: "もの忘れが気になる人、家族に心配された人",
    why: "早い段階で分かると、進行を遅らせる対策や生活の準備ができます。",
    evidence: "limited",
    costRange: "約3,000円〜（脳ドックは数万円）",
    where: [
      { facility: "kmu", how: "認知症ドック・脳ドック" },
    ],
    tip: "気になる症状があるなら、まずかかりつけ医に相談すれば保険で検査できることが多いです。",
  },
  {
    id: "heart",
    icon: "❤️",
    name: "心臓の検査（心電図・心臓ドック）",
    forWhom: "40歳以上で、血圧・血糖・コレステロールが高めの人",
    why: "不整脈（心房細動）は脳梗塞の原因になります。症状がなくても見つかることがあります。",
    evidence: "limited",
    costRange: "心電図 約1,000〜3,000円／心臓ドック 数万円",
    where: [
      { facility: "kmu", how: "心臓ドック" },
      { facility: "seikoukai", how: "健康診断・循環器内科" },
    ],
  },
  {
    id: "dock",
    icon: "📋",
    name: "人間ドック（まとめて受ける）",
    forWhom: "職場の健診がない自営業の人、一度にまとめて済ませたい人",
    why: "血液・尿・胃・腹部エコーなどを1日で受けられます。市の検診と組み合わせると費用をおさえられます。",
    evidence: "limited",
    costRange: "約2〜7万円",
    where: [
      { facility: "aiyukai", how: "人間ドック・生活習慣病予防健診" },
      { facility: "seikoukai", how: "各種プラン" },
      { facility: "matsushita", how: "人間ドック" },
      { facility: "kmu", how: "人間ドック" },
    ],
    tip: "国民健康保険の人は、人間ドックの費用助成がないか市の保険年金課に確認を。",
  },
];

export const SELF_PAY_TEST_BY_ID: Record<string, SelfPayTest> = Object.fromEntries(
  SELF_PAY_TESTS.map((t) => [t.id, t])
);

// 厚生労働省「医療情報ネット（ナビイ）」：診療科・地域で医療機関を探せる
export const IRYOU_NAVI_URL = "https://www.iryou.teikyouseido.mhlw.go.jp/";
