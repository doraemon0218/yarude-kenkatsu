"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUser } from "@/lib/store";
import { getRecommendedScreenings, KADOMA_SCREENING_COSTS } from "@/lib/screening-data";
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

  // 費用アクセスが困難な層か（自営業・職場健診なし）
  const isCostSensitive =
    user.occupation === "self_employed" ||
    user.occupation === "part_time" ||
    user.hasWorkplaceCheckup === false;

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

      {/* 費用アクセスが困難な層へのコストバナー */}
      {isCostSensitive && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex gap-2.5 items-center">
          <span className="text-xl flex-shrink-0">💚</span>
          <div>
            <p className="text-xs font-medium text-emerald-800">門真市の補助で安く受けられます</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              大腸がん <strong>300円</strong> · 肺がん <strong>100円</strong> · 胃がん <strong>800円</strong>
            </p>
          </div>
        </div>
      )}

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
                      {KADOMA_SCREENING_COSTS[s.id] && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700">
                          {KADOMA_SCREENING_COSTS[s.id]}
                        </Badge>
                      )}
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
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-slate-500">根拠・出典</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.evidence}</p>
                    <div className="space-y-1.5 pt-1 border-t border-slate-200">
                      {s.citations.map((c) => (
                        <a
                          key={c.url}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 group"
                        >
                          <span className="text-xs text-slate-400 mt-0.5 flex-shrink-0">🔗</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-emerald-700 group-hover:underline font-medium">
                              {c.org}
                            </span>
                            <span className="text-xs text-slate-400 ml-1">（{c.year}）</span>
                            <p className="text-xs text-slate-500 truncate">{c.title}</p>
                            {c.grade && (
                              <span className="inline-block text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-1.5 py-0.5 mt-0.5">
                                {c.grade}
                              </span>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
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

      {/* 根拠ノート：下部に移動・簡潔化 */}
      <div className="border border-slate-200 rounded-xl p-3 flex gap-2.5">
        <span className="text-base flex-shrink-0">📋</span>
        <p className="text-xs text-slate-500 leading-relaxed">
          厚生労働省「がん予防重点健康教育及びがん検診実施のための指針」（2023年改訂）準拠。科学的根拠のある検診のみを表示。この情報は医師の診断を代替するものではありません。
        </p>
      </div>
    </div>
  );
}
