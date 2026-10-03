"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUser } from "@/lib/store";
import { getRecommendedScreenings, ALL_SCREENING_NAMES } from "@/lib/screening-data";
import { KADOMA_FACILITIES } from "@/lib/facility-data";
import type { Facility, DayOfWeek, ScreeningRecommendation } from "@/lib/types";

const ALL_DAYS: DayOfWeek[] = ["月", "火", "水", "木", "金", "土", "日"];

function DayBadges({ openDays }: { openDays: DayOfWeek[] }) {
  return (
    <div className="flex gap-1">
      {ALL_DAYS.map((d) => {
        const open = openDays.includes(d);
        const isSat = d === "土";
        const isSun = d === "日";
        return (
          <span
            key={d}
            className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium
              ${open
                ? isSun ? "bg-red-100 text-red-600"
                  : isSat ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-300"
              }`}
          >
            {d}
          </span>
        );
      })}
    </div>
  );
}

type FilterKey = "all" | "saturday" | "evening" | "online";

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: "all",      label: "すべて",     icon: "📋" },
  { key: "saturday", label: "土曜OK",     icon: "📅" },
  { key: "evening",  label: "夕方以降",   icon: "🌆" },
  { key: "online",   label: "Web予約",    icon: "🖥️" },
];

export default function FacilitiesPage() {
  const [userScreeningIds, setUserScreeningIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [myScreeningsOnly, setMyScreeningsOnly] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) {
      const recs = getRecommendedScreenings(user.age, user.gender);
      setUserScreeningIds(recs.map((r) => r.id));
    }
  }, []);

  const filtered = KADOMA_FACILITIES.filter((f) => {
    if (filter === "saturday" && !f.hasSaturdayHours) return false;
    if (filter === "evening"  && !f.hasEveningHours)  return false;
    if (filter === "online"   && !f.onlineReservation) return false;
    if (myScreeningsOnly && userScreeningIds.length > 0) {
      if (!userScreeningIds.some((id) => f.availableScreenings.includes(id))) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">施設を比較する</h1>
        <p className="text-sm text-slate-500 mt-1">曜日・費用・受けられる検診をパッと確認</p>
      </div>

      {/* Filter bar */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                filter === f.key
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
        {userScreeningIds.length > 0 && (
          <button
            onClick={() => setMyScreeningsOnly((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
              myScreeningsOnly
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-500 border-slate-200 hover:border-blue-400"
            }`}
          >
            {myScreeningsOnly ? "✓ " : ""}自分の検診が受けられる施設のみ
          </button>
        )}
      </div>

      {/* Comparison table — visible context summary */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-xs min-w-[480px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-3 py-2 font-medium text-slate-500 w-36">施設</th>
              <th className="text-left px-3 py-2 font-medium text-slate-500">曜日</th>
              <th className="text-left px-3 py-2 font-medium text-slate-500">時間</th>
              <th className="text-left px-3 py-2 font-medium text-slate-500">Web予約</th>
              <th className="text-left px-3 py-2 font-medium text-slate-500">距離</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => (
              <tr key={f.id} className={i !== filtered.length - 1 ? "border-b border-slate-100" : ""}>
                <td className="px-3 py-2.5">
                  <span className="font-medium text-slate-700 leading-snug line-clamp-2">{f.name}</span>
                </td>
                <td className="px-3 py-2.5">
                  <DayBadges openDays={f.openDays} />
                </td>
                <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                  {f.openHours}
                  {f.hasEveningHours && (
                    <span className="ml-1 text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 rounded px-1">夕方OK</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {f.onlineReservation ? (
                    <span className="text-emerald-600 font-medium">✓</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{f.distanceKm}km</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6">条件に合う施設が見つかりませんでした。フィルターを変えてみてください。</p>
      )}

      {/* Detail cards */}
      <div className="space-y-3">
        {filtered.map((f, i) => (
          <div key={f.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm leading-snug">{f.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{f.address}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">{f.distanceKm}km</span>
            </div>

            {/* Open days + hours */}
            <div className="px-4 pb-3 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <DayBadges openDays={f.openDays} />
                <span className="text-xs text-slate-500">{f.openHours}</span>
                {f.hasSaturdayHours && (
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-medium">土曜OK</span>
                )}
                {f.hasEveningHours && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full px-2 py-0.5 font-medium">夕方以降OK</span>
                )}
              </div>

              {/* Cost table */}
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-medium text-slate-600 mb-1.5">💴 検診費用</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(f.screeningCosts).map(([id, cost]) => (
                    <div key={id} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">{ALL_SCREENING_NAMES[id] ?? id}</span>
                      <span className="text-xs font-medium text-slate-700 whitespace-nowrap">{cost}</span>
                    </div>
                  ))}
                </div>
                {f.costNote && (
                  <p className="text-xs text-slate-400 mt-1.5">{f.costNote}</p>
                )}
              </div>

              {/* Available screenings */}
              <div>
                <p className="text-xs text-slate-500 mb-1">受けられる検診</p>
                <div className="flex flex-wrap gap-1">
                  {f.availableScreenings.map((sid) => {
                    const isUserNeeded = userScreeningIds.includes(sid);
                    return (
                      <span
                        key={sid}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isUserNeeded
                            ? "bg-emerald-100 text-emerald-700 font-medium"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {ALL_SCREENING_NAMES[sid] ?? sid}
                        {isUserNeeded && " ✓"}
                      </span>
                    );
                  })}
                </div>
              </div>

              {f.notes && (
                <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">{f.notes}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              <a
                href={`tel:${f.phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                📞 電話する
              </a>
              {f.applyUrl ? (
                <a
                  href={f.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-emerald-600 text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition-colors"
                >
                  🌐 Web申し込み
                </a>
              ) : (
                <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-slate-400 text-sm">
                  電話予約のみ
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/screening">
          <Button variant="outline" className="w-full rounded-xl text-sm">← 検診一覧に戻る</Button>
        </Link>
        <Link href="/notify">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm">
            大切な人に伝える →
          </Button>
        </Link>
      </div>
    </div>
  );
}
