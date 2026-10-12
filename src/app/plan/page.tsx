"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUser, getScreeningRecords, setScreeningRecord, type ScreeningRecords } from "@/lib/store";
import { buildPlan, getOptionalSelfPayTests, type PlanItemState, type PlanStatus } from "@/lib/plan-data";
import { SELF_PAY_TEST_BY_ID, EVIDENCE_LABELS } from "@/lib/self-pay-data";
import type { UserProfile } from "@/lib/types";

const STATUS_META: Record<
  PlanStatus,
  { label: string; icon: string; pill: string; card: string; tile: string; tileText: string }
> = {
  todo: {
    label: "今年度やること",
    icon: "!",
    pill: "bg-orange-500 text-white",
    card: "border-orange-300 bg-white",
    tile: "bg-orange-50 border-orange-200",
    tileText: "text-orange-600",
  },
  ok: {
    label: "できている",
    icon: "✓",
    pill: "bg-emerald-600 text-white",
    card: "border-emerald-200 bg-emerald-50/40",
    tile: "bg-emerald-50 border-emerald-200",
    tileText: "text-emerald-700",
  },
  later: {
    label: "まだ先",
    icon: "…",
    pill: "bg-slate-300 text-slate-700",
    card: "border-slate-200 bg-slate-50",
    tile: "bg-slate-50 border-slate-200",
    tileText: "text-slate-500",
  },
};

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatYearMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${y}年${Number(m)}月`;
}

function KindBadge({ state }: { state: PlanItemState }) {
  const { item } = state;
  return item.kind === "public" ? (
    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
      市の補助 {item.cost}
    </span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-medium">
      自費 {item.cost}
    </span>
  );
}

function RecordControl({
  state,
  onSave,
}: {
  state: PlanItemState;
  onSave: (itemId: string, ym: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(state.lastRecord ?? currentYearMonth());

  if (!editing) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {state.lastRecord && (
          <span className="text-xs text-slate-500">前回：{formatYearMonth(state.lastRecord)}</span>
        )}
        <button
          onClick={() => setEditing(true)}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            state.status === "todo"
              ? "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              : "border-slate-300 text-slate-600 hover:bg-slate-100"
          }`}
        >
          {state.lastRecord ? "記録を直す" : "✓ 受けたら記録する"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap bg-slate-50 rounded-xl p-2">
      <label className="text-xs text-slate-600" htmlFor={`rec-${state.item.id}`}>
        受けた月
      </label>
      <input
        id={`rec-${state.item.id}`}
        type="month"
        value={value}
        max={currentYearMonth()}
        onChange={(e) => setValue(e.target.value)}
        className="border border-slate-300 rounded-lg px-2 py-1 text-sm bg-white"
      />
      <button
        onClick={() => {
          if (value) onSave(state.item.id, value);
          setEditing(false);
        }}
        className="text-xs px-3 py-1.5 rounded-full bg-emerald-600 text-white font-medium"
      >
        保存
      </button>
      {state.lastRecord && (
        <button
          onClick={() => {
            onSave(state.item.id, null);
            setEditing(false);
          }}
          className="text-xs px-2 py-1.5 text-red-500 hover:underline"
        >
          記録を消す
        </button>
      )}
      <button onClick={() => setEditing(false)} className="text-xs px-2 py-1.5 text-slate-500">
        やめる
      </button>
    </div>
  );
}

function ItemCard({
  state,
  onSave,
}: {
  state: PlanItemState;
  onSave: (itemId: string, ym: string | null) => void;
}) {
  const meta = STATUS_META[state.status];
  const { item } = state;
  return (
    <div className={`rounded-2xl border-2 p-4 space-y-2.5 ${meta.card}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden>
          {item.icon}
        </span>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800">{item.name}</span>
            <KindBadge state={state} />
          </div>
          <p className="text-sm text-slate-600">{item.what}</p>
          <p
            className={`text-sm font-medium ${
              state.status === "todo"
                ? "text-orange-600"
                : state.status === "ok"
                ? "text-emerald-700"
                : "text-slate-500"
            }`}
          >
            {state.headline}
          </p>
          {item.note && <p className="text-xs text-slate-500">※ {item.note}</p>}
        </div>
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${meta.pill}`}
          aria-label={meta.label}
        >
          {meta.icon}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap pl-10">
        <RecordControl key={state.lastRecord ?? "none"} state={state} onSave={onSave} />
        {state.status !== "later" &&
          (item.action.external ? (
            <a
              href={item.action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 font-medium hover:underline"
            >
              {item.action.label} ↗
            </a>
          ) : (
            <Link href={item.action.href} className="text-xs text-violet-700 font-medium hover:underline">
              {item.action.label} →
            </Link>
          ))}
      </div>
    </div>
  );
}

export default function PlanPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<ScreeningRecords>({});

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/");
      return;
    }
    setUser(u);
    setRecords(getScreeningRecords());
  }, [router]);

  const plan = useMemo(() => (user ? buildPlan(user, records) : null), [user, records]);

  if (!user || !plan) return null;

  const handleSave = (itemId: string, ym: string | null) => {
    setRecords(setScreeningRecord(itemId, ym));
  };

  const groups: Record<PlanStatus, PlanItemState[]> = { todo: [], ok: [], later: [] };
  for (const s of plan.states) groups[s.status].push(s);

  const activeCount = groups.todo.length + groups.ok.length;
  const progress = activeCount === 0 ? 100 : Math.round((groups.ok.length / activeCount) * 100);
  const nextStep = groups.todo[0];
  const optionalTests = getOptionalSelfPayTests(user).map((id) => SELF_PAY_TEST_BY_ID[id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-emerald-600 text-white rounded-2xl p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-emerald-100 text-sm">
              {user.age}歳・{user.gender === "male" ? "男性" : "女性"}のあなたの
            </p>
            <h1 className="text-xl font-bold">マイ健診プラン</h1>
            <p className="text-emerald-100 text-xs mt-0.5">{plan.thisFY}年度（{plan.thisFY}年4月〜{plan.thisFY + 1}年3月）</p>
          </div>
          <Link href="/" className="text-xs text-emerald-100 underline underline-offset-2 flex-shrink-0">
            年齢などを変える
          </Link>
        </div>
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span>今年度の達成度</span>
            <span className="text-2xl font-bold">{progress}%</span>
          </div>
          <div
            className="h-3 rounded-full bg-emerald-800/40 overflow-hidden mt-1"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-2">
        {(["todo", "ok", "later"] as const).map((st) => {
          const m = STATUS_META[st];
          return (
            <a key={st} href={`#group-${st}`} className={`rounded-xl border p-3 text-center ${m.tile}`}>
              <p className={`text-3xl font-bold ${m.tileText}`}>{groups[st].length}</p>
              <p className={`text-xs font-medium mt-0.5 ${m.tileText}`}>{m.label}</p>
            </a>
          );
        })}
      </div>

      {/* Next step */}
      {nextStep ? (
        <div className="rounded-2xl border-2 border-orange-400 bg-orange-50 p-4 space-y-3">
          <p className="text-xs font-bold text-orange-700">👉 まず、これをやりましょう</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {nextStep.item.icon}
            </span>
            <div>
              <p className="font-bold text-slate-800 text-lg leading-snug">{nextStep.item.name}</p>
              <p className="text-sm text-slate-600">{nextStep.item.what}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {nextStep.item.action.external ? (
              <a
                href={nextStep.item.action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600"
              >
                {nextStep.item.action.label}
              </a>
            ) : (
              <Link
                href={nextStep.item.action.href}
                className="flex items-center justify-center py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600"
              >
                {nextStep.item.action.label}
              </Link>
            )}
            <a
              href="tel:06-6904-6400"
              className="flex items-center justify-center py-2.5 rounded-xl border-2 border-orange-400 text-orange-700 text-sm font-bold bg-white"
            >
              📞 市に電話で聞く
            </a>
          </div>
          <p className="text-xs text-orange-700">門真市 健康増進課 06-6904-6400（平日）</p>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-center">
          <p className="text-2xl">🎉</p>
          <p className="font-bold text-emerald-800">今年度にやることは、すべてできています</p>
          <p className="text-sm text-emerald-700 mt-1">次の予定は下の「これからの予定」で確認できます。</p>
        </div>
      )}

      {/* Groups */}
      {(["todo", "ok", "later"] as const).map((st) =>
        groups[st].length === 0 ? null : (
          <section key={st} id={`group-${st}`} className="space-y-2 scroll-mt-20">
            <h2 className="flex items-center gap-2 font-bold text-slate-800">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${STATUS_META[st].pill}`}
              >
                {STATUS_META[st].icon}
              </span>
              {STATUS_META[st].label}
              <span className="text-sm font-normal text-slate-400">{groups[st].length}件</span>
            </h2>
            <div className="space-y-2">
              {groups[st].map((s) => (
                <ItemCard key={s.item.id} state={s} onSave={handleSave} />
              ))}
            </div>
          </section>
        )
      )}

      {/* Timeline */}
      <section className="space-y-2">
        <h2 className="font-bold text-slate-800">📅 これからの予定（5年分）</h2>
        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-orange-500 inline-block" /> 今年度やる
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full border-2 border-emerald-500 inline-block" /> 受ける予定
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] inline-flex items-center justify-center">✓</span>{" "}
            受けた
          </span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-xs min-w-[520px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-3 py-2 font-medium text-slate-500">検査</th>
                {plan.years.map((fy, k) => (
                  <th key={fy} className={`px-2 py-2 font-medium text-center ${k === 0 ? "text-orange-600" : "text-slate-500"}`}>
                    {fy}年度
                    <span className="block font-normal text-slate-400">{user.age + k}歳</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plan.states.map((s, i) => (
                <tr key={s.item.id} className={i !== plan.states.length - 1 ? "border-b border-slate-100" : ""}>
                  <td className="px-3 py-2">
                    <span className="mr-1" aria-hidden>
                      {s.item.icon}
                    </span>
                    <span className="text-slate-700">{s.item.name}</span>
                    {s.item.kind === "self" && <span className="ml-1 text-violet-600">（自費）</span>}
                  </td>
                  {plan.years.map((fy, k) => {
                    const mark = s.schedule[fy];
                    return (
                      <td key={fy} className={`text-center py-2 ${k === 0 ? "bg-orange-50/50" : ""}`}>
                        {mark === "done" ? (
                          <span className="inline-flex w-5 h-5 rounded-full bg-emerald-600 text-white items-center justify-center text-[10px]" aria-label="受けた">
                            ✓
                          </span>
                        ) : mark === "due" ? (
                          k === 0 ? (
                            <span className="inline-block w-5 h-5 rounded-full bg-orange-500" aria-label="今年度やる" />
                          ) : (
                            <span className="inline-block w-5 h-5 rounded-full border-2 border-emerald-500" aria-label="受ける予定" />
                          )
                        ) : (
                          <span className="text-slate-200">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400">
          年度は4月〜翌年3月です。年齢は今の年齢から1歳ずつ足した目安です。
        </p>
      </section>

      {/* Optional self-pay */}
      {optionalTests.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold text-slate-800">💡 当てはまる人は検討（自費）</h2>
          <p className="text-xs text-slate-500">
            市の補助はありませんが、条件によっては受ける価値がある検査です。
          </p>
          <div className="space-y-2">
            {optionalTests.map((t) => (
              <Link
                key={t.id}
                href={`/self-pay#${t.id}`}
                className="flex items-start gap-3 bg-white border border-violet-200 rounded-xl p-3 hover:bg-violet-50 transition-colors"
              >
                <span className="text-xl" aria-hidden>
                  {t.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm">{t.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${EVIDENCE_LABELS[t.evidence].className}`}>
                      {EVIDENCE_LABELS[t.evidence].label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">対象：{t.forWhom}</p>
                  <p className="text-xs text-violet-700 mt-0.5">費用の目安 {t.costRange}</p>
                </div>
                <span className="text-violet-400 text-sm">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/self-pay">
          <Button variant="outline" className="w-full rounded-xl text-sm border-violet-200 text-violet-700">
            自費で受けられる場所
          </Button>
        </Link>
        <Link href="/trusted-people">
          <Button className="w-full rounded-xl text-sm bg-emerald-600 hover:bg-emerald-700 text-white">
            大切な人を誘う →
          </Button>
        </Link>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        記録はこの端末の中だけに保存され、外には送られません。この表示は医師の診断の代わりにはなりません。気になる症状があるときは、検診を待たずに医療機関を受診してください。
      </p>
    </div>
  );
}
