// ゲーミフィケーション：健診のカバー率でキャラクターのランクと装備が増える
import type { UserProfile } from "./types";
import type { Plan, PlanItemState } from "./plan-data";

export type AvatarStyle = "hero" | "dress";

export function defaultAvatarStyle(user: UserProfile): AvatarStyle {
  return user.avatarStyle ?? (user.gender === "female" ? "dress" : "hero");
}

export interface Rank {
  min: number; // カバー率(%)の下限
  hero: string;
  dress: string;
}

export const RANKS: Rank[] = [
  { min: 0, hero: "村人", dress: "町娘" },
  { min: 1, hero: "旅人", dress: "旅の娘" },
  { min: 20, hero: "見習い戦士", dress: "見習いレディ" },
  { min: 40, hero: "戦士", dress: "令嬢" },
  { min: 60, hero: "騎士", dress: "姫" },
  { min: 80, hero: "英雄", dress: "王女" },
  { min: 100, hero: "勇者", dress: "光のプリンセス" },
];

export interface Slot {
  id: string;
  name: string;
  icon: string;
}

export const SLOTS: Record<AvatarStyle, Slot[]> = {
  hero: [
    { id: "boots", name: "旅のブーツ", icon: "🥾" },
    { id: "sword", name: "はがねの剣", icon: "🗡️" },
    { id: "shield", name: "まもりの盾", icon: "🛡️" },
    { id: "armor", name: "白銀のよろい", icon: "🦺" },
    { id: "helmet", name: "騎士のかぶと", icon: "⛑️" },
    { id: "cape", name: "英雄のマント", icon: "🧣" },
  ],
  dress: [
    { id: "shoes", name: "ガラスの靴", icon: "👠" },
    { id: "necklace", name: "真珠の首飾り", icon: "📿" },
    { id: "gloves", name: "シルクの手袋", icon: "🧤" },
    { id: "wand", name: "星のステッキ", icon: "🪄" },
    { id: "tiara", name: "きらめくティアラ", icon: "👑" },
    { id: "train", name: "光のヴェール", icon: "✨" },
  ],
};

export const FINAL_REWARD: Record<AvatarStyle, Slot> = {
  hero: { id: "crown", name: "勇者の王冠とオーラ", icon: "👑" },
  dress: { id: "aura", name: "女神のオーラ", icon: "🌟" },
};

export interface GameState {
  style: AvatarStyle;
  coverage: number; // %
  covered: PlanItemState[];
  target: PlanItemState[];
  rankIndex: number;
  rankName: string;
  nextRankName?: string;
  toNextRank?: number; // あと何件で次のランクか
  equipped: Array<Slot & { by: string }>;
  locked: Slot[];
  final: Slot & { unlocked: boolean };
}

export function buildGameState(plan: Plan, user: UserProfile): GameState {
  const style = defaultAvatarStyle(user);
  // 今受けるべき対象（やること＋できている）のうち、できている割合
  const target = plan.states.filter((s) => s.status === "todo" || s.status === "ok");
  const covered = target.filter((s) => s.status === "ok");
  const coverage = target.length === 0 ? 0 : Math.round((covered.length / target.length) * 100);

  let rankIndex = 0;
  RANKS.forEach((r, i) => {
    if (coverage >= r.min && (r.min > 0 ? covered.length > 0 : true)) rankIndex = i;
  });
  const next = RANKS[rankIndex + 1];
  let toNextRank: number | undefined;
  if (next) {
    const need = Math.max(1, Math.ceil((next.min / 100) * target.length));
    toNextRank = Math.max(1, need - covered.length);
  }

  const slots = SLOTS[style];
  // 全項目カバーで最後の装備まで揃うよう、件数を装備数に比例させる
  const equipCount =
    target.length === 0 ? 0 : Math.min(slots.length, Math.round((covered.length / target.length) * slots.length));
  const equipped = slots.slice(0, equipCount).map((slot, i) => ({
    ...slot,
    by: covered[i]?.item.name ?? covered[covered.length - 1]?.item.name ?? "",
  }));

  return {
    style,
    coverage,
    covered,
    target,
    rankIndex,
    rankName: RANKS[rankIndex][style],
    nextRankName: next?.[style],
    toNextRank,
    equipped,
    locked: slots.slice(equipCount),
    final: { ...FINAL_REWARD[style], unlocked: coverage >= 100 && target.length > 0 },
  };
}
