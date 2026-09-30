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
    openHours: "平日 9:00〜17:30",
    notes: "大腸300円・肺100円・胃800円・乳1,200〜1,500円・子宮頸500円。70歳以上・非課税世帯は無料。WEB予約「アイテル」対応。",
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
    openHours: "平日 8:30〜11:30（受付）",
    notes: "総合病院のため精密検査もワンストップで対応可能",
  },
  {
    id: "f3",
    name: "門真市医師会検診センター",
    address: "大阪府門真市幸福町1-1",
    phone: "06-6906-0100",
    availableScreenings: ["colon", "lung", "gastric", "breast"],
    distanceKm: 0.8,
    openHours: "月〜土 8:30〜12:00",
    notes: "予約制。土曜日も受診可能",
  },
  {
    id: "f4",
    name: "近隣クリニック（内科・消化器科）",
    address: "大阪府門真市大字門真1番地",
    phone: "06-6908-1234",
    availableScreenings: ["colon", "lung", "gastric"],
    distanceKm: 0.3,
    openHours: "月・水・金 9:00〜12:30、14:00〜17:30",
    notes: "かかりつけ医としても利用可能",
  },
];

export function getFacilitiesForScreening(
  screeningIds: string[]
): Facility[] {
  return KADOMA_FACILITIES.filter((f) =>
    screeningIds.some((id) => f.availableScreenings.includes(id))
  ).sort((a, b) => a.distanceKm - b.distanceKm);
}

export function getTopFacilities(
  screeningIds: string[],
  limit = 3
): Facility[] {
  return getFacilitiesForScreening(screeningIds).slice(0, limit);
}
