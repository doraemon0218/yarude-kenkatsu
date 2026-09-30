"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PrivateOption {
  summary: string;
  cost: string;
  howTo: string;
  links: { label: string; url: string; note?: string }[];
}

interface GuidelineRow {
  cancer: string;
  cancerEn: string;
  japan: {
    startAge: string;
    method: string;
    interval: string;
    body: string;
    url: string;
  };
  uspstf: {
    startAge: string;
    method: string;
    interval: string;
    grade: string;
    url: string;
    note?: string;
  };
  who?: {
    startAge: string;
    method: string;
    interval: string;
    url: string;
  };
  gap: string;
  gapLevel: "aligned" | "minor" | "significant";
  clinicalNote: string;
  privateOption?: PrivateOption;
}

const GUIDELINES: GuidelineRow[] = [
  {
    cancer: "大腸がん",
    cancerEn: "Colorectal Cancer",
    japan: {
      startAge: "40歳〜",
      method: "便潜血検査（FOBT）",
      interval: "毎年",
      body: "厚生労働省指針（2023）",
      url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/gan/index.html",
    },
    uspstf: {
      startAge: "45歳〜",
      method: "大腸内視鏡 / FOBT / CT colonography",
      interval: "検査法により異なる（1〜10年）",
      grade: "Grade A（45–75歳）",
      url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening",
      note: "内視鏡が最高精度",
    },
    who: {
      startAge: "45歳〜",
      method: "FOBT / 大腸内視鏡",
      interval: "毎年（FOBT）/ 10年（内視鏡）",
      url: "https://www.who.int/news-room/fact-sheets/detail/colorectal-cancer",
    },
    gap: "開始年齢：日本40歳 vs 世界45歳（日本が5年早い）。検査法：日本はFOBT主体、米国は内視鏡が標準。",
    gapLevel: "minor",
    clinicalNote:
      "日本で40〜44歳に拡大した根拠は限定的。USPSTF/WHO準拠なら45歳開始。ただし日本の大腸がん若年罹患率を考慮した国内調整。",
  },
  {
    cancer: "肺がん",
    cancerEn: "Lung Cancer",
    japan: {
      startAge: "40歳〜",
      method: "胸部X線（CXR）＋必要に応じ喀痰細胞診",
      interval: "毎年",
      body: "厚生労働省指針（2023）",
      url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/gan/index.html",
    },
    uspstf: {
      startAge: "50歳〜・喫煙歴あり（20 pack-year以上）",
      method: "低線量CT（LDCT）",
      interval: "毎年",
      grade: "Grade B",
      url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening",
      note: "X線はスクリーニングとして推奨しない",
    },
    who: {
      startAge: "50歳〜・高リスク者",
      method: "低線量CT（LDCT）",
      interval: "毎年",
      url: "https://www.who.int/news-room/fact-sheets/detail/lung-cancer",
    },
    gap: "【重要な乖離】検査法：日本はX線、世界標準はLDCT（低線量CT）。X線では早期肺がんの検出感度が低い。対象：日本は40歳全員、米国は50歳以上の喫煙者のみ。",
    gapLevel: "significant",
    clinicalNote:
      "エビデンスに基づけば、喫煙歴のある50歳以上にはLDCTが推奨される。日本の胸部X線は検出率が低く偽陰性が課題。費用対効果でX線を維持しているが、高リスク者へのLDCT導入が望ましい。",
    privateOption: {
      summary: "喫煙歴がある50歳以上の方には、低線量CT（LDCT）による肺がん検診が世界標準です。行政の集団検診（X線）に加え、自費でLDCTを受けることで感度が大幅に上がります。",
      cost: "約10,000〜30,000円（自費・施設により異なる）",
      howTo: "人間ドック・健診センターのオプション検査として受診可能。「低線量CT」「胸部LDCT」で施設を検索してください。大阪府内の主要病院・放射線科でも対応しています。",
      links: [
        {
          label: "人間ドックの匠 — 低線量CT検索",
          url: "https://www.ningen-dock.jp/",
          note: "「低線量CT」「LDCT」で施設を絞り込み",
        },
        {
          label: "大阪府 がん検診情報（府独自事業）",
          url: "https://www.pref.osaka.lg.jp/hokentiku/cancer/index.html",
          note: "大阪府内の受診可能施設リスト参考",
        },
        {
          label: "国立がん研究センター — 肺がんスクリーニング解説",
          url: "https://ganjoho.jp/public/cancer/lung/screening.html",
          note: "LDCTの根拠・対象者の目安",
        },
      ],
    },
  },
  {
    cancer: "胃がん",
    cancerEn: "Gastric Cancer",
    japan: {
      startAge: "50歳〜（X線なら40歳〜）",
      method: "胃内視鏡 / 胃X線",
      interval: "2年に1回（内視鏡）",
      body: "厚生労働省指針（2023）",
      url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/gan/index.html",
    },
    uspstf: {
      startAge: "推奨なし",
      method: "推奨なし",
      interval: "—",
      grade: "推奨なし（証拠不十分）",
      url: "https://www.uspreventiveservicestaskforce.org/uspstf/topic_search_results",
      note: "米国・欧州では罹患率低く一般集団には非推奨",
    },
    gap: "日本・韓国・中国・東アジアのみ推奨。ピロリ菌感染率・胃がん罹患率が日本は世界トップ水準のため、国内独自の推奨。欧米では証拠不十分として非推奨。",
    gapLevel: "minor",
    clinicalNote:
      "日本の胃がん罹患率は人口10万人あたり約51人（世界2位）。ピロリ菌除菌後もリスク残存のため継続検診が重要。東アジア人特有のエビデンスに基づく合理的な推奨。",
  },
  {
    cancer: "乳がん",
    cancerEn: "Breast Cancer",
    japan: {
      startAge: "40歳〜女性",
      method: "マンモグラフィ",
      interval: "2年に1回",
      body: "厚生労働省指針（2023）",
      url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/gan/index.html",
    },
    uspstf: {
      startAge: "40歳〜女性",
      method: "マンモグラフィ",
      interval: "2年に1回",
      grade: "Grade B（2024改訂）",
      url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening",
      note: "2024年改訂で50歳開始→40歳開始に引き下げ",
    },
    who: {
      startAge: "40歳〜女性",
      method: "マンモグラフィ",
      interval: "2年に1回",
      url: "https://www.who.int/news-room/fact-sheets/detail/breast-cancer",
    },
    gap: "2024年USPSTF改訂後、日本・米国・WHOがほぼ一致。2024年以前の旧USPSTF（50歳開始）との乖離は解消。",
    gapLevel: "aligned",
    clinicalNote:
      "2024年のUSPSTF改訂（40歳→50歳を40歳に引き下げ）により日米基準が事実上統一。日本はいち早く40歳対象を採用しており、正当性が国際的にも確認された形。",
  },
  {
    cancer: "子宮頸がん",
    cancerEn: "Cervical Cancer",
    japan: {
      startAge: "20歳〜女性",
      method: "細胞診（頸部細胞診）",
      interval: "2年に1回",
      body: "厚生労働省指針（2023）",
      url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/gan/index.html",
    },
    uspstf: {
      startAge: "21歳〜女性",
      method: "細胞診（21〜29歳・3年毎）/ HPV検査単独または共同（30〜65歳・5年毎）",
      interval: "3〜5年",
      grade: "Grade A",
      url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/cervical-cancer-screening",
      note: "HPV検査単独法が世界標準に移行中",
    },
    who: {
      startAge: "30歳〜",
      method: "HPV検査",
      interval: "5〜10年",
      url: "https://www.who.int/news-room/fact-sheets/detail/cervical-cancer",
    },
    gap: "【重要な乖離】検査法：日本は細胞診主体、世界標準はHPV検査（感度が高い）。間隔：日本2年毎 vs 米国3〜5年・WHO 5〜10年。WHO・USPSTFはHPV検査への移行を推奨。",
    gapLevel: "significant",
    clinicalNote:
      "HPV検査は細胞診より感度が高く、陰性の場合は長期間再検不要。日本も2023年指針改訂で30〜60歳へのHPV検査単独法が選択肢に追加。費用と体制の整備が課題。",
    privateOption: {
      summary: "HPV検査（世界標準）は細胞診より感度が高く、30歳以上の女性に特に有効です。日本の行政検診（細胞診）に加え、または代わりに、自費でHPV検査を受けることができます。",
      cost: "HPV検査単独：約3,000〜8,000円 / 細胞診＋HPV（コテスト）：約5,000〜12,000円（施設により異なる）",
      howTo: "産婦人科・婦人科クリニックで「HPV検査」または「子宮頸がんHPV検査」として自費診療で受けられます。かかりつけ婦人科に相談してみてください。",
      links: [
        {
          label: "国立がん研究センター — 子宮頸がん検診解説",
          url: "https://ganjoho.jp/public/cancer/cervix_uteri/screening.html",
          note: "HPV検査の有効性・推奨根拠",
        },
        {
          label: "日本婦人科腫瘍学会 — 子宮頸がん情報",
          url: "https://www.jsgo.or.jp/public/cervix.html",
          note: "学会公式の患者向け情報",
        },
        {
          label: "みんなの子宮頸がん対策（国がん）",
          url: "https://ganjoho.jp/public/cancer/cervix_uteri/index.html",
          note: "HPV検査・ワクチン両方の情報",
        },
      ],
    },
  },
];

const GAP_STYLES = {
  aligned: { bg: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700", label: "一致" },
  minor: { bg: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700", label: "軽微な差異" },
  significant: { bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700", label: "重要な乖離" },
};

export default function StandardsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const summary = {
    aligned: GUIDELINES.filter((g) => g.gapLevel === "aligned").length,
    minor: GUIDELINES.filter((g) => g.gapLevel === "minor").length,
    significant: GUIDELINES.filter((g) => g.gapLevel === "significant").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">日本 vs 世界標準の比較</h1>
        <p className="text-sm text-slate-500 mt-1">
          厚生労働省指針・USPSTF・WHO勧告の違いを可視化。根拠に基づいた受診判断に活用できます。
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{summary.aligned}</p>
          <p className="text-xs text-emerald-600 mt-0.5">国際基準と一致</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{summary.minor}</p>
          <p className="text-xs text-amber-600 mt-0.5">軽微な差異</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{summary.significant}</p>
          <p className="text-xs text-red-600 mt-0.5">重要な乖離あり</p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 flex flex-wrap gap-3">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>一致：日本と国際基準がほぼ同等</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>軽微：年齢・間隔に差があるが臨床的許容範囲内</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>乖離：検査法や対象が大きく異なる</span>
      </div>

      {/* Guidelines list */}
      <div className="space-y-3">
        {GUIDELINES.map((g) => {
          const style = GAP_STYLES[g.gapLevel];
          const isOpen = expanded === g.cancer;
          return (
            <Card key={g.cancer} className={`border ${style.bg} overflow-hidden`}>
              <CardContent className="p-0">
                <button
                  className="w-full text-left p-4"
                  onClick={() => setExpanded(isOpen ? null : g.cancer)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{g.cancer}</span>
                      <span className="text-xs text-slate-400">{g.cancerEn}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>
                    <span className="text-slate-400 text-sm flex-shrink-0">{isOpen ? "▲" : "▼"}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{g.gap}</p>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-4">
                    {/* Comparison table */}
                    <div className="space-y-2">
                      {/* Japan */}
                      <div className="bg-white rounded-xl border border-slate-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">🇯🇵</span>
                          <span className="text-sm font-medium text-slate-700">日本（厚生労働省）</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-slate-400">対象年齢</p>
                            <p className="font-medium text-slate-700">{g.japan.startAge}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">検査方法</p>
                            <p className="font-medium text-slate-700">{g.japan.method}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">間隔</p>
                            <p className="font-medium text-slate-700">{g.japan.interval}</p>
                          </div>
                        </div>
                        <a href={g.japan.url} target="_blank" rel="noopener noreferrer"
                          className="mt-2 flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                          🔗 {g.japan.body}
                        </a>
                      </div>

                      {/* USPSTF */}
                      <div className="bg-white rounded-xl border border-slate-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">🇺🇸</span>
                          <span className="text-sm font-medium text-slate-700">USPSTF（米国予防医学専門委員会）</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-slate-400">対象</p>
                            <p className="font-medium text-slate-700">{g.uspstf.startAge}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">検査方法</p>
                            <p className="font-medium text-slate-700">{g.uspstf.method}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">間隔</p>
                            <p className="font-medium text-slate-700">{g.uspstf.interval}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded px-1.5 py-0.5">
                            {g.uspstf.grade}
                          </span>
                          {g.uspstf.note && (
                            <span className="text-xs text-slate-500 italic">{g.uspstf.note}</span>
                          )}
                        </div>
                        <a href={g.uspstf.url} target="_blank" rel="noopener noreferrer"
                          className="mt-1.5 flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          🔗 USPSTF公式ガイドライン
                        </a>
                      </div>

                      {/* WHO */}
                      {g.who && (
                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">🌍</span>
                            <span className="text-sm font-medium text-slate-700">WHO（世界保健機関）</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-slate-400">対象年齢</p>
                              <p className="font-medium text-slate-700">{g.who.startAge}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">検査方法</p>
                              <p className="font-medium text-slate-700">{g.who.method}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">間隔</p>
                              <p className="font-medium text-slate-700">{g.who.interval}</p>
                            </div>
                          </div>
                          <a href={g.who.url} target="_blank" rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-1 text-xs text-purple-600 hover:underline">
                            🔗 WHO公式情報
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Clinical note */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <p className="text-xs font-medium text-slate-600 mb-1">🩺 臨床的考察</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{g.clinicalNote}</p>
                    </div>

                    {/* Private / self-pay world-standard option */}
                    {g.privateOption && (
                      <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold text-violet-800">🌍 世界標準で受けるには（行政支援外・自費）</p>
                        <p className="text-xs text-violet-700 leading-relaxed">{g.privateOption.summary}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg p-2 border border-violet-100">
                            <p className="text-xs text-slate-400">費用目安</p>
                            <p className="text-xs font-medium text-slate-700">{g.privateOption.cost}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-violet-100">
                            <p className="text-xs text-slate-400">受け方</p>
                            <p className="text-xs font-medium text-slate-700">{g.privateOption.howTo}</p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {g.privateOption.links.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-2 bg-white rounded-lg p-2 border border-violet-100 hover:border-violet-400 hover:bg-violet-50 transition-all group"
                            >
                              <span className="text-violet-500 mt-0.5 flex-shrink-0">🔗</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-700 group-hover:text-violet-700">{link.label}</p>
                                {link.note && <p className="text-xs text-slate-400">{link.note}</p>}
                              </div>
                            </a>
                          ))}
                        </div>
                        <p className="text-xs text-violet-500 italic">
                          ※ 行政のがん検診（助成あり）と組み合わせて受けることが最も費用対効果が高い場合があります。主治医や健診施設にご相談ください。
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kadoma city official links */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏛️</span>
          <h2 className="text-sm font-bold text-emerald-800">門真市 公式がん検診・予防接種情報</h2>
        </div>
        <div className="space-y-2">
          {[
            {
              label: "がん検診（集団検診）案内・予約",
              sub: "大腸300円・肺100円・胃800円・乳1,200〜1,500円・子宮頸500円",
              url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/2/4105.html",
              icon: "🔬",
            },
            {
              label: "特定健診（メタボ健診）・人間ドック助成",
              sub: "国民健康保険加入者向け",
              url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/hoken/21293.html",
              icon: "📋",
            },
            {
              label: "一般健康診査",
              sub: "後期高齢者医療制度加入者・生活保護受給者向け",
              url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/3/4108.html",
              icon: "🏥",
            },
            {
              label: "予防接種（子ども・成人・高齢者）",
              sub: "定期予防接種・HPVワクチン・インフルエンザ等",
              url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/7/index.html",
              icon: "💉",
            },
            {
              label: "HPVワクチン（子宮頸がん予防接種）",
              sub: "小6〜高1相当の女子。キャッチアップ接種情報含む",
              url: "https://www.city.kadoma.osaka.jp/soshiki/kodomo/kokacenter/boshihoken/kennkouhukushi/kenkou/yobousessyu/kodomo_yobo/1534.html",
              icon: "🌸",
            },
            {
              label: "成人・高齢者の予防接種",
              sub: "インフルエンザ・肺炎球菌・帯状疱疹ワクチン等",
              url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/7/seijin_korei_yobo/index.html",
              icon: "👴",
            },
          ].map((item) => (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 bg-white rounded-xl p-3 border border-emerald-100 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
              </div>
              <span className="text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0">→</span>
            </a>
          ))}
        </div>
        <div className="text-xs text-slate-500 bg-white rounded-lg p-2.5 border border-emerald-100">
          <p className="font-medium text-slate-600 mb-0.5">健康増進課（成人保健グループ）</p>
          <p>📞 <a href="tel:06-6904-6400" className="text-emerald-600 hover:underline">06-6904-6400</a>　平日 9:00〜17:30</p>
          <p className="text-slate-400 mt-0.5">〒571-0064 門真市御堂町14-1 保健福祉センター4階</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/screening">
          <Button variant="outline" className="w-full rounded-xl text-sm">← 自分の検診を確認</Button>
        </Link>
        <Link href="/facilities">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm">
            施設を探す →
          </Button>
        </Link>
      </div>
    </div>
  );
}
