"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { saveUser } from "@/lib/store";
import type { UserProfile, Gender, OccupationType, FamilyStructure, MessageFrameType } from "@/lib/types";
import {
  OCCUPATION_LABELS,
  FAMILY_STRUCTURE_LABELS,
  buildBarriersFromProfile,
  type MindsetType,
} from "@/lib/screening-data";

const STEPS = ["基本情報", "生活背景", "今の気持ち"] as const;

const MINDSET_OPTIONS: Array<{
  id: MindsetType;
  emoji: string;
  label: string;
  sub: string;
}> = [
  {
    id: "curious",
    emoji: "💭",
    label: "気になるけど、まだ受けたことがない",
    sub: "どこで受けるかよくわからない",
  },
  {
    id: "procrastinate",
    emoji: "⏰",
    label: "毎年「来年こそ」と思っている",
    sub: "つい後回しにしてしまう",
  },
  {
    id: "afraid",
    emoji: "😰",
    label: "結果が少し怖い・不安がある",
    sub: "悪いことが見つかりそうで",
  },
  {
    id: "none",
    emoji: "🙂",
    label: "特に気にしていない",
    sub: "症状がないから大丈夫かなと",
  },
];

const MESSAGE_FRAMES: MessageFrameType[] = ["loss_frame", "gain_frame", "social_norm", "authority"];

function assignRctArm(): {
  notificationGroup: "self_only" | "self_and_family";
  messageFrame: MessageFrameType;
} {
  return {
    notificationGroup: Math.random() < 0.5 ? "self_only" : "self_and_family",
    messageFrame: MESSAGE_FRAMES[Math.floor(Math.random() * MESSAGE_FRAMES.length)],
  };
}

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 0
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | "">("");

  // Step 1
  const [occupation, setOccupation] = useState<OccupationType | "">("");
  const [hasWorkplaceCheckup, setHasWorkplaceCheckup] = useState<boolean | null>(null);
  const [familyStructure, setFamilyStructure] = useState<FamilyStructure | "">("");
  const [healthAwareness, setHealthAwareness] = useState<number>(3);

  // Step 2
  const [lastScreeningYear, setLastScreeningYear] = useState<string>("");
  const [mindset, setMindset] = useState<MindsetType | null>(null);

  const handleStart = () => {
    if (!age || !gender) return;
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) return;

    const { notificationGroup, messageFrame } = assignRctArm();

    const barriers = buildBarriersFromProfile({
      occupation,
      hasWorkplaceCheckup,
      familyStructure,
      mindset,
    });

    const user: UserProfile = {
      id: crypto.randomUUID(),
      age: ageNum,
      gender: gender as Gender,
      occupation: (occupation || "other") as OccupationType,
      familyStructure: (familyStructure || "other") as FamilyStructure,
      healthAwarenessScore: healthAwareness as 1 | 2 | 3 | 4 | 5,
      hasWorkplaceCheckup,
      lastScreeningYear: lastScreeningYear ? parseInt(lastScreeningYear) : undefined,
      barriers,
      notificationGroup,
      messageFrame,
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
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step
                  ? "bg-emerald-600 text-white"
                  : i === step
                  ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400"
                  : "bg-slate-100 text-slate-400"
              }`}>
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
              この情報は、どのような背景を持つ方に検診が届きにくいかを分析し、門真市の施策改善に使います。個人の特定には使いません。
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
              <label className="text-sm font-medium text-slate-700">職場でがん検診を受けられますか？</label>
              <p className="text-xs text-slate-400">※ 市の検診との重複確認・政策分析に使います</p>
              <div className="flex gap-2">
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => setHasWorkplaceCheckup(v)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      hasWorkplaceCheckup === v
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {v ? "はい（受けられる）" : "ない・わからない"}
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

      {/* Step 2: 今の気持ち */}
      {step === 2 && (
        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-6">
            {/* 最後の受診年（任意） */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                最後にがん検診を受けた年
                <span className="ml-1 text-xs font-normal text-slate-400">（わかる場合）</span>
              </label>
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
                <span className="text-sm text-slate-500">年</span>
              </div>
            </div>

            {/* マインドセット質問（間接的・低負荷） */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  検診について、今のあなたに一番近いのは？
                </p>
                <p className="text-xs text-slate-400 mt-0.5">ひとつだけ選んでください（答えにくければ飛ばせます）</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {MINDSET_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setMindset(prev => prev === opt.id ? null : opt.id)}
                    className={`flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-left transition-all ${
                      mindset === opt.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className={`text-xs font-medium leading-snug ${
                      mindset === opt.id ? "text-emerald-700" : "text-slate-700"
                    }`}>{opt.label}</span>
                    <span className="text-xs text-slate-400">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← 戻る</Button>
              <Button
                onClick={handleStart}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
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
