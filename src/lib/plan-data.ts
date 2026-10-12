// マイ健診プラン：年齢・性別と受診記録から「やること／できている／まだ先」を判定する
import type { UserProfile } from "./types";
import type { ScreeningRecords } from "./store";
import { SCREENING_GUIDELINES, KADOMA_SCREENING_COSTS } from "./screening-data";
import { SELF_PAY_TEST_BY_ID, FACILITY_BY_ID } from "./self-pay-data";

const KADOMA_CANCER_URL = "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/2/4105.html";
export const KADOMA_HEALTH_PHONE = "06-6904-6400";
const KADOMA_WHERE = `門真市 健康増進課に申込（電話 ${KADOMA_HEALTH_PHONE}・市のWeb予約）`;

export type PlanKind = "public" | "self";

export interface PlanItem {
  id: string;
  icon: string;
  name: string;
  what: string;
  kind: PlanKind;
  cost: string;
  intervalYears: number; // 0 = 生涯1回
  minAge: number;
  maxAge?: number;
  gender?: "male" | "female";
  milestones?: number[]; // 節目年齢のみ対象
  action: { href: string; label: string; external?: boolean };
  where: string; // 申込・受診先（やることリスト／PDF用）
  detailHref: string;
  note?: string;
}

const CANCER_ICONS: Record<string, string> = {
  colon: "🚽",
  lung: "🫁",
  gastric: "🍙",
  breast: "🎀",
  cervical: "🌸",
};

const CANCER_WHAT: Record<string, string> = {
  colon: "自宅で便を2回とって出すだけ",
  lung: "胸のレントゲンを数秒撮るだけ",
  gastric: "バリウムを飲んで胃のレントゲン",
  breast: "マンモグラフィ（乳房のレントゲン）",
  cervical: "子宮の入り口の細胞を少しとる",
};

const cancerItems: PlanItem[] = SCREENING_GUIDELINES.map((s) => ({
  id: s.id,
  icon: CANCER_ICONS[s.id] ?? "🩺",
  name: `${s.cancerType}検診`,
  what: CANCER_WHAT[s.id] ?? s.description,
  kind: "public",
  cost: KADOMA_SCREENING_COSTS[s.id] ?? "",
  intervalYears: Math.max(1, Math.round(s.intervalMonths / 12)),
  minAge: s.minAge,
  maxAge: s.maxAge,
  gender: s.targetGender === "female_only" ? "female" : undefined,
  action: { href: KADOMA_CANCER_URL, label: "市の検診を申し込む", external: true },
  where: KADOMA_WHERE,
  detailHref: "/screening",
  note:
    s.id === "breast" || s.id === "cervical"
      ? "門真市では、年度末（3月31日）に偶数の年齢になる年度が対象です。"
      : undefined,
}));

const otherPublicItems: PlanItem[] = [
  {
    id: "tokutei",
    icon: "🩸",
    name: "特定健診（メタボ健診）",
    what: "血圧・血液・お腹まわりをまとめて確認",
    kind: "public",
    cost: "無料（国保の方）",
    intervalYears: 1,
    minAge: 40,
    maxAge: 74,
    action: {
      href: "https://www.city.kadoma.osaka.jp/kenko_fukushi/hoken/21293.html",
      label: "市の案内を見る",
      external: true,
    },
    where: "国保の方は市から届く受診券で市内の医療機関へ／会社の保険の方は勤め先・保険組合へ",
    detailHref: "/health",
    note: "会社の健康保険の方は、会社・保険組合の健診で受けます。",
  },
  {
    id: "hepatitis",
    icon: "🧪",
    name: "肝炎ウイルス検査",
    what: "採血1回。一生に1度受ければOK",
    kind: "public",
    cost: "無料",
    intervalYears: 0,
    minAge: 40,
    action: { href: KADOMA_CANCER_URL, label: "市の検診と一緒に申し込む", external: true },
    where: `がん検診と一緒に申込（門真市 健康増進課 ${KADOMA_HEALTH_PHONE}）`,
    detailHref: "/health",
  },
  {
    id: "dental",
    icon: "🦷",
    name: "歯科健診（節目）",
    what: "歯と歯ぐきのチェック",
    kind: "public",
    cost: "無料",
    intervalYears: 0,
    minAge: 30,
    milestones: [30, 40, 50, 60, 70],
    action: {
      href: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/index.html",
      label: "市の案内を見る",
      external: true,
    },
    where: `市内の協力歯科医院（場所は健康増進課 ${KADOMA_HEALTH_PHONE} で確認）`,
    detailHref: "/health",
    note: "30・40・50・60・70歳の節目の年に無料で受けられます。",
  },
];

function selfPayItem(
  testId: string,
  item: Omit<PlanItem, "id" | "icon" | "name" | "kind" | "cost" | "action" | "where" | "detailHref">
): PlanItem {
  const t = SELF_PAY_TEST_BY_ID[testId];
  const where = t.where
    .slice(0, 2)
    .map((w) => {
      const f = FACILITY_BY_ID[w.facility];
      return f.phone ? `${f.name}（${f.phone}）` : f.name;
    })
    .join("／");
  return {
    id: `self-${testId}`,
    icon: t.icon,
    name: t.name,
    kind: "self",
    cost: t.costRange,
    action: { href: `/self-pay#${testId}`, label: "受けられる場所を見る" },
    where: `${where} など`,
    detailHref: `/self-pay#${testId}`,
    ...item,
  };
}

const selfPayItems: PlanItem[] = [
  selfPayItem("eye", { what: "目の圧と奥（視神経）を診てもらう", intervalYears: 2, minAge: 40 }),
  selfPayItem("bone", { what: "かかとや腰の骨の強さを測る", intervalYears: 2, minAge: 50, gender: "female" }),
  selfPayItem("bone", { what: "腰や太ももの骨の強さを測る", intervalYears: 2, minAge: 70, gender: "male" }),
  selfPayItem("hearing", { what: "ヘッドホンで音の聞こえを調べる", intervalYears: 1, minAge: 65 }),
];

export const PLAN_ITEMS: PlanItem[] = [...cancerItems, ...otherPublicItems, ...selfPayItems];

// ── 年度・判定ロジック ────────────────────────────────────────────────────

export function fiscalYearOf(date: Date): number {
  return date.getMonth() + 1 >= 4 ? date.getFullYear() : date.getFullYear() - 1;
}

export function fiscalYearOfRecord(yearMonth: string): number {
  const [y, m] = yearMonth.split("-").map(Number);
  return m >= 4 ? y : y - 1;
}

function isEligible(item: PlanItem, age: number, gender: UserProfile["gender"]): boolean {
  if (item.gender && item.gender !== gender) return false;
  if (age < item.minAge) return false;
  if (item.maxAge && age > item.maxAge) return false;
  return true;
}

export type PlanStatus = "todo" | "ok" | "later";

export interface PlanItemState {
  item: PlanItem;
  status: PlanStatus;
  headline: string;
  lastRecord?: string;
  // 今後5年度の予定（年度 → 印）
  schedule: Record<number, "done" | "due">;
}

const HORIZON_YEARS = 5;

export function buildPlan(user: UserProfile, records: ScreeningRecords, now = new Date()) {
  const thisFY = fiscalYearOf(now);
  const years = Array.from({ length: HORIZON_YEARS }, (_, k) => thisFY + k);
  const states: PlanItemState[] = [];

  for (const item of PLAN_ITEMS) {
    const ageAt = (fy: number) => user.age + (fy - thisFY);
    const eligibleYears = years.filter((fy) => isEligible(item, ageAt(fy), user.gender));
    if (eligibleYears.length === 0) continue;

    const rec = records[item.id];
    const lastFY = rec ? fiscalYearOfRecord(rec) : undefined;
    const schedule: PlanItemState["schedule"] = {};
    if (lastFY !== undefined && lastFY >= thisFY) schedule[lastFY] = "done";

    let dueYears: number[];
    if (item.milestones) {
      dueYears = eligibleYears.filter(
        (fy) => item.milestones!.includes(ageAt(fy)) && lastFY !== fy
      );
    } else if (item.intervalYears === 0) {
      dueYears = rec ? [] : eligibleYears.slice(0, 1);
    } else {
      const firstDue = Math.max(thisFY, lastFY !== undefined ? lastFY + item.intervalYears : thisFY);
      const start = eligibleYears.find((fy) => fy >= firstDue);
      dueYears =
        start === undefined
          ? []
          : eligibleYears.filter((fy) => fy >= start && (fy - start) % item.intervalYears === 0);
    }
    for (const fy of dueYears) if (!schedule[fy]) schedule[fy] = "due";

    const eligibleNow = isEligible(item, user.age, user.gender);
    let status: PlanStatus;
    let headline: string;
    if (eligibleNow && dueYears.includes(thisFY)) {
      status = "todo";
      if (lastFY === undefined) headline = "まだ記録がありません";
      else headline = `前回から${thisFY - lastFY}年たっています`;
    } else if (rec) {
      status = "ok";
      if (item.intervalYears === 0 && !item.milestones) headline = "受診済み（一生に1度でOK）";
      else if (dueYears[0]) headline = `受診済み・次は${dueYears[0]}年度`;
      else headline = "受診済み";
    } else {
      status = "later";
      const next = dueYears[0];
      const nextMilestone = item.milestones?.find((m) => m > user.age);
      if (item.milestones && !next && nextMilestone)
        headline = `次は${nextMilestone}歳の年度（${thisFY + nextMilestone - user.age}年度ごろ）`;
      else if (!eligibleNow) headline = next ? `${next}年度（${ageAt(next)}歳）から対象` : "まだ対象外";
      else headline = next ? `次は${next}年度（${ageAt(next)}歳）` : "今は対象外";
    }

    const bmi = getBmiInfo(user);
    const shown =
      item.id === "tokutei" && bmi && (bmi.level === "high" || bmi.level === "veryHigh")
        ? { ...item, note: `BMI ${bmi.bmi}（${bmi.label}）のあなたには特に大切です。${item.note ?? ""}` }
        : item;
    states.push({ item: shown, status, headline, lastRecord: rec, schedule });
  }

  const order: Record<PlanStatus, number> = { todo: 0, ok: 1, later: 2 };
  states.sort((a, b) => {
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    // 同じ状態なら市の検診（安い）を先に
    if (a.item.kind !== b.item.kind) return a.item.kind === "public" ? -1 : 1;
    return 0;
  });

  return { thisFY, years, states };
}

export type Plan = ReturnType<typeof buildPlan>;

export function fiscalYearLabel(fy: number): string {
  return `${fy}年度（${fy}年4月〜${fy + 1}年3月）`;
}

// ── 体格（BMI） ──────────────────────────────────────────────────────────

export interface BmiInfo {
  bmi: number;
  label: string;
  level: "low" | "normal" | "high" | "veryHigh";
  advice: string;
}

export function getBmiInfo(user: Pick<UserProfile, "heightCm" | "weightKg">): BmiInfo | null {
  if (!user.heightCm || !user.weightKg) return null;
  const m = user.heightCm / 100;
  const bmi = Math.round((user.weightKg / (m * m)) * 10) / 10;
  if (bmi < 18.5)
    return { bmi, label: "やせ", level: "low", advice: "栄養が足りず、骨が弱くなりやすい体格です。骨密度検査も考えましょう。" };
  if (bmi < 25)
    return { bmi, label: "ふつう", level: "normal", advice: "標準の範囲です。今の体重を保ちましょう。" };
  if (bmi < 30)
    return { bmi, label: "肥満（1度）", level: "high", advice: "血圧・血糖・コレステロールが高くなりやすい体格です。特定健診を毎年受けましょう。" };
  return { bmi, label: "肥満（2度以上）", level: "veryHigh", advice: "糖尿病や高血圧になりやすい体格です。特定健診に加えて、かかりつけ医に相談しましょう。" };
}

// ── いつ・何をする（今年度の行動ステップ） ─────────────────────────────────

export interface ActionStep {
  monthLabel: string; // 例: "10月"
  relative: string; // 例: "今月" "来月" "3か月後"
  offset: number; // 今月からの月数（並べ替え用）
  title: string;
  detail: string;
  items: PlanItemState[];
  done: boolean;
  checkable: boolean; // 項目ごとに「受けた」をチェックできるステップか
  action?: { href: string; label: string; external?: boolean };
  phone?: string;
}

export function isDoneThisYear(s: PlanItemState, thisFY: number): boolean {
  return s.schedule[thisFY] === "done";
}

export function buildActionSteps(plan: Plan, now = new Date()): ActionStep[] {
  const { thisFY } = plan;
  // 今年度やること＋今年度すでに受けたもの（チェック済みとして残す）
  const active = plan.states.filter((s) => s.status === "todo" || isDoneThisYear(s, thisFY));
  const fyEnd = new Date(thisFY + 1, 2, 31); // 3月31日
  const monthsLeft = (fyEnd.getFullYear() - now.getFullYear()) * 12 + (fyEnd.getMonth() - now.getMonth());
  const at = (offset: number) => {
    const o = Math.min(offset, Math.max(0, monthsLeft));
    const d = new Date(now.getFullYear(), now.getMonth() + o, 1);
    const relative = o === 0 ? "今月" : o === 1 ? "来月" : `${o}か月後`;
    return { monthLabel: `${d.getMonth() + 1}月`, relative, offset: o };
  };
  const allDone = (items: PlanItemState[]) => items.every((s) => isDoneThisYear(s, thisFY));

  const cancer = active.filter((s) => s.item.kind === "public" && !["tokutei", "dental"].includes(s.item.id));
  const tokutei = active.filter((s) => s.item.id === "tokutei");
  const dental = active.filter((s) => s.item.id === "dental");
  const self = active.filter((s) => s.item.kind === "self");
  const cancerTodo = cancer.filter((s) => s.status === "todo");
  const steps: ActionStep[] = [];

  if (cancerTodo.length > 0) {
    steps.push({
      ...at(0),
      title: "市の検診を申し込む",
      detail: "電話かWebで、まとめて申し込みます。集団検診なら1日で全部受けられます。",
      items: cancerTodo,
      done: false,
      checkable: false,
      action: { href: cancerTodo[0].item.action.href, label: "Webで申し込む", external: true },
      phone: KADOMA_HEALTH_PHONE,
    });
  }
  if (cancer.length > 0) {
    steps.push({
      ...at(cancerTodo.length > 0 ? 1 : 0),
      title: "検診を受ける",
      detail: cancer.some((s) => s.item.id === "colon" && s.status === "todo")
        ? "大腸がん検診は、届いたキットで当日までに便を2回とっておきます。"
        : "予約した日に会場・医療機関へ行きます。",
      items: cancer,
      done: allDone(cancer),
      checkable: true,
    });
  }
  if (tokutei.length > 0) {
    steps.push({
      ...at(cancer.length > 0 ? 1 : 0),
      title: "特定健診を受ける",
      detail: "前日の夜9時以降は食べずに。がん検診と同じ時期に済ませると忘れません。",
      items: tokutei,
      done: allDone(tokutei),
      checkable: true,
      action: tokutei[0].item.action,
    });
  }
  if (dental.length > 0) {
    steps.push({
      ...at(2),
      title: "歯科健診を受ける",
      detail: "節目の年だけの無料健診です。",
      items: dental,
      done: allDone(dental),
      checkable: true,
      action: dental[0].item.action,
    });
  }
  if (self.length > 0) {
    steps.push({
      ...at(cancer.length + tokutei.length > 0 ? 3 : 0),
      title: "自費の検査を受ける",
      detail: "市の検診が終わってから、余裕があれば。予約のときに費用を確認しましょう。",
      items: self,
      done: allDone(self),
      checkable: true,
      action: { href: "/self-pay", label: "受けられる場所を見る" },
    });
  }
  if (cancer.length > 0) {
    steps.push({
      ...at(cancerTodo.length > 0 ? 2 : 1),
      title: "結果を確認する",
      detail: "「要精密検査」と書かれていたら、必ず病院へ。精密検査を受けた人の多くは、がんではありません。",
      items: [],
      done: false,
      checkable: false,
    });
  }
  return steps.sort((a, b) => a.offset - b.offset);
}

// 来年度以降の予定（年度ごとに、受ける検査をまとめる）
export function buildFuturePlan(plan: Plan, user: UserProfile) {
  return plan.years.slice(1).map((fy) => ({
    fy,
    age: user.age + (fy - plan.thisFY),
    items: plan.states.filter((s) => s.schedule[fy] === "due").map((s) => s.item),
  }));
}

// 条件次第で検討したい自費検査（プランの判定には入れず、案内だけ）
export function getOptionalSelfPayTests(user: UserProfile): string[] {
  const ids: string[] = [];
  if (user.age >= 50) ids.push("lung-ct", "gastroscopy");
  if (user.gender === "female" && user.age >= 30) ids.push("hpv");
  if (user.gender === "female" && user.age >= 40 && user.age < 50) ids.push("breast-echo");
  if (user.age >= 40) ids.push("heart");
  if (user.age >= 60) ids.push("brain");
  if (user.occupation === "self_employed" || user.hasWorkplaceCheckup === false) ids.push("dock");
  const bmi = getBmiInfo(user);
  const boneInPlan = (user.gender === "female" && user.age >= 50) || (user.gender === "male" && user.age >= 70);
  if (bmi?.level === "low" && user.age >= 40 && !boneInPlan) ids.push("bone");
  return ids;
}
