"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveUser } from "@/lib/store";
import type { UserProfile, Gender, OccupationType, FamilyStructure, BarrierType } from "@/lib/types";
import { BARRIER_LABELS, OCCUPATION_LABELS, FAMILY_STRUCTURE_LABELS } from "@/lib/screening-data";

const STEPS = ["基本情報", "生活背景", "受診歴・障壁"] as const;

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [occupation, setOccupation] = useState<OccupationType | "">("");
  const [familyStructure, setFamilyStructure] = useState<FamilyStructure | "">("");
  const [healthAwareness, setHealthAwareness] = useState<number>(3);
  const [lastScreeningYear, setLastScreeningYear] = useState<string>("");
  const [barriers, setBarriers] = useState<BarrierType[]>([]);

  const toggleBarrier = (b: BarrierType) => {
    setBarriers((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  };

  const handleStart = () => {
    if (!age || !gender) return;
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) return;

    const user: UserProfile = {
      id: crypto.randomUUID(),
      age: ageNum,
      gender: gender as Gender,
      occupation: (occupation || "other") as OccupationType,
      familyStructure: (familyStructure || "other") as FamilyStructure,
      healthAwarenessScore: healthAwareness as 1 | 2 | 3 | 4 | 5,
      lastScreeningYear: lastScreeningYear ? parseInt(lastScreeningYear) : undefined,
      barriers,
      notificationGroup:
        Math.random() < 0.5 ? "self_only" : "self_and_family",
      registeredAt: new Date().toISOString(),
    };
    saveUser(user);
    router.push("/screening");
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full">
          厚生労働省指針準拠 · 医師監修
        </div>
        <h1 className="text-2xl font-bold text-slate-800 leading-snug">
          あなたが受けるべき<br />
          <span className="text-emerald-600">がん検診</span>を調べる
        </h1>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          年齢と性別を入れるだけ。根拠のある検診だけを、あなたに合わせてお伝えします。
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 ${i <= step ? "text-emerald-600" : "text-slate-400"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < step ? "bg-emerald-600 text-white" : i === step ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400" : "bg-slate-100 text-slate-400"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs hidden sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 ${i < step ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: 基本情報 */}
      {step === 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">年齢</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="例: 45"
                  className="w-28 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-sm text-slate-500">歳</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">性別</label>
              <div className="flex gap-3">
                {(["male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      gender === g
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {g === "male" ? "男性" : "女性"}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setStep(1)}
              disabled={!age || !gender}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              次へ →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: 生活背景 */}
      {step === 1 && (
        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-5">
            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
              この情報は、どのような背景を持つ方に検診が届きやすいかを分析するために使います。個人を特定する用途には使いません。
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">お仕事の種類</label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.entries(OCCUPATION_LABELS) as [OccupationType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setOccupation(key)}
                    className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                      occupation === key
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">家族構成</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(FAMILY_STRUCTURE_LABELS) as [FamilyStructure, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFamilyStructure(key)}
                    className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                      familyStructure === key
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                健康への関心度 <span className="text-emerald-600 font-bold">{healthAwareness}</span>/5
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={healthAwareness}
                onChange={(e) => setHealthAwareness(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>関心が低い</span>
                <span>とても関心がある</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">← 戻る</Button>
              <Button onClick={() => setStep(2)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">次へ →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: 受診歴・障壁 */}
      {step === 2 && (
        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">最後にがん検診を受けた年（わかる場合）</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={2000}
                  max={2026}
                  value={lastScreeningYear}
                  onChange={(e) => setLastScreeningYear(e.target.value)}
                  placeholder="例: 2023"
                  className="w-32 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-sm text-slate-500">年（なければ空欄）</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">受診しなかった理由（複数選択可）</label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.entries(BARRIER_LABELS) as [BarrierType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleBarrier(key)}
                    className={`text-left px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-2 ${
                      barriers.includes(key)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold
                      ${barriers.includes(key) ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}">
                      {barriers.includes(key) ? "✓" : ""}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← 戻る</Button>
              <Button onClick={handleStart} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                検診を確認する →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom info */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "🔒", label: "個人情報不要", desc: "名前・住所は不要" },
          { icon: "📋", label: "根拠に基づく", desc: "厚労省指針準拠" },
          { icon: "💚", label: "無料", desc: "市民は低負担" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-3 text-center border border-slate-100">
            <div className="text-xl mb-1">{item.icon}</div>
            <div className="text-xs font-medium text-slate-700">{item.label}</div>
            <div className="text-xs text-slate-400">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
