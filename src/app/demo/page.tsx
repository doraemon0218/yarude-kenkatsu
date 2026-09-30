"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DEMO_USERS,
  DEMO_USER_META,
  DEMO_TRUSTED_BY_USER,
  DEMO_NOTIFICATION_LOGS,
  DEMO_TIMELINE,
} from "@/lib/demo-data";
import { saveUser, saveTrustedPeople, getNotificationLogs } from "@/lib/store";
import { getRecommendedScreenings } from "@/lib/screening-data";

function loadDemoUser(userId: string) {
  const user = DEMO_USERS.find((u) => u.id === userId)!;
  const trusted = DEMO_TRUSTED_BY_USER[userId];
  saveUser(user);
  saveTrustedPeople(trusted);
}

const TYPE_STYLES: Record<string, { bg: string; icon: string; label: string }> = {
  register: { bg: "bg-blue-50 border-blue-200", icon: "📱", label: "登録" },
  add: { bg: "bg-purple-50 border-purple-200", icon: "👥", label: "つながり" },
  notify: { bg: "bg-amber-50 border-amber-200", icon: "📨", label: "通知" },
  open: { bg: "bg-slate-50 border-slate-200", icon: "👀", label: "開封" },
  schedule: { bg: "bg-emerald-50 border-emerald-200", icon: "📅", label: "予定登録" },
  screened: { bg: "bg-green-50 border-green-200", icon: "✅", label: "受診完了" },
};

const ACTOR_META: Record<string, { name: string; color: string; emoji: string }> = {
  tanaka: { name: "田中さん", color: "text-blue-700", emoji: "👨‍💼" },
  sato: { name: "佐藤さん", color: "text-orange-600", emoji: "👨‍🔧" },
};

export default function DemoPage() {
  const router = useRouter();
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const handleSwitchUser = (userId: string) => {
    loadDemoUser(userId);
    setActiveUser(userId);
  };

  const handleGoToApp = () => {
    router.push("/screening");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
            テストシナリオ
          </Badge>
        </div>
        <h1 className="text-xl font-bold text-slate-800">2人の小規模事業主の物語</h1>
        <p className="text-sm text-slate-500 mt-1">
          企業健診がなく、忙しさで検診を後回しにしていた2人が、互いに声をかけ合うことで受診に至るストーリー
        </p>
      </div>

      {/* ONE-CLICK LOGIN — prominent at top */}
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 space-y-3">
        <p className="text-sm font-bold text-emerald-800 text-center">
          どちらかのアカウントでログイン
        </p>
        <div className="grid grid-cols-2 gap-3">
          {DEMO_USER_META.map((meta) => (
            <button
              key={meta.id}
              onClick={() => { loadDemoUser(meta.id); router.push("/screening"); }}
              className={`flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl border-2 font-medium text-sm transition-all
                ${activeUser === meta.id
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-md scale-105"
                  : "border-emerald-300 bg-white text-slate-700 hover:border-emerald-500 hover:bg-emerald-50"
                }`}
            >
              <span className="text-3xl">{meta.emoji}</span>
              <span className="font-bold">{meta.name}</span>
              <span className="text-xs opacity-75">{meta.desc}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                activeUser === meta.id
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                {activeUser === meta.id ? "✓ ログイン中" : "ワンクリックでログイン"}
              </span>
            </button>
          ))}
        </div>
        {activeUser && (
          <p className="text-xs text-emerald-700 text-center">
            ↑ ログイン後、上のナビから「検診」「信頼する人」「管理」を閲覧できます
          </p>
        )}
      </div>

      {/* Two users */}
      <div className="grid grid-cols-2 gap-3">
        {DEMO_USER_META.map((meta) => {
          const user = DEMO_USERS.find((u) => u.id === meta.id)!;
          const screenings = getRecommendedScreenings(user.age, user.gender);
          const trusted = DEMO_TRUSTED_BY_USER[meta.id];
          const isActive = activeUser === meta.id;

          return (
            <Card
              key={meta.id}
              className={`border-2 transition-all cursor-pointer ${
                isActive
                  ? meta.color === "blue"
                    ? "border-blue-400 bg-blue-50"
                    : "border-orange-400 bg-orange-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => handleSwitchUser(meta.id)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="text-3xl text-center">{meta.emoji}</div>
                <div className="text-center">
                  <p className="font-bold text-slate-800">{meta.name}</p>
                  <p className="text-xs text-slate-500">{meta.desc}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">健康関心</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div
                          key={n}
                          className={`w-3 h-3 rounded-full ${
                            n <= user.healthAwarenessScore
                              ? "bg-emerald-500"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{user.healthAwarenessScore}/5</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    受けるべき検診：{screenings.length}種類
                  </p>
                  <p className="text-xs text-slate-500">
                    信頼する人：{trusted.map((t) => t.name).join("、")}
                  </p>
                </div>
                <p className="text-xs text-slate-400 italic leading-snug">{meta.note}</p>
                {isActive && (
                  <div className={`text-xs text-center py-1 rounded-lg font-medium ${
                    meta.color === "blue" ? "bg-blue-200 text-blue-800" : "bg-orange-200 text-orange-800"
                  }`}>
                    ✓ この視点で閲覧中
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mutual relationship */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-emerald-800 mb-2">互いの関係性</h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">👨‍💼 田中さん</p>
              <p className="text-xs text-slate-500">「仕事仲間」として登録</p>
            </div>
            <div className="flex-1 text-center px-2">
              <div className="text-lg">⟺</div>
              <p className="text-xs text-emerald-700 font-medium">双方向</p>
              <p className="text-xs text-slate-500">リマインド</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">👨‍🔧 佐藤さん</p>
              <p className="text-xs text-slate-500">「先輩」として登録</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shared barriers */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">2人が抱える共通の障壁</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { barrier: "仕事が忙しい", both: true },
              { barrier: "症状がない（田中）", both: false },
              { barrier: "費用が心配（佐藤）", both: false },
              { barrier: "毎年忘れてしまう", both: true },
              { barrier: "企業健診がない", both: true },
            ].map((item) => (
              <div
                key={item.barrier}
                className={`flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg ${
                  item.both
                    ? "bg-red-50 text-red-700 border border-red-100"
                    : "bg-slate-50 text-slate-600 border border-slate-100"
                }`}
              >
                <span>{item.both ? "🔴" : "🔸"}</span>
                {item.barrier}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">🔴 = 2人に共通する障壁</p>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">受診までのストーリー</h2>
        <div className="space-y-2">
          {DEMO_TIMELINE.map((step, i) => {
            const style = TYPE_STYLES[step.type];
            const actor = ACTOR_META[step.actor];
            const isActive = activeStep === i;

            return (
              <div
                key={i}
                className={`border rounded-xl p-3 cursor-pointer transition-all ${style.bg} ${
                  isActive ? "ring-2 ring-emerald-400" : ""
                }`}
                onClick={() => setActiveStep(isActive ? null : i)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-base shadow-sm">
                    {style.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400">{step.date}</span>
                      <span className={`text-sm font-medium ${actor.color}`}>
                        {actor.emoji} {actor.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {style.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{step.action}</p>
                    {isActive && (
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{step.detail}</p>
                    )}
                  </div>
                  <span className="text-slate-400 text-xs flex-shrink-0">
                    {isActive ? "▲" : "▼"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outcome */}
      <Card className="border-emerald-300 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="p-5 text-center space-y-2">
          <div className="text-4xl">🎉</div>
          <h3 className="font-bold text-emerald-800">2人とも受診完了</h3>
          <p className="text-sm text-slate-600">
            互いの声かけが、4年ぶり・初めてのがん検診につながりました。
          </p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-xs text-slate-500">田中さん</p>
              <p className="text-sm font-medium text-slate-700">4年ぶりの受診</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-xs text-slate-500">佐藤さん</p>
              <p className="text-sm font-medium text-slate-700">人生初の受診</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom login repeat */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <p className="text-xs text-slate-500 text-center font-medium">↑ ページ上部のログインボタンからアプリを体験できます</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_USER_META.map((meta) => (
            <button
              key={meta.id}
              onClick={() => { loadDemoUser(meta.id); router.push("/screening"); }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all"
            >
              {meta.emoji} {meta.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
