"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SupportStatus = "available" | "partial" | "unavailable";

interface HealthFactor {
  id: string;
  name: string;
  targetAge: string;
  importance: string;
  kadoma: {
    status: SupportStatus;
    detail: string;
    url?: string;
  };
  selfPay?: string;
  evidenceNote: string;
}

interface HealthCategory {
  id: string;
  label: string;
  icon: string;
  lifeImpact: string;
  factors: HealthFactor[];
}

const CATEGORIES: HealthCategory[] = [
  {
    id: "metabolic",
    label: "生活習慣病",
    icon: "🩺",
    lifeImpact: "糖尿病・高血圧・脂質異常症は無症状で進行し、心疾患・脳卒中・腎不全の主因。健康寿命への影響は最大級。",
    factors: [
      {
        id: "specific-checkup",
        name: "特定健診（メタボ健診）",
        targetAge: "40〜74歳",
        importance: "血圧・血糖・脂質・腹囲を一度に確認。生活習慣病の早期発見に最も効率的。",
        kadoma: {
          status: "available",
          detail: "国民健康保険加入者は門真市の特定健診（無料・年1回）を受けられます。",
          url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/hoken/21293.html",
        },
        evidenceNote: "特定健診・特定保健指導は国が義務づけた制度（高齢者医療確保法）。",
      },
      {
        id: "hepatitis",
        name: "B型・C型肝炎ウイルス検査",
        targetAge: "40歳以上（生涯1回）",
        importance: "慢性肝炎→肝硬変→肝がんへの進行を防ぐ。自覚症状なく進行する。",
        kadoma: {
          status: "available",
          detail: "門真市の集団検診に肝炎ウイルス検診が含まれます（無料・40歳以上で未受診の方）。",
          url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/2/4105.html",
        },
        evidenceNote: "厚生労働省が無料クーポン配布を実施。生涯1回受ければ十分。",
      },
    ],
  },
  {
    id: "vaccine",
    label: "ワクチンで予防できる疾患",
    icon: "💉",
    lifeImpact: "感染症による入院・後遺症・死亡を予防。特に50〜60代以降の重症化リスクを大幅に下げる。",
    factors: [
      {
        id: "pneumococcal",
        name: "肺炎球菌ワクチン",
        targetAge: "65歳（5年ごと任意）",
        importance: "肺炎は高齢者の死亡原因の上位。重症化・入院を予防。",
        kadoma: {
          status: "available",
          detail: "65歳の定期接種は助成あり（自己負担あり）。門真市で受けられます。",
          url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/7/seijin_korei_yobo/index.html",
        },
        evidenceNote: "USPSTF Grade B（65歳以上）。国内も65歳定期接種として制度化。",
      },
      {
        id: "shingles",
        name: "帯状疱疹ワクチン",
        targetAge: "50歳以上",
        importance: "帯状疱疹後神経痛は長期の激しい痛みを引き起こし、QOLを著しく低下させる。",
        kadoma: {
          status: "available",
          detail: "門真市の成人・高齢者向け予防接種案内に含まれます（助成額は要確認）。",
          url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/7/seijin_korei_yobo/index.html",
        },
        evidenceNote: "組換え帯状疱疹ワクチン（シングリックス）は予防効果約97%（50歳以上）。",
      },
      {
        id: "hpv-vaccine",
        name: "HPVワクチン（子宮頸がん予防）",
        targetAge: "小6〜高1相当の女子（キャッチアップは27歳まで）",
        importance: "子宮頸がんの原因ウイルス（HPV）への感染を予防。接種率が低いと将来の罹患率に直結。",
        kadoma: {
          status: "available",
          detail: "定期接種（無料）＋キャッチアップ接種（〜2025年3月）。門真市で対応。",
          url: "https://www.city.kadoma.osaka.jp/soshiki/kodomo/kokacenter/boshihoken/kennkouhukushi/kenkou/yobousessyu/kodomo_yobo/1534.html",
        },
        evidenceNote: "WHO IARC：HPVワクチンは子宮頸がん死亡を最大90%削減。",
      },
    ],
  },
  {
    id: "bone",
    label: "骨・運動機能",
    icon: "🦴",
    lifeImpact: "骨折・転倒が要介護の主因。骨密度低下は無症状で進行し、気づいたときには骨折リスクが高い状態になっている。",
    factors: [
      {
        id: "osteoporosis",
        name: "骨密度検査（骨粗鬆症スクリーニング）",
        targetAge: "50歳以上の女性（閉経後）、65歳以上の男性",
        importance: "骨粗鬆症による大腿骨骨折は要介護・死亡リスクを大きく高める。",
        kadoma: {
          status: "partial",
          detail: "一部の健診イベントで骨密度測定を実施することがありますが、定期的な助成検診としては体系的に提供されていません。",
        },
        selfPay: "整形外科・内科クリニックで自費（約1,000〜3,000円）。DEXA法での精密測定は大きな病院で可能。",
        evidenceNote: "USPSTF Grade B（65歳以上の女性、リスクのある65歳未満の閉経後女性）。",
      },
      {
        id: "locomotive",
        name: "ロコモティブシンドローム評価",
        targetAge: "40歳以上",
        importance: "筋力・バランス・関節機能の低下を早期把握。介護予防の第一歩。",
        kadoma: {
          status: "unavailable",
          detail: "現在、門真市の定期健診・集団検診にはロコモ評価（立ち上がりテスト・2ステップテスト等）は含まれていません。",
        },
        selfPay: "整形外科・かかりつけ医に相談。「ロコモ25」は自己チェックシートとして無料で使用可能（日本整形外科学会サイト）。",
        evidenceNote: "日本整形外科学会が提唱。ロコモ度3では要介護リスクが大幅上昇。",
      },
    ],
  },
  {
    id: "brain",
    label: "脳・認知機能",
    icon: "🧠",
    lifeImpact: "認知症は要介護の最大原因。軽度認知障害（MCI）の段階で介入すると進行を遅らせられる可能性がある。",
    factors: [
      {
        id: "dementia-screen",
        name: "認知症スクリーニング",
        targetAge: "75歳以上",
        importance: "早期発見で生活環境の整備・進行抑制介入が可能になる。",
        kadoma: {
          status: "partial",
          detail: "後期高齢者医療健診（75歳以上）の問診票に認知機能に関する項目が含まれますが、専門的なスクリーニング検査は含まれません。",
          url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/3/4108.html",
        },
        selfPay: "かかりつけ医に相談。MMSEやMoCA等の認知機能検査を実施してもらえます。",
        evidenceNote: "USPSTFは無症状の一般集団への認知症スクリーニングは現時点で推奨・非推奨ともに結論なし（証拠不十分）。",
      },
      {
        id: "mci",
        name: "軽度認知障害（MCI）スクリーニング",
        targetAge: "60歳以上",
        importance: "MCIの段階では生活習慣改善・運動介入で認知症への進行を抑制できる可能性がある。",
        kadoma: {
          status: "unavailable",
          detail: "現在、門真市に軽度認知障害（MCI）を対象とした体系的なスクリーニング事業はありません。",
        },
        selfPay: "脳神経内科・精神科・物忘れ外来で相談。一部クリニックで自費の認知機能検査（約3,000〜10,000円）。",
        evidenceNote: "国際的にもMCIスクリーニングの標準的プロトコルは確立途上。WHO推奨（2019）は危険因子管理（高血圧・糖尿病・運動不足）による予防を重視。",
      },
    ],
  },
  {
    id: "dental",
    label: "口腔・歯科",
    icon: "🦷",
    lifeImpact: "歯周病は糖尿病・心疾患・誤嚥性肺炎と関連。咀嚼能力の維持は栄養状態・認知機能にも影響する。",
    factors: [
      {
        id: "dental-checkup",
        name: "成人歯科健診",
        targetAge: "30・40・50・60・70歳の節目",
        importance: "歯周病・口腔がんの早期発見。咀嚼機能・口腔機能の評価。",
        kadoma: {
          status: "available",
          detail: "節目年齢（30・40・50・60・70歳）の方を対象に歯科健診（無料）を実施しています。",
          url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/index.html",
        },
        evidenceNote: "厚生労働省「8020運動」。80歳で20本の歯を保つことが健康寿命と関連。",
      },
    ],
  },
  {
    id: "mental",
    label: "メンタルヘルス",
    icon: "💭",
    lifeImpact: "うつ病は生産年齢人口の健康寿命を大きく損なう。早期発見・介入で就労継続・QOL維持に効果がある。",
    factors: [
      {
        id: "depression-screen",
        name: "うつ病スクリーニング",
        targetAge: "成人全般",
        importance: "USPSTF Grade B（成人への定期的なうつ病スクリーニング）。早期介入で回復率が高い。",
        kadoma: {
          status: "partial",
          detail: "特定健診の生活習慣調査票に精神的健康に関する質問が含まれる場合がありますが、専用のうつ病スクリーニング（PHQ-9等）は実施されていません。",
        },
        selfPay: "かかりつけ医・精神科・心療内科でPHQ-9等を使ったスクリーニングが受けられます。",
        evidenceNote: "USPSTF Grade B（2023）。PHQ-9は信頼性の高いスクリーニングツール。",
      },
      {
        id: "stress-check",
        name: "ストレスチェック（職場外）",
        targetAge: "労働者全般",
        importance: "過労・燃え尽きの早期把握。特に自営業者は職場の義務ストレスチェックを受けられない。",
        kadoma: {
          status: "unavailable",
          detail: "ストレスチェック制度は50人以上の事業所に義務づけられており、自営業者や小規模事業所の従業員は対象外です。現在、門真市に個人向けの公的ストレスチェック事業はありません。",
        },
        selfPay: "「こころの耳」（厚生労働省・無料）でオンライン自己チェック可能。産業医のいないフリーランス向けの相談窓口も活用を。",
        evidenceNote: "産業ストレス簡易調査票（57項目）は無料で自己採点可能。",
      },
    ],
  },
  {
    id: "cardiovascular",
    label: "心血管・血管",
    icon: "❤️",
    lifeImpact: "動脈硬化は無症状で進行し、心筋梗塞・脳卒中の直接原因になる。早期評価で生活習慣改善のタイミングを掴める。",
    factors: [
      {
        id: "ecg",
        name: "心電図（不整脈・虚血性心疾患）",
        targetAge: "40歳以上",
        importance: "心房細動は脳梗塞リスクを5倍にする。無症状の段階で発見できれば抗凝固療法で予防可能。",
        kadoma: {
          status: "partial",
          detail: "特定健診の「詳細な健診の項目」として医師が必要と判断した場合に心電図が追加されますが、全員への実施は含まれていません。",
        },
        selfPay: "人間ドック・かかりつけ内科で自費（約1,000〜3,000円）。Apple Watch等のウェアラブルでの心房細動検出も選択肢に。",
        evidenceNote: "USPSTFは無症状者への心電図スクリーニングの有益性は現時点で不明（Grade I）。ただし心房細動は脳梗塞の重大危険因子。",
      },
      {
        id: "carotid-echo",
        name: "頸動脈エコー（動脈硬化評価）",
        targetAge: "50歳以上・生活習慣病のある方",
        importance: "頸動脈の内膜中膜複合体厚（IMT）で動脈硬化を早期可視化。心筋梗塞・脳卒中リスク評価に有用。",
        kadoma: {
          status: "unavailable",
          detail: "現在、門真市の公的健診に頸動脈エコーは含まれていません。",
        },
        selfPay: "人間ドックのオプション（約3,000〜8,000円）。循環器内科・脳神経外科でも受けられます。",
        evidenceNote: "USPSTFはスクリーニング目的の頸動脈エコーを一般集団には推奨しない（Grade D）。ただし生活習慣病リスクが高い個人には有益な情報源になりうる。",
      },
    ],
  },
  {
    id: "sensory",
    label: "視力・聴力",
    icon: "👁️",
    lifeImpact: "視覚・聴覚の低下は転倒・認知機能低下・社会的孤立につながる。早期発見で補正・治療が可能。",
    factors: [
      {
        id: "glaucoma",
        name: "緑内障スクリーニング",
        targetAge: "40歳以上",
        importance: "緑内障は失明の主因。進行するまで自覚症状がなく、早期発見が重要。",
        kadoma: {
          status: "unavailable",
          detail: "現在、門真市の公的健診に緑内障スクリーニング（眼圧測定・眼底検査）は含まれていません。",
        },
        selfPay: "眼科クリニックで自費（約1,000〜3,000円）。人間ドックのオプションでも受けられます。",
        evidenceNote: "USPSTF：証拠不十分（Grade I）。ただし日本人は正常眼圧緑内障の割合が高く（約70%）、眼圧正常でも発症しうる。定期的な眼科受診が推奨される。",
      },
      {
        id: "hearing",
        name: "難聴スクリーニング",
        targetAge: "65歳以上",
        importance: "難聴は認知症の最大の修正可能危険因子（Lancet委員会・2020）。補聴器介入で認知機能低下を遅らせる可能性。",
        kadoma: {
          status: "unavailable",
          detail: "現在、門真市の公的健診に系統的な難聴スクリーニングは含まれていません。",
        },
        selfPay: "耳鼻咽喉科で聴力検査（自費・約1,000〜3,000円）。補聴器は医療費控除の対象（処方箋不要の場合もあり）。",
        evidenceNote: "Lancet Commissions 2020：難聴は認知症修正可能危険因子の第1位（寄与率8%）。",
      },
      {
        id: "cataract",
        name: "白内障・眼科スクリーニング",
        targetAge: "60歳以上",
        importance: "白内障は視力低下→転倒・骨折・QOL低下の連鎖につながる。手術で回復できるが未受診が多い。",
        kadoma: {
          status: "unavailable",
          detail: "現在、門真市の公的健診に白内障を含む眼科スクリーニングは含まれていません。",
        },
        selfPay: "眼科クリニックの定期検診（自費・約1,000〜3,000円）。白内障手術は保険適用で片目15,000〜50,000円程度。",
        evidenceNote: "WHO：白内障は世界の視覚障害の主因（約33%）。日本では手術成績が良好で、受診さえすれば視力回復が見込める。",
      },
    ],
  },
];

const STATUS_STYLE: Record<SupportStatus, { badge: string; label: string; icon: string }> = {
  available: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "受けられます", icon: "✓" },
  partial: { badge: "bg-amber-100 text-amber-700 border-amber-200", label: "一部対応", icon: "△" },
  unavailable: { badge: "bg-orange-50 text-orange-600 border-orange-200", label: "空白地帯", icon: "🏗️" },
};

export default function HealthFactorsPage() {
  const [openFactor, setOpenFactor] = useState<string | null>(null);

  const counts = {
    available: CATEGORIES.flatMap((c) => c.factors).filter((f) => f.kadoma.status === "available").length,
    partial: CATEGORIES.flatMap((c) => c.factors).filter((f) => f.kadoma.status === "partial").length,
    unavailable: CATEGORIES.flatMap((c) => c.factors).filter((f) => f.kadoma.status === "unavailable").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">健康寿命に関わる因子チェック</h1>
        <p className="text-sm text-slate-500 mt-1">
          がん検診以外にも、健康寿命に大きく影響する因子があります。
          門真市で受けられるもの・受けられないものを正直にお示しします。
        </p>
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{counts.available}</p>
          <p className="text-xs text-emerald-600 mt-0.5">受けられます</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{counts.partial}</p>
          <p className="text-xs text-amber-600 mt-0.5">一部対応</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-500">{counts.unavailable}</p>
          <p className="text-xs text-orange-500 mt-0.5">🏗️ 空白地帯</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
        <p className="font-medium mb-0.5">ℹ️ 「現在未対応」について</p>
        <p className="leading-relaxed">
          未対応の項目は、現時点で門真市の公的健診・助成の対象外であることを示しています。
          自費診療や近隣医療機関での受診が可能な場合は、その情報も記載しています。
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{cat.icon}</span>
              <h2 className="font-bold text-slate-700 text-sm">{cat.label}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-2 ml-1 leading-relaxed">{cat.lifeImpact}</p>
            <div className="space-y-2">
              {cat.factors.map((factor) => {
                const s = STATUS_STYLE[factor.kadoma.status];
                const isOpen = openFactor === factor.id;
                return (
                  <Card key={factor.id} className="border-slate-200 overflow-hidden">
                    <CardContent className="p-0">
                      <button
                        className="w-full text-left p-3"
                        onClick={() => setOpenFactor(isOpen ? null : factor.id)}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 flex-shrink-0 text-xs font-bold w-5 h-5 rounded-full border flex items-center justify-center ${s.badge}`}>
                            {s.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-800 text-sm">{factor.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.badge}`}>
                                {s.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{factor.targetAge}</p>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{factor.importance}</p>
                          </div>
                          <span className="text-slate-400 text-xs flex-shrink-0 mt-1">{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-100 px-3 pb-3 pt-2.5 space-y-2.5">
                          {/* Kadoma status detail */}
                          <div className={`rounded-xl p-3 border ${
                            factor.kadoma.status === "available"
                              ? "bg-emerald-50 border-emerald-200"
                              : factor.kadoma.status === "partial"
                              ? "bg-amber-50 border-amber-200"
                              : "bg-slate-50 border-slate-200"
                          }`}>
                            <p className="text-xs font-medium text-slate-700 mb-1">🏛️ 門真市の対応状況</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{factor.kadoma.detail}</p>
                            {factor.kadoma.url && (
                              <a
                                href={factor.kadoma.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1.5 inline-block text-xs text-emerald-600 hover:underline"
                              >
                                🔗 門真市公式ページへ
                              </a>
                            )}
                          </div>

                          {/* Self-pay option */}
                          {factor.selfPay && (
                            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
                              <p className="text-xs font-medium text-violet-800 mb-1">💡 自費・近隣医療機関での受け方</p>
                              <p className="text-xs text-violet-700 leading-relaxed">{factor.selfPay}</p>
                            </div>
                          )}

                          {/* Evidence */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                            <p className="text-xs text-slate-500 leading-relaxed">
                              <span className="font-medium text-slate-600">📚 根拠：</span>{factor.evidenceNote}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      {/* Service gap map */}
      {(() => {
        const gaps = CATEGORIES.flatMap((cat) =>
          cat.factors
            .filter((f) => f.kadoma.status === "unavailable")
            .map((f) => ({ ...f, categoryLabel: cat.label, categoryIcon: cat.icon }))
        );
        return (
          <div className="rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 p-4 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🏗️</span>
                <h2 className="font-bold text-orange-800 text-sm">門真市の健康サービス空白地帯マップ</h2>
              </div>
              <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                以下は現時点で門真市の公的支援がなく、住民が自費で対応せざるを得ない領域です。
                需要があるにもかかわらずサービスがない「空白地帯」を可視化することで、
                新規事業・行政施策立案の参考になることを目的としています。
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {gaps.map((f) => (
                <div key={f.id} className="bg-white rounded-xl border border-orange-200 p-3 flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{f.categoryIcon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">{f.name}</span>
                      <span className="text-xs text-slate-400">{f.categoryLabel}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{f.targetAge} ／ {f.importance}</p>
                    {f.selfPay && (
                      <p className="text-xs text-violet-600 mt-1">
                        <span className="font-medium">自費で受けるには：</span>{f.selfPay}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-orange-200 p-3 text-xs text-orange-700 space-y-1">
              <p className="font-medium">📊 この情報を活用できる方々</p>
              <ul className="space-y-0.5 text-slate-600">
                <li>• 医療機関・クリニック ： 新規開業・専門外来の設置検討</li>
                <li>• 健康関連スタートアップ ： オンライン・訪問型サービスの参入検討</li>
                <li>• 行政・議会 ： 次年度予算・委託事業の立案</li>
                <li>• 医療コンサルタント ： 地域医療資源マップ作成</li>
              </ul>
            </div>
          </div>
        );
      })()}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 leading-relaxed">
        <p className="font-medium text-slate-600 mb-0.5">ℹ️ このページについて</p>
        <p>
          掲載情報は2026年時点の厚生労働省・USPSTF・WHO等の公開情報に基づきます。
          門真市の対応状況は変更される場合があります。詳細は健康増進課（06-6904-6400）にお問い合わせください。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/screening">
          <Button variant="outline" className="w-full rounded-xl text-sm">← がん検診を確認</Button>
        </Link>
        <Link href="/standards">
          <Button variant="outline" className="w-full rounded-xl text-sm border-violet-200 text-violet-700 hover:bg-violet-50">
            世界基準との比較 →
          </Button>
        </Link>
      </div>
    </div>
  );
}
