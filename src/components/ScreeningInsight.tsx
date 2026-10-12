import { INSIGHTS, PAIN_LABELS, RADIATION_REFERENCE, type PainLevel } from "@/lib/insight-data";

function PainMeter({ level }: { level: PainLevel }) {
  return (
    <span className="inline-flex gap-0.5 align-middle" aria-label={PAIN_LABELS[level]}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`w-3 h-3 rounded-full ${n <= level ? "bg-rose-400" : "bg-slate-200"}`}
        />
      ))}
    </span>
  );
}

// 1,000人（または1万人）が受けると、の人数を帯グラフで見せる
function PeopleBar({ base, recall, found, foundLabel }: { base: number; recall: string; found: string; foundLabel: string }) {
  const recallNum = parseInt(recall.replace(/[^0-9〜]/g, "").split("〜").pop() ?? "0", 10);
  const recallPct = Math.max(2, Math.min(100, (recallNum / base) * 100));
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-700">
        {base.toLocaleString()}人が受けると…
      </p>
      <div className="h-4 w-full rounded-full bg-emerald-200 overflow-hidden flex" aria-hidden>
        <div className="h-full bg-amber-400" style={{ width: `${recallPct}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="bg-emerald-50 rounded-lg p-1.5">
          <p className="text-[11px] text-emerald-700">異常なし</p>
          <p className="text-sm font-bold text-emerald-800">約{(base - recallNum).toLocaleString()}人</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-1.5">
          <p className="text-[11px] text-amber-700">要精密検査</p>
          <p className="text-sm font-bold text-amber-800">{recall}</p>
        </div>
        <div className="bg-rose-50 rounded-lg p-1.5">
          <p className="text-[11px] text-rose-700 leading-tight">{foundLabel.split("（")[0]}</p>
          <p className="text-sm font-bold text-rose-800">{found}</p>
        </div>
      </div>
      {foundLabel.includes("（") && (
        <p className="text-[11px] text-slate-500">※{foundLabel.slice(foundLabel.indexOf("（") + 1, -1)}</p>
      )}
    </div>
  );
}

function SurvivalBars({ early, late }: { early: number; late: number }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-700">見つかった時期で、5年後に生きている割合はこんなに違う</p>
      {[
        { label: "早期（I期）", value: early, color: "bg-emerald-500" },
        { label: "進行（IV期）", value: late, color: "bg-rose-400" },
      ].map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="text-xs text-slate-600 w-20 flex-shrink-0">{r.label}</span>
          <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.value}%` }} />
          </div>
          <span className="text-sm font-bold text-slate-800 w-14 text-right">{Math.round(r.value)}%</span>
        </div>
      ))}
      <p className="text-[11px] text-slate-400">出典：全がん協 部位別臨床病期別5年相対生存率（2011–2013年診断）</p>
    </div>
  );
}

export function ScreeningInsight({ itemId }: { itemId: string }) {
  const insight = INSIGHTS[itemId];
  if (!insight) return null;
  const { burden, benefit } = insight;

  return (
    <div className="space-y-3">
      {/* 負担 */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 space-y-2">
        <p className="text-xs font-bold text-sky-900">🧾 受ける人の負担</p>
        <dl className="grid grid-cols-[5.5rem_1fr] gap-x-2 gap-y-1.5 text-xs">
          <dt className="text-slate-500">⏱ 時間</dt>
          <dd className="text-slate-800">{burden.time}</dd>
          <dt className="text-slate-500">😣 痛み</dt>
          <dd className="text-slate-800">
            <PainMeter level={burden.pain} /> <span className="font-medium ml-1">{PAIN_LABELS[burden.pain]}</span>
            <span className="block text-slate-600">{burden.painNote}</span>
          </dd>
          <dt className="text-slate-500">📝 準備</dt>
          <dd className="text-slate-800">{burden.prep}</dd>
          {burden.radiation && (
            <>
              <dt className="text-slate-500">☢️ 放射線</dt>
              <dd className="text-slate-800">
                {burden.radiation}
                <span className="block text-slate-500">{RADIATION_REFERENCE}</span>
              </dd>
            </>
          )}
          {burden.after && (
            <>
              <dt className="text-slate-500">🏠 終わった後</dt>
              <dd className="text-slate-800">{burden.after}</dd>
            </>
          )}
          {burden.ifPositive && (
            <>
              <dt className="text-slate-500">🔎 再検査なら</dt>
              <dd className="text-slate-800">{burden.ifPositive}</dd>
            </>
          )}
        </dl>
      </div>

      {/* メリット */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-3">
        <div>
          <p className="text-xs font-bold text-emerald-900">✨ 受けるメリット</p>
          <p className="text-sm font-bold text-slate-800 mt-1">{benefit.headline}</p>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed">{benefit.effect}</p>
        </div>
        {benefit.per && <PeopleBar {...benefit.per} />}
        {benefit.survival && <SurvivalBars {...benefit.survival} />}
        {benefit.per && (
          <p className="text-[11px] text-slate-400">
            人数は全国の市区町村検診の実績と国の基準値から出した目安です。
          </p>
        )}
      </div>

      {/* デメリット */}
      {benefit.downsides.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
          <p className="text-xs font-bold text-slate-700">⚖️ 知っておきたいこと（デメリット）</p>
          <ul className="space-y-1">
            {benefit.downsides.map((d) => (
              <li key={d} className="text-xs text-slate-600 leading-relaxed">・{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
