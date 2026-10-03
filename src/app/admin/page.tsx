"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFunnelStats } from "@/lib/store";
import type { FunnelStats } from "@/lib/types";
import { BARRIER_CATEGORY_META, MESSAGE_FRAME_LABELS } from "@/lib/screening-data";
import {
  BarChart,
  Bar,
  Cell,
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

// 障壁カテゴリ別モックデータ（登録ユーザーの回答集計）
const BARRIER_CATEGORY_DATA = [
  {
    category: "structural" as const,
    barriers: [
      { name: "仕事を休めない", pct: 44, n: 52 },
      { name: "職場に健診制度がない", pct: 38, n: 45 },
      { name: "交通・移動が不便", pct: 15, n: 18 },
    ],
  },
  {
    category: "habitual" as const,
    barriers: [
      { name: "仕事・育児が忙しい", pct: 56, n: 67 },
      { name: "症状がないから大丈夫", pct: 42, n: 50 },
      { name: "毎回忘れてしまう", pct: 35, n: 42 },
      { name: "緊急性を感じない", pct: 29, n: 35 },
    ],
  },
  {
    category: "informational" as const,
    barriers: [
      { name: "どこで受けられるか不明", pct: 32, n: 38 },
      { name: "申込方法がわからない", pct: 24, n: 29 },
      { name: "対象かどうかわからない", pct: 19, n: 23 },
    ],
  },
  {
    category: "economic" as const,
    barriers: [
      { name: "費用が心配", pct: 28, n: 33 },
      { name: "補助制度を知らなかった", pct: 22, n: 26 },
    ],
  },
  {
    category: "psychological" as const,
    barriers: [
      { name: "結果が怖い", pct: 31, n: 37 },
      { name: "陽性後の対応が不安", pct: 18, n: 21 },
      { name: "見つかっても仕方がない", pct: 8, n: 10 },
    ],
  },
  {
    category: "social" as const,
    barriers: [
      { name: "一緒に行く人がいない", pct: 21, n: 25 },
    ],
  },
];

// 2×2 factorial RCT モックデータ
const RCT_FACTORIAL = [
  { arm: "A1", target: "本人のみ", frame: "loss_frame" as const, n: 62, screened: 13, rate: 21 },
  { arm: "A2", target: "本人のみ", frame: "gain_frame" as const, n: 58, screened: 14, rate: 24 },
  { arm: "B1", target: "本人＋家族", frame: "loss_frame" as const, n: 61, screened: 20, rate: 33 },
  { arm: "B2", target: "本人＋家族", frame: "gain_frame" as const, n: 57, screened: 22, rate: 38 },
];

const RCT_CHART_DATA = RCT_FACTORIAL.map((a) => ({
  name: a.arm,
  受診率: a.rate,
  fill: a.target === "本人＋家族" ? "#10b981" : "#94a3b8",
}));

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
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">🏛️ 門真市 健康増進課 専用</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">行政職員ダッシュボード</h1>
          <p className="text-sm text-slate-500 mt-0.5">YARUDE健活の受診勧奨効果・RCT結果・政策立案データ</p>
        </div>
        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
          デモデータ
        </Badge>
      </div>

      {/* 行政向けアクション */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "がん検診予約ページ", url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/2/4105.html", icon: "🔬" },
          { label: "健康増進課 公式", url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/index.html", icon: "🏛️" },
        ].map((item) => (
          <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition-all">
            <span>{item.icon}</span>{item.label} →
          </a>
        ))}
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "累計通知数", value: "283", unit: "件", change: "+12% 先月比" },
          { label: "受診完了率（本人+家族）", value: "36%", unit: "", change: "+18pt vs 本人のみ" },
          { label: "最効果的RCTアーム", value: "B2", unit: "", change: "家族通知×利得強調型" },
          { label: "最多障壁", value: "構造的", unit: "", change: "自営業・休暇取得困難" },
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
          { key: "barriers", label: "障壁分析" },
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

      {/* Barriers tab — 構造分析 */}
      {activeTab === "barriers" && (
        <div className="space-y-4">
          {/* 門真市の構造的背景 */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-blue-800 mb-1">門真市の構造的背景</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                門真市は製造業・中小企業・自営業の比率が高く、企業健診から外れた市民が多い。
                職場健診カバー外の層が市のがん検診の主要ターゲットとなるが、
                この層は「休めない」「制度を知らない」という構造的障壁を複合的に抱えている。
              </p>
            </CardContent>
          </Card>

          {/* カテゴリ別障壁マップ */}
          {BARRIER_CATEGORY_DATA.map(({ category, barriers }) => {
            const meta = BARRIER_CATEGORY_META[category];
            return (
              <Card key={category} className={`border ${meta.borderColor}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.bgColor} ${meta.textColor}`}>
                        優先度 {meta.priority}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{meta.label}</span>
                    </div>
                  </div>

                  {/* 障壁リスト */}
                  <div className="space-y-1.5">
                    {barriers.map((b) => (
                      <div key={b.name} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-slate-600">{b.name}</span>
                            <span className="text-xs font-medium text-slate-500">{b.pct}%（n={b.n}）</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full">
                            <div
                              className="h-1.5 rounded-full"
                              style={{ width: `${b.pct}%`, backgroundColor: meta.color }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* インサイトと介入策 */}
                  <div className="border-t border-slate-100 pt-2 space-y-1">
                    <p className="text-xs text-slate-500">{meta.insight}</p>
                    <p className={`text-xs font-medium ${meta.textColor}`}>→ 介入策：{meta.intervention}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* 介入優先度サマリ */}
          <Card className="border-amber-100 bg-amber-50">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-amber-800 mb-2">政策優先度インサイト</p>
              <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside">
                <li>【優先1】土日・夜間検診枠の拡充で構造的障壁（休暇不可層）を直撃</li>
                <li>【優先2】このアプリによる情報提供・リマインドで習慣的障壁層に即効</li>
                <li>【優先3】費用補助の見える化（「大腸がん300円」等）で経済的障壁を解消</li>
                <li>【優先4】陽性後サポート体制の明示で心理的障壁を低減</li>
                <li>【コア】家族・友人への同行勧奨（B群）が社会的障壁への最有効介入</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* RCT tab — 2×2 factorial */}
      {activeTab === "rct" && (
        <div className="space-y-4">
          {/* 設計概要 */}
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-700">2×2 Factorial RCT設計</h3>
              <p className="text-xs text-slate-500">
                2つの介入変数を同時に検証する要因計画法。
                同一サンプル数でより多くの情報を取得できる。
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-600 mb-1">第1軸：通知対象</p>
                  <p className="text-xs text-slate-500">A: 本人のみ通知（対照）</p>
                  <p className="text-xs text-slate-500">B: 本人＋信頼する人に通知</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-600 mb-1">第2軸：メッセージフレーム</p>
                  <p className="text-xs text-slate-500">1: 損失回避型（「今受けないと…」）</p>
                  <p className="text-xs text-slate-500">2: 利得強調型（「受けることで…」）</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4アーム比較テーブル */}
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-700">4アーム 受診率比較</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-slate-500 font-medium">アーム</th>
                      <th className="text-left py-2 text-slate-500 font-medium">通知対象</th>
                      <th className="text-left py-2 text-slate-500 font-medium">メッセージ</th>
                      <th className="text-right py-2 text-slate-500 font-medium">n</th>
                      <th className="text-right py-2 text-slate-500 font-medium">受診率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RCT_FACTORIAL.map((arm) => {
                      const frameMeta = MESSAGE_FRAME_LABELS[arm.frame];
                      const isWinner = arm.arm === "B2";
                      return (
                        <tr key={arm.arm} className={`border-b border-slate-100 ${isWinner ? "bg-emerald-50" : ""}`}>
                          <td className="py-2.5 font-bold text-slate-700">
                            {arm.arm}
                            {isWinner && <span className="ml-1 text-emerald-600">★</span>}
                          </td>
                          <td className="py-2.5 text-slate-600">{arm.target}</td>
                          <td className="py-2.5 text-slate-600">{frameMeta.label}</td>
                          <td className="py-2.5 text-right text-slate-500">{arm.n}</td>
                          <td className="py-2.5 text-right font-bold text-emerald-700">{arm.rate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400">★ B2（本人＋家族 × 利得強調）が最高受診率（仮想データ）</p>
            </CardContent>
          </Card>

          {/* 棒グラフ */}
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">アーム別受診率</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={RCT_CHART_DATA} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 50]} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="受診率" radius={[4, 4, 0, 0]}>
                    {RCT_CHART_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* メッセージフレーム詳細 */}
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-700">メッセージフレーム（今後の拡張アーム）</h3>
              <div className="space-y-2">
                {(Object.entries(MESSAGE_FRAME_LABELS) as [keyof typeof MESSAGE_FRAME_LABELS, typeof MESSAGE_FRAME_LABELS[keyof typeof MESSAGE_FRAME_LABELS]][]).map(
                  ([key, val]) => (
                    <div key={key} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700">{val.label}</span>
                        <span className="text-xs text-slate-400">— {val.desc}</span>
                      </div>
                      <p className="text-xs text-slate-500 italic">「{val.example}」</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* 一次アウトカム */}
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-medium text-slate-700">測定する一次アウトカム</h3>
              <div className="space-y-1.5">
                {[
                  "市のがん検診受診記録との突合による受診率（主要エンドポイント）",
                  "通知開封率（メッセージアプリの既読確認）",
                  "予定カレンダー登録率",
                  "精密検査への移行率（早期発見率の代理指標）",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-xs text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-lg p-3 mt-2">
                <p className="text-xs text-slate-500">
                  個人情報は市の検診記録と匿名IDで突合。必要サンプルサイズ：α=0.05、検出力80%で各アーム約60名（合計240名）。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 通知タイミング変数 */}
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-700">通知タイミング（層別変数）</h3>
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
              <p className="text-xs text-slate-400">2週間前リマインドが最も効果的（仮想データ）。今後の層別解析変数として記録。</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
