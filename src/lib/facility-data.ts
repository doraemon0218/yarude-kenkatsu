import type { Facility } from "./types";

export const KADOMA_FACILITIES: Facility[] = [
  {
    id: "f1",
    name: "門真市保健福祉センター（健康増進課）",
    address: "大阪府門真市御堂町14-1 保健福祉センター4階",
    phone: "06-6904-6400",
    website: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/index.html",
    applyUrl: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/2/4105.html",
    availableScreenings: ["colon", "lung", "gastric", "breast", "cervical"],
    distanceKm: 0.5,
    openHours: "9:00〜17:30",
    openDays: ["月", "火", "水", "木", "金"],
    hasSaturdayHours: false,
    hasEveningHours: false,
    onlineReservation: true,
    screeningCosts: {
      colon: "300円",
      lung: "100円",
      gastric: "800円",
      breast: "1,200〜1,500円",
      cervical: "500円",
    },
    costNote: "70歳以上・市民税非課税世帯・生活保護受給者は無料。WEB予約「アイテル」対応。",
    notes: "市の集団検診（助成あり）の申し込み・問い合わせ先。まとめて複数の検診を受けるのに最適。個別検診ができる市内の医療機関もここで教えてもらえます。",
  },
];

export function getFacilitiesForScreening(screeningIds: string[]): Facility[] {
  return KADOMA_FACILITIES.filter((f) =>
    screeningIds.some((id) => f.availableScreenings.includes(id))
  ).sort((a, b) => a.distanceKm - b.distanceKm);
}

export function getTopFacilities(screeningIds: string[], limit = 3): Facility[] {
  return getFacilitiesForScreening(screeningIds).slice(0, limit);
}
