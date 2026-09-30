"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUser } from "@/lib/store";
import { getRecommendedScreenings, ALL_SCREENING_NAMES } from "@/lib/screening-data";
import { getTopFacilities } from "@/lib/facility-data";
import type { Facility, ScreeningRecommendation } from "@/lib/types";

export default function FacilitiesPage() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [screenings, setScreenings] = useState<ScreeningRecommendation[]>([]);

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push("/"); return; }
    const recs = getRecommendedScreenings(user.age, user.gender);
    setScreenings(recs);
    setFacilities(getTopFacilities(recs.map((s) => s.id)));
  }, [router]);

  const getScreeningName = (id: string) =>
    ALL_SCREENING_NAMES[id] ?? id;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">近くで受けられる施設</h1>
        <p className="text-sm text-slate-500 mt-1">あなたの検診が受けられる、門真市内の施設です</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <span className="text-xl flex-shrink-0">💡</span>
        <div className="text-xs text-amber-800">
          <p className="font-medium mb-0.5">市のがん検診について</p>
          <p>門真市国民健康保険加入者は自己負担が安く（500〜1,000円程度）受診できます。健康増進課（06-6902-6514）にお問い合わせください。</p>
        </div>
      </div>

      <div className="space-y-4">
        {facilities.map((f, i) => (
          <Card key={f.id} className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{f.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{f.address}</p>
                  <p className="text-xs text-slate-500">{f.openHours}</p>
                </div>
                <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200 bg-emerald-50 flex-shrink-0">
                  {f.distanceKm}km
                </Badge>
              </div>

              {/* Available screenings */}
              <div className="flex flex-wrap gap-1.5">
                {f.availableScreenings.map((sid) => (
                  <span key={sid} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {getScreeningName(sid)}
                  </span>
                ))}
              </div>

              {f.notes && (
                <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">{f.notes}</p>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
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
                    Web申込なし
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/screening">
          <Button variant="outline" className="w-full rounded-xl">← 検診一覧に戻る</Button>
        </Link>
        <Link href="/trusted-people">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            大切な人に伝える →
          </Button>
        </Link>
      </div>
    </div>
  );
}
