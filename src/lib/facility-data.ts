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
    notes: "市の集団検診（助成あり）。まとめて複数の検診を受けるのに最適。",
  },
  {
    id: "f2",
    name: "門真市立総合医療センター",
    address: "大阪府門真市松生町1-1",
    phone: "06-6901-1455",
    website: "https://www.city.kadoma.osaka.jp/hospital",
    applyUrl: "https://www.city.kadoma.osaka.jp/hospital/gairai/yoyaku",
    availableScreenings: ["colon", "lung", "gastric", "breast", "cervical"],
    distanceKm: 1.2,
    openHours: "受付 8:30〜11:30",
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
    costNote: "市の助成価格。精密検査もワンストップ対応。",
    notes: "総合病院のため、要精密検査になっても同じ病院で対応できる安心感がある。",
  },
  {
    id: "f3",
    name: "門真市医師会検診センター",
    address: "大阪府門真市幸福町1-1",
    phone: "06-6906-0100",
    availableScreenings: ["colon", "lung", "gastric", "breast"],
    distanceKm: 0.8,
    openHours: "8:30〜12:00",
    openDays: ["月", "火", "水", "木", "金", "土"],
    hasSaturdayHours: true,
    hasEveningHours: false,
    onlineReservation: false,
    screeningCosts: {
      colon: "300円",
      lung: "100円",
      gastric: "800円",
      breast: "1,200〜1,500円",
    },
    costNote: "電話予約制。土曜午前も受付。",
    notes: "土曜日に受けられる数少ない施設。仕事のある平日に行けない方に。",
  },
  {
    id: "f4",
    name: "かどま内科・消化器クリニック（例）",
    address: "大阪府門真市大字門真1番地",
    phone: "06-6908-1234",
    availableScreenings: ["colon", "lung", "gastric"],
    distanceKm: 0.3,
    openHours: "9:00〜12:30 / 14:00〜18:30",
    openDays: ["月", "水", "金"],
    hasSaturdayHours: false,
    hasEveningHours: true,
    onlineReservation: false,
    screeningCosts: {
      colon: "約3,000円（自費）",
      lung: "約2,000円（自費）",
      gastric: "約8,000〜15,000円（自費）",
    },
    costNote: "市の助成対象外（自費）。かかりつけ医として通いやすい。",
    notes: "夕方18:30まで受付。仕事後に立ち寄れる。市の集団検診と異なり随時予約可能。",
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
