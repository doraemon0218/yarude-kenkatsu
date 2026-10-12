"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/store";
import { getRecommendedScreenings, ALL_SCREENING_NAMES } from "@/lib/screening-data";
import { KADOMA_FACILITIES } from "@/lib/facility-data";
import type { DayOfWeek } from "@/lib/types";

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

export default function FacilitiesPage() {
  const [userScreeningIds, setUserScreeningIds] = useState<string[]>([]);

  useEffect(() => {
    const user = getUser();
    if (user) {
      const recs = getRecommendedScreenings(user.age, user.gender);
      setUserScreeningIds(recs.map((r) => r.id));
    }
  }, []);

  const filtered = KADOMA_FACILITIES;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">市の検診（補助あり）の受け方</h1>
        <p className="text-sm text-slate-500 mt-1">門真市のがん検診は数百円で受けられます。申し込み先と費用を確認しましょう。</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-bold text-emerald-900">市の検診は2通りの受け方があります</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-white rounded-xl p-3 border border-emerald-100">
            <p className="text-sm font-semibold text-slate-800">🏢 集団検診</p>
            <p className="text-xs text-slate-600 mt-1">保健福祉センターなどで決まった日にまとめて受けます。いくつかの検診を1日で済ませられます。</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-emerald-100">
            <p className="text-sm font-semibold text-slate-800">🏥 個別検診</p>
            <p className="text-xs text-slate-600 mt-1">市内の協力医療機関で、自分の都合のよい日に受けます。どの医院で受けられるかは健康増進課に電話で聞けます。</p>
          </div>
        </div>
      </div>

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

      <Link
        href="/self-pay"
        className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-2xl p-4 hover:bg-violet-100 transition-colors"
      >
        <span className="text-2xl">💡</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-violet-900">市の補助がない検査を受けたいとき</p>
          <p className="text-xs text-violet-700 mt-0.5">肺がんCT・胃カメラ・骨密度・目の検査など、門真市内と近くで自費で受けられる場所</p>
        </div>
        <span className="text-violet-500">→</span>
      </Link>

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
