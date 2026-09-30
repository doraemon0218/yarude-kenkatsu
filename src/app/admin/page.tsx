"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFunnelStats, getNotificationLogs, getTrustedPeople, getUser } from "@/lib/store";
import type { FunnelStats } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

const GROUP_LABELS: Record<string, string> = {
  self_only: "本人のみ通知",
  self_and_family: "本人＋家族",
  community: "コミュニティ",
};

const STAGE_LABELS = [
  { key: "sent", label: "通知送信", color: "#94a3b8" },
  { key: "opened", label: "開封・確認", color: "#34d399" },
  { key: "scheduled", label: "予定登録", color: "#059669" },
  { key: "screened", label: "受診完了", color: "#065f46" },
];

function calcRate(num: number, denom: number) {
  if (denom === 0) return 0;
  return Math.round((num / denom) * 100);
}

// Mock data for demonstration
const MOCK_FUNNEL: FunnelStats[] = [
  { group: "self_only", sent: 120, opened: 68, scheduled: 32, screened: 18 },
  { group: "self_and_family", sent: 118, opened: 89, scheduled: 61, screened: 42 },
  { group: "community", sent: 45, opened: 31, scheduled: 22, screened: 15 },
];

const MOCK_TIMELINE = [
  { month: "4月", self_only: 5, self_and_family: 12, community: 4 },
  { month: "5月", self_only: 8, self_and_family: 18, community: 6 },
  { month: "6月", self_only: 6, self_and_family: 22, community: 8 },
  { month: "7月", self_only: 10, self_and_family: 28, community: 10 },
  { month: "8月", self_only: 9, self_and_family: 25, community: 9 },
  { month: "9月", self_only: 11, self_and_family: 35, community: 12 },
];

const BARRIER_BREAKDOWN = [
  { barrier: "多忙", screened: 22, not_screened: 78 },
  { barrier: "無症状", screened: 35, not_screened: 65 },
  { barrier: "怖い", screened: 18, not_screened: 82 },
  { barrier: "費用", screened: 40, not_screened: 60 },
  { barrier: "情報なし", screened: 55, not_screened: 45 },
];

export default function AdminPage() {
  const [stats, setStats] = useState<FunnelStats[]>(MOCK_FUNNEL);
  const [activeTab, setActiveTab] = useState<"funnel" | "timeline" | "barriers" | "rct">("funnel");

  useEffect(() => {
    const real = getFunnelStats();
    const hasData = real.some((s) => s.sent > 0);
    if (hasData) setStats(real);
  }, []);

  const funnelChartData = STAGE_LABELS.map((stage) => ({
    stage: stage.label,
    ...Object.fromEntries(
      stats.map((s) => [GROUP_LABELS[s.group], s[stage.key as keyof FunnelStats] as number])
    ),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">管理・分析ダッシュボード</h1>
          <p className="text-sm text-slate-500 mt-0.5">サービスの有効性と通知方法の最適化を追跡</p>
        </div>
        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
          デモデータ
        </Badge>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "累計通知数", value: "283", unit: "件", change: "+12% 先月比" },
          { label: "受診完了率（本人+家族）", value: "36%", unit: "", change: "+18pt vs 本人のみ" },
          { label: "最も効果的なタイミング", value: "2週間前", unit: "", change: "締切リマインド" },
          { label: "背景因子TOP障壁", value: "多忙", unit: "", change: "78%が未受診" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-slate-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-500">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-800">{kpi.value}<span className="text-sm font-normal text-slate-500">{kpi.unit}</span></p>
              <p className="text-xs text-emerald-600 mt-0.5">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {[
          { key: "funnel", label: "ファネル" },
          { key: "timeline", label: "時系列" },
          { key: "barriers", label: "背景因子" },
          { key: "rct", label: "RCT設計" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Funnel tab */}
      {activeTab === "funnel" && (
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">通知グループ別ファネル</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={funnelChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey={GROUP_LABELS.self_only} fill="#94a3b8" radius={[2, 2, 0, 0]} />
                  <Bar dataKey={GROUP_LABELS.self_and_family} fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey={GROUP_LABELS.community} fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {stats.map((s) => (
              <Card key={s.group} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-700">{GROUP_LABELS[s.group]}</h3>
                    <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200 bg-emerald-50">
                      受診率 {calcRate(s.screened, s.sent)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {STAGE_LABELS.map((stage) => (
                      <div key={stage.key} className="text-center">
                        <div className="text-lg font-bold" style={{ color: stage.color }}>
                          {s[stage.key as keyof FunnelStats]}
                        </div>
                        <div className="text-xs text-slate-400">{stage.label}</div>
                        {stage.key !== "sent" && (
                          <div className="text-xs text-slate-400">
                            ({calcRate(s[stage.key as keyof FunnelStats] as number, s.sent)}%)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Timeline tab */}
      {activeTab === "timeline" && (
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">月別受診完了数（グループ別）</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={MOCK_TIMELINE} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="self_only" stroke="#94a3b8" name="本人のみ" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="self_and_family" stroke="#10b981" name="本人+家族" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="community" stroke="#3b82f6" name="コミュニティ" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 mt-2 text-center">
              「本人＋家族」グループは時間とともに効果が加速する傾向
            </p>
          </CardContent>
        </Card>
      )}

      {/* Barriers tab */}
      {activeTab === "barriers" && (
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">受診障壁別の受診率</h3>
              <p className="text-xs text-slate-500 mb-3">登録時に申告した障壁と実際の受診率の関係</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={BARRIER_BREAKDOWN}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
                  <YAxis type="category" dataKey="barrier" tick={{ fontSize: 11 }} width={40} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="screened" fill="#10b981" name="受診した" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="not_screened" fill="#e2e8f0" name="未受診" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-400 mt-2">「情報がない」層は介入すれば受診率が高い → 高ポテンシャル層</p>
            </CardContent>
          </Card>
          <Card className="border-amber-100 bg-amber-50">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-amber-800 mb-2">政策インサイト</p>
              <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside">
                <li>「多忙」「症状なし」層は通知タイミング調整で改善可能</li>
                <li>「情報なし」層はシンプルな周知で受診率が跳ね上がる</li>
                <li>「怖い」層には受診後フォロー（陽性だった場合の支援情報）が必要</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* RCT Design tab */}
      {activeTab === "rct" && (
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-sm font-medium text-slate-700">RCT設計（世帯単位ランダム化比較）</h3>
              <div className="space-y-3">
                {[
                  {
                    group: "A群",
                    name: "本人のみ通知",
                    n: 120,
                    color: "bg-slate-100",
                    textColor: "text-slate-700",
                    desc: "従来型。本人への通知のみ。",
                  },
                  {
                    group: "B群",
                    name: "本人＋家族通知",
                    n: 118,
                    color: "bg-emerald-50",
                    textColor: "text-emerald-700",
                    desc: "本人に加え、登録された信頼する人にも通知。",
                  },
                  {
                    group: "C群",
                    name: "コミュニティ通知",
                    n: 45,
                    color: "bg-blue-50",
                    textColor: "text-blue-700",
                    desc: "職場・地域コミュニティ単位での一斉通知。",
                  },
                ].map((g) => (
                  <div key={g.group} className={`rounded-xl p-3 ${g.color}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${g.textColor}`}>{g.group}</span>
                        <span className="text-sm text-slate-700">{g.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">n={g.n}</span>
                    </div>
                    <p className="text-xs text-slate-500">{g.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-700">通知タイミング変数</h3>
              <div className="space-y-2">
                {[
                  { timing: "即時（申込開始）", rate: 28, label: "28%" },
                  { timing: "1ヶ月前", rate: 35, label: "35%" },
                  { timing: "2週間前", rate: 42, label: "42%" },
                  { timing: "当日朝", rate: 31, label: "31%" },
                ].map((t) => (
                  <div key={t.timing} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-24 flex-shrink-0">{t.timing}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${t.rate * 2}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-emerald-700 w-8">{t.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">受診率（仮想データ）。2週間前リマインドが最も効果的。</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-medium text-slate-700">測定する一次アウトカム</h3>
              <div className="space-y-1.5">
                {[
                  "市のがん検診受診記録との突合による受診率",
                  "通知開封率（メッセージアプリの既読確認）",
                  "予定カレンダー登録率",
                  "精密検査への移行率（がん早期発見率の代理指標）",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-xs text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-lg p-3 mt-2">
                <p className="text-xs text-slate-500">
                  個人情報は市の検診記録と匿名IDで突合。結果は次年度施策の根拠として活用します（EBPM）。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
