"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScreeningInsight } from "@/components/ScreeningInsight";
import { GameCard } from "@/components/GameCard";
import { buildGameState } from "@/lib/game-data";
import {
  getUser,
  saveUser,
  getScreeningRecords,
  updateScreeningRecords,
  type ScreeningRecords,
} from "@/lib/store";
import {
  buildPlan,
  buildActionSteps,
  getBmiInfo,
  getOptionalSelfPayTests,
  isDoneThisYear,
  fiscalYearLabel,
  KADOMA_HEALTH_PHONE,
  type Plan,
  type PlanItemState,
  type PlanStatus,
} from "@/lib/plan-data";
import { INSIGHTS } from "@/lib/insight-data";
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

type SaveFn = (updates: Record<string, string | null>) => void;

// ── 前回の受診をタップだけでまとめて入力 ─────────────────────────────────

type QuickChoice = "thisYear" | "lastYear" | "twoYears" | "none";

function quickChoiceOf(rec: string | undefined, thisFY: number): QuickChoice | null {
  if (!rec) return null;
  const [y, m] = rec.split("-").map(Number);
  const fy = m >= 4 ? y : y - 1;
  if (fy >= thisFY) return "thisYear";
  if (fy === thisFY - 1) return "lastYear";
  if (fy === thisFY - 2) return "twoYears";
  return null;
}

function QuickSetup({ plan, records, onSave }: { plan: Plan; records: ScreeningRecords; onSave: SaveFn }) {
  const { thisFY } = plan;
  const choices: Array<{ id: QuickChoice; label: string; value: () => string | null }> = [
    { id: "thisYear", label: "今年度", value: currentYearMonth },
    { id: "lastYear", label: "昨年度", value: () => `${thisFY - 1}-10` },
    { id: "twoYears", label: "2年前", value: () => `${thisFY - 2}-10` },
    { id: "none", label: "それより前・なし", value: () => null },
  ];
  const rows = plan.states.filter((s) => s.status !== "later" || s.lastRecord);

  return (
    <div className="space-y-2">
      {rows.map((s) => {
        const current = quickChoiceOf(records[s.item.id], thisFY);
        return (
          <div key={s.item.id} className="bg-white rounded-xl border border-slate-200 p-2.5">
            <p className="text-sm font-medium text-slate-800">
              <span className="mr-1" aria-hidden>
                {s.item.icon}
              </span>
              {s.item.name}
            </p>
            <div className="grid grid-cols-4 gap-1 mt-1.5">
              {choices.map((c) => {
                const selected = c.id === "none" ? !records[s.item.id] : current === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSave({ [s.item.id]: c.value() })}
                    className={`text-xs py-2 rounded-lg border font-medium transition-colors ${
                      selected
                        ? c.id === "none"
                          ? "bg-slate-600 text-white border-slate-600"
                          : "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-500">
        年度は4月〜翌年3月です。だいたいでOK。正確な月は下の各カードで直せます。
      </p>
    </div>
  );
}

// ── 体格（身長・体重） ────────────────────────────────────────────────────

function BodyCard({ user, onChange }: { user: UserProfile; onChange: (u: UserProfile) => void }) {
  const bmi = getBmiInfo(user);
  const [editing, setEditing] = useState(!bmi);
  const [h, setH] = useState(user.heightCm ? String(user.heightCm) : "");
  const [w, setW] = useState(user.weightKg ? String(user.weightKg) : "");
  const valid = Number(h) >= 120 && Number(h) <= 220 && Number(w) >= 25 && Number(w) <= 250;

  if (!editing && bmi) {
    const color =
      bmi.level === "normal"
        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
        : bmi.level === "low"
        ? "text-sky-700 bg-sky-50 border-sky-200"
        : "text-orange-700 bg-orange-50 border-orange-200";
    return (
      <div className={`rounded-2xl border p-4 flex items-start gap-3 ${color}`}>
        <div className="text-center flex-shrink-0">
          <p className="text-[11px]">BMI</p>
          <p className="text-2xl font-bold leading-none">{bmi.bmi}</p>
          <p className="text-xs font-medium mt-0.5">{bmi.label}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500">
            身長 {user.heightCm}cm・体重 {user.weightKg}kg
          </p>
          <p className="text-sm text-slate-800 mt-0.5">{bmi.advice}</p>
        </div>
        <button onClick={() => setEditing(true)} className="text-xs underline underline-offset-2 flex-shrink-0">
          変更
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
      <p className="text-sm font-bold text-slate-800">⚖️ 身長・体重（任意）</p>
      <p className="text-xs text-slate-500">入れると、体格に合わせたアドバイスを表示します。</p>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="number"
          inputMode="decimal"
          value={h}
          onChange={(e) => setH(e.target.value)}
          placeholder="160"
          aria-label="身長（cm）"
          className="w-20 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
        />
        <span className="text-sm text-slate-500">cm</span>
        <input
          type="number"
          inputMode="decimal"
          value={w}
          onChange={(e) => setW(e.target.value)}
          placeholder="60"
          aria-label="体重（kg）"
          className="w-20 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
        />
        <span className="text-sm text-slate-500">kg</span>
        <button
          disabled={!valid}
          onClick={() => {
            onChange({ ...user, heightCm: Number(h), weightKg: Number(w) });
            setEditing(false);
          }}
          className="text-xs px-3 py-1.5 rounded-full bg-emerald-600 text-white font-medium disabled:opacity-40"
        >
          保存
        </button>
        {bmi && (
          <button onClick={() => setEditing(false)} className="text-xs text-slate-500">
            やめる
          </button>
        )}
      </div>
    </div>
  );
}

// ── 1件ずつのカード ───────────────────────────────────────────────────────

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

function RecordControl({ state, onSave }: { state: PlanItemState; onSave: SaveFn }) {
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
          className="text-xs px-3 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium"
        >
          {state.lastRecord ? "月を直す" : "受けた月を入れる"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap bg-slate-50 rounded-xl p-2">
      <input
        type="month"
        value={value}
        max={currentYearMonth()}
        aria-label="受けた月"
        onChange={(e) => setValue(e.target.value)}
        className="border border-slate-300 rounded-lg px-2 py-1 text-sm bg-white"
      />
      <button
        onClick={() => {
          if (value) onSave({ [state.item.id]: value });
          setEditing(false);
        }}
        className="text-xs px-3 py-1.5 rounded-full bg-emerald-600 text-white font-medium"
      >
        保存
      </button>
      {state.lastRecord && (
        <button
          onClick={() => {
            onSave({ [state.item.id]: null });
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

function ItemCard({ state, onSave }: { state: PlanItemState; onSave: SaveFn }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[state.status];
  const { item } = state;
  const hasInsight = Boolean(INSIGHTS[item.id]);
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
              state.status === "todo" ? "text-orange-600" : state.status === "ok" ? "text-emerald-700" : "text-slate-500"
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

      {hasInsight && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full text-left text-xs font-medium text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl px-3 py-2"
          aria-expanded={open}
        >
          {open ? "▲ 閉じる" : "▼ 痛い？時間は？受けるとどんな良いことが？"}
        </button>
      )}
      {open && <ScreeningInsight itemId={item.id} />}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <RecordControl key={state.lastRecord ?? "none"} state={state} onSave={onSave} />
        {state.status !== "later" &&
          (item.action.external ? (
            <a href={item.action.href} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-700 font-medium hover:underline">
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

// ── ページ本体 ────────────────────────────────────────────────────────────

export default function PlanPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<ScreeningRecords>({});
  const [quickOpen, setQuickOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/");
      return;
    }
    setUser(u);
    const recs = getScreeningRecords();
    setRecords(recs);
    setQuickOpen(Object.keys(recs).length === 0);
  }, [router]);

  const plan = useMemo(() => (user ? buildPlan(user, records) : null), [user, records]);

  if (!user || !plan) return null;

  const handleSave: SaveFn = (updates) => setRecords(updateScreeningRecords(updates));
  const handleUserChange = (u: UserProfile) => {
    saveUser(u);
    setUser(u);
  };
  const toggleThisYear = (s: PlanItemState) => {
    if (isDoneThisYear(s, plan.thisFY)) handleSave({ [s.item.id]: null });
    else handleSave({ [s.item.id]: currentYearMonth() });
  };
  const handlePdf = async () => {
    setPdfBusy(true);
    try {
      const { downloadTodoPdf } = await import("@/lib/todo-pdf");
      await downloadTodoPdf(user, plan);
    } finally {
      setPdfBusy(false);
    }
  };

  const groups: Record<PlanStatus, PlanItemState[]> = { todo: [], ok: [], later: [] };
  for (const s of plan.states) groups[s.status].push(s);

  const doneThisYear = plan.states.filter((s) => isDoneThisYear(s, plan.thisFY)).length;
  const yearTotal = groups.todo.length + doneThisYear;
  const progress = yearTotal === 0 ? 100 : Math.round((doneThisYear / yearTotal) * 100);
  const steps = buildActionSteps(plan);
  const firstOpen = steps.findIndex((st) => !st.done);
  const optionalTests = getOptionalSelfPayTests(user).map((id) => SELF_PAY_TEST_BY_ID[id]);
  const game = buildGameState(plan, user);

  const pdfButton = (
    <button
      onClick={handlePdf}
      disabled={pdfBusy}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 disabled:opacity-60"
    >
      {pdfBusy ? "作成中…" : "📄 やることリストをPDFで保存"}
    </button>
  );

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
            <p className="text-emerald-100 text-xs mt-0.5">{fiscalYearLabel(plan.thisFY)}</p>
          </div>
          <Link href="/" className="text-xs text-emerald-100 underline underline-offset-2 flex-shrink-0">
            年齢などを変える
          </Link>
        </div>
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span>
              今年度の達成 {doneThisYear}/{yearTotal}
            </span>
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

      {/* Gamification */}
      <GameCard game={game} onStyleChange={(style) => handleUserChange({ ...user, avatarStyle: style })} />

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

      {/* Quick setup */}
      <section className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-4 space-y-3">
        <button onClick={() => setQuickOpen((v) => !v)} className="w-full flex items-center justify-between gap-2 text-left" aria-expanded={quickOpen}>
          <div>
            <p className="text-sm font-bold text-sky-900">⚡ 前回いつ受けた？（タップだけで入力）</p>
            <p className="text-xs text-sky-700 mt-0.5">ここで入れると、次に受ける年度を自動で計算します。</p>
          </div>
          <span className="text-sky-600 text-sm flex-shrink-0">{quickOpen ? "▲" : "▼"}</span>
        </button>
        {quickOpen && <QuickSetup plan={plan} records={records} onSave={handleSave} />}
      </section>

      {/* When / what */}
      <section className="space-y-3">
        <h2 className="font-bold text-slate-800 text-lg">🗓️ いつ・何をする（今年度）</h2>
        {steps.length === 0 ? (
          <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-center">
            <p className="text-2xl">🎉</p>
            <p className="font-bold text-emerald-800">今年度にやることは、すべてできています</p>
            <p className="text-sm text-emerald-700 mt-1">次の予定は下の「これからの予定」で確認できます。</p>
          </div>
        ) : (
          <ol className="relative space-y-3">
            {steps.map((st, i) => {
              const current = i === firstOpen;
              return (
                <li key={`${st.title}-${i}`} className="flex gap-3">
                  <div
                    className={`flex-shrink-0 w-16 rounded-xl text-center py-2 border-2 h-fit ${
                      st.done
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : current
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-white border-orange-300 text-orange-600"
                    }`}
                  >
                    <p className="text-lg font-bold leading-none">{st.done ? "✓" : st.monthLabel}</p>
                    <p className="text-[11px] mt-1">{st.done ? "完了" : st.relative}</p>
                  </div>
                  <div
                    className={`flex-1 min-w-0 rounded-2xl border-2 p-3 space-y-2 ${
                      st.done ? "border-emerald-200 bg-emerald-50/50" : current ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div>
                      <p className="text-[11px] font-bold text-slate-400">STEP {i + 1}</p>
                      <p className={`font-bold ${st.done ? "text-emerald-800" : "text-slate-800"}`}>{st.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{st.detail}</p>
                    </div>
                    {st.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {st.items.map((s) =>
                          st.checkable ? (
                            <button
                              key={s.item.id}
                              onClick={() => toggleThisYear(s)}
                              aria-pressed={isDoneThisYear(s, plan.thisFY)}
                              className={`text-xs px-2.5 py-1.5 rounded-full border font-medium transition-colors ${
                                isDoneThisYear(s, plan.thisFY)
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "bg-white border-slate-300 text-slate-700 hover:border-emerald-500"
                              }`}
                            >
                              {isDoneThisYear(s, plan.thisFY) ? "☑" : "☐"} {s.item.name}
                            </button>
                          ) : (
                            <span key={s.item.id} className="text-xs px-2.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700">
                              {s.item.icon} {s.item.name}
                            </span>
                          )
                        )}
                      </div>
                    )}
                    {st.checkable && !st.done && (
                      <p className="text-[11px] text-slate-500">受けたものをタップすると「受けた」になります。</p>
                    )}
                    {!st.done && (st.action || st.phone) && (
                      <div className="flex gap-2 flex-wrap">
                        {st.action &&
                          (st.action.external ? (
                            <a
                              href={st.action.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-xs px-3 py-2 rounded-xl font-bold ${current ? "bg-orange-500 text-white" : "border border-emerald-600 text-emerald-700"}`}
                            >
                              {st.action.label} ↗
                            </a>
                          ) : (
                            <Link
                              href={st.action.href}
                              className={`text-xs px-3 py-2 rounded-xl font-bold ${current ? "bg-orange-500 text-white" : "border border-violet-500 text-violet-700"}`}
                            >
                              {st.action.label} →
                            </Link>
                          ))}
                        {st.phone && (
                          <a href={`tel:${st.phone}`} className="text-xs px-3 py-2 rounded-xl border-2 border-orange-400 text-orange-700 font-bold bg-white">
                            📞 {st.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {pdfButton}
        <p className="text-xs text-slate-500 text-center">
          紙に印刷して冷蔵庫に貼ったり、スマホに保存して受付で見せたりできます。
        </p>
      </section>

      {/* Body */}
      <BodyCard user={user} onChange={handleUserChange} />

      {/* Groups */}
      {(["todo", "ok", "later"] as const).map((st) =>
        groups[st].length === 0 ? null : (
          <section key={st} id={`group-${st}`} className="space-y-2 scroll-mt-20">
            <h2 className="flex items-center gap-2 font-bold text-slate-800">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${STATUS_META[st].pill}`}>
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
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] inline-flex items-center justify-center">✓</span> 受けた
          </span>
        </div>
        <p className="text-xs text-sky-700">👆 今年度の列の丸をタップすると「受けた」にできます（もう一度で取り消し）。</p>
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
                    const cell =
                      mark === "done" ? (
                        <span className="inline-flex w-6 h-6 rounded-full bg-emerald-600 text-white items-center justify-center text-[11px]">✓</span>
                      ) : mark === "due" ? (
                        k === 0 ? (
                          <span className="inline-block w-6 h-6 rounded-full bg-orange-500" />
                        ) : (
                          <span className="inline-block w-5 h-5 rounded-full border-2 border-emerald-500" />
                        )
                      ) : (
                        <span className="text-slate-200">·</span>
                      );
                    return (
                      <td key={fy} className={`text-center py-1.5 ${k === 0 ? "bg-orange-50/50" : ""}`}>
                        {k === 0 && mark ? (
                          <button
                            onClick={() => toggleThisYear(s)}
                            className="p-1 rounded-full hover:ring-2 hover:ring-emerald-300"
                            aria-label={mark === "done" ? `${s.item.name}の記録を取り消す` : `${s.item.name}を受けたにする`}
                          >
                            {cell}
                          </button>
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400">年度は4月〜翌年3月です。年齢は今の年齢から1歳ずつ足した目安です。</p>
      </section>

      {/* Optional self-pay */}
      {optionalTests.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold text-slate-800">💡 当てはまる人は検討（自費）</h2>
          <p className="text-xs text-slate-500">市の補助はありませんが、条件によっては受ける価値がある検査です。</p>
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

      {pdfButton}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/self-pay">
          <Button variant="outline" className="w-full rounded-xl text-sm border-violet-200 text-violet-700">
            自費で受けられる場所
          </Button>
        </Link>
        <Link href="/trusted-people">
          <Button className="w-full rounded-xl text-sm bg-emerald-600 hover:bg-emerald-700 text-white">大切な人を誘う →</Button>
        </Link>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        記録はこの端末の中だけに保存され、外には送られません。問い合わせ：門真市 健康増進課 {KADOMA_HEALTH_PHONE}（平日）。この表示は医師の診断の代わりにはなりません。気になる症状があるときは、検診を待たずに医療機関を受診してください。
      </p>
    </div>
  );
}
