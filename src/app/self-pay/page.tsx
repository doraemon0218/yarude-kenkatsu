"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SELF_PAY_TESTS,
  SELF_PAY_FACILITIES,
  FACILITY_BY_ID,
  EVIDENCE_LABELS,
  IRYOU_NAVI_URL,
  type SelfPayFacility,
} from "@/lib/self-pay-data";

function FacilityCard({ f }: { f: SelfPayFacility }) {
  return (
    <div id={`facility-${f.id}`} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 scroll-mt-20">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-800">{f.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{f.address}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
            f.city === "門真市" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
          }`}
        >
          {f.city}
        </span>
      </div>
      <div className="text-xs text-slate-600 space-y-0.5">
        <p>🚃 {f.access}</p>
        <p>🕘 {f.hours}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        {f.highlights.map((h) => (
          <span key={h} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {h}
          </span>
        ))}
      </div>
      {f.priceExamples.length > 0 && (
        <div className="bg-violet-50 rounded-xl p-3 space-y-1">
          <p className="text-xs font-medium text-violet-800">💴 料金の例（税込）</p>
          {f.priceExamples.map((p) => (
            <div key={p.label} className="flex justify-between gap-2 text-xs">
              <span className="text-slate-600">{p.label}</span>
              <span className="font-medium text-slate-800 whitespace-nowrap">{p.price}</span>
            </div>
          ))}
        </div>
      )}
      {f.note && <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">{f.note}</p>}
      <div className="grid grid-cols-2 gap-2">
        {f.phone ? (
          <a
            href={`tel:${f.phone}`}
            className="flex items-center justify-center py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            📞 {f.phone}
          </a>
        ) : (
          <span className="flex items-center justify-center py-2.5 rounded-xl border border-slate-200 text-slate-400 text-xs">
            電話番号はサイトで確認
          </span>
        )}
        <a
          href={f.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center text-center px-2 py-2.5 rounded-xl border-2 border-emerald-600 text-emerald-700 text-xs font-medium hover:bg-emerald-50"
        >
          {f.urlLabel} ↗
        </a>
      </div>
    </div>
  );
}

type CityFilter = "all" | "門真市" | "守口市";

export default function SelfPayPage() {
  const [city, setCity] = useState<CityFilter>("all");
  const facilities = SELF_PAY_FACILITIES.filter((f) => city === "all" || f.city === city);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">自費で受ける検査と、受けられる場所</h1>
        <p className="text-sm text-slate-500 mt-1">
          市の補助（数百円）がない検査は、自分で全額払う「自費」になります。門真市内を中心に、実際に受けられる施設をまとめました。
        </p>
      </div>

      {/* How to read */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-bold text-amber-900">はじめに知っておくこと</p>
        <ol className="text-sm text-amber-900 space-y-1.5 list-decimal pl-5">
          <li>
            <strong>まずは市の検診（安い）を受けましょう。</strong>自費の検査は、その「上乗せ」です。
          </li>
          <li>症状があるときは「検診」ではなく、ふつうの診察（保険がきく）で受けられます。</li>
          <li>費用は目安です。予約のときに「自費でいくらですか？」と必ず確認してください。</li>
        </ol>
      </div>

      {/* Evidence legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {Object.values(EVIDENCE_LABELS).map((e) => (
          <div key={e.label} className="flex items-start gap-2 bg-white border border-slate-200 rounded-xl p-2.5">
            <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${e.className}`}>{e.label}</span>
            <span className="text-xs text-slate-500">{e.desc}</span>
          </div>
        ))}
      </div>

      {/* Tests */}
      <section className="space-y-3">
        <h2 className="font-bold text-slate-800">🔍 検査の種類から探す</h2>
        {SELF_PAY_TESTS.map((t) => {
          const ev = EVIDENCE_LABELS[t.evidence];
          return (
            <div key={t.id} id={t.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 scroll-mt-20">
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {t.icon}
                </span>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800">{t.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${ev.className}`}>{ev.label}</span>
                  </div>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">対象：</span>
                    {t.forWhom}
                  </p>
                  <p className="text-sm text-slate-600">{t.why}</p>
                  <p className="text-sm font-medium text-violet-700">費用の目安：{t.costRange}</p>
                </div>
              </div>
              <div className="pl-10 space-y-1.5">
                <p className="text-xs font-medium text-slate-500">📍 受けられる場所</p>
                {t.where.map((w) => {
                  const f = FACILITY_BY_ID[w.facility];
                  return (
                    <a
                      key={w.facility}
                      href={`#facility-${f.id}`}
                      className="block bg-slate-50 hover:bg-emerald-50 rounded-lg px-3 py-2"
                    >
                      <span className="block text-sm text-slate-800">
                        {f.name}
                        <span className="text-xs text-slate-500 ml-1">（{f.city}）</span>
                      </span>
                      <span className="block text-xs text-emerald-700 mt-0.5">→ {w.how}</span>
                    </a>
                  );
                })}
                {t.tip && <p className="text-xs text-slate-500">💬 {t.tip}</p>}
              </div>
            </div>
          );
        })}
      </section>

      {/* Facilities */}
      <section className="space-y-3">
        <h2 className="font-bold text-slate-800">🏥 施設の一覧</h2>
        <div className="flex gap-2">
          {(["all", "門真市", "守口市"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
                city === c ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              {c === "all" ? "すべて" : c === "門真市" ? "門真市内" : "守口市（となり）"}
            </button>
          ))}
        </div>
        {facilities.map((f) => (
          <FacilityCard key={f.id} f={f} />
        ))}
      </section>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-bold text-slate-700">近所のクリニックを探すには</p>
        <p className="text-xs text-slate-600 leading-relaxed">
          眼科・耳鼻科・婦人科などは、近所のクリニックでも受けられます。厚生労働省の「医療情報ネット（ナビイ）」で、「門真市」と診療科を選ぶと探せます。
        </p>
        <a
          href={IRYOU_NAVI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-emerald-700 font-medium hover:underline"
        >
          医療情報ネット（ナビイ）を開く ↗
        </a>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        掲載情報は2026年10月時点で各施設の公開情報・健診予約サイトから確認したものです。料金・受付時間・検査内容は変わることがあります。受診前に必ず各施設へご確認ください。掲載は特定の施設をすすめるものではありません。
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/plan">
          <Button variant="outline" className="w-full rounded-xl text-sm">
            ← マイ健診プラン
          </Button>
        </Link>
        <Link href="/facilities">
          <Button variant="outline" className="w-full rounded-xl text-sm">
            市の検診の受け方 →
          </Button>
        </Link>
      </div>
    </div>
  );
}
