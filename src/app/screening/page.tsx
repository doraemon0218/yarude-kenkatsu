"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUser } from "@/lib/store";
import { getRecommendedScreenings } from "@/lib/screening-data";
import type { UserProfile, ScreeningRecommendation } from "@/lib/types";

export default function ScreeningPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [screenings, setScreenings] = useState<ScreeningRecommendation[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/");
      return;
    }
    setUser(u);
    setScreenings(getRecommendedScreenings(u.age, u.gender));
  }, [router]);

  if (!user) return null;

  const cancerColors: Record<string, string> = {
    colon: "bg-orange-50 border-orange-200 text-orange-700",
    lung: "bg-sky-50 border-sky-200 text-sky-700",
    gastric: "bg-purple-50 border-purple-200 text-purple-700",
    breast: "bg-pink-50 border-pink-200 text-pink-700",
    cervical: "bg-rose-50 border-rose-200 text-rose-700",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-emerald-600 text-white rounded-2xl p-5">
        <p className="text-emerald-100 text-sm mb-1">
          {user.age}歳・{user.gender === "male" ? "男性" : "女性"}のあなたへ
        </p>
        <h1 className="text-xl font-bold">受けるべき検診</h1>
        <p className="text-emerald-100 text-sm mt-1">
          {screenings.length}種類の検診が推奨されています
        </p>
      </div>

      {/* Evidence note */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3">
        <span className="text-xl flex-shrink-0">📋</span>
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-medium text-slate-700">根拠について</p>
          <p>
            以下の検診は厚生労働省「がん予防重点健康教育及びがん検診実施のための指針」（2023年改訂）に基づいています。
            「受けると、がんで亡くなる確率が下がる」と科学的に確かめられた検診のみを表示しています。
          </p>
        </div>
      </div>

      {/* Screening list */}
      <div className="space-y-3">
        {screenings.map((s) => (
          <Card key={s.id} className="border-slate-200 overflow-hidden">
            <CardContent className="p-0">
              <button
                className="w-full text-left p-4"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{s.cancerType}</span>
                      <Badge variant="outline" className={`text-xs ${cancerColors[s.id] || ""}`}>
                        {s.intervalLabel}
                      </Badge>
                      {s.targetGender === "female_only" && (
                        <Badge variant="outline" className="text-xs bg-pink-50 border-pink-200 text-pink-700">
                          女性のみ
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{s.description}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{s.plainLanguage}</p>
                  </div>
                  <span className="text-slate-400 flex-shrink-0 mt-1">
                    {expanded === s.id ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expanded === s.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">こんな症状が出る前に受けてください</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.symptoms.map((sym) => (
                        <span key={sym} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">根拠・出典</p>
                    <p className="text-xs text-slate-600">{s.evidence}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/facilities">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            近くの施設を探す →
          </Button>
        </Link>
        <Link href="/trusted-people">
          <Button variant="outline" className="w-full rounded-xl">
            大切な人に伝える
          </Button>
        </Link>
      </div>

      <p className="text-xs text-slate-400 text-center">
        この情報は医師の診断を代替するものではありません。
        受診の際は医療機関にご確認ください。
      </p>
    </div>
  );
}
