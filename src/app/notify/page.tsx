"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUser, getTrustedPeople, addNotificationLog } from "@/lib/store";
import { getRecommendedScreenings } from "@/lib/screening-data";
import type { UserProfile, TrustedPerson, NotificationLog, NotificationMethodType } from "@/lib/types";

const TIMING_OPTIONS = [
  { value: "now", label: "今すぐ", desc: "検診シーズンの開始時など" },
  { value: "1month", label: "1ヶ月前", desc: "申込締切の1ヶ月前" },
  { value: "2weeks", label: "2週間前", desc: "締切直前のリマインド" },
  { value: "day_of", label: "当日朝", desc: "当日のリマインド" },
];

const NUDGE_MESSAGES = [
  {
    id: "family",
    label: "家族・愛する人へ",
    message: (name: string) =>
      `${name}さん、あなたに元気でいてほしいから、今年のがん検診、一緒に受けに行かない？門真市なら安く受けられるよ。`,
    icon: "💚",
  },
  {
    id: "work",
    label: "仕事仲間・同僚へ",
    message: (name: string) =>
      `${name}さん、いつも一緒に頑張ってる仲間として…今年のがん検診、もう受けた？まだなら一緒に予約しない？`,
    icon: "🤝",
  },
  {
    id: "loss",
    label: "損失回避（プロスペクト理論）",
    message: (name: string) =>
      `${name}さん、がんは早期発見なら90%以上が治ります。でも気づいた時には手遅れになることも。あなたのことが心配だから、ぜひ検診を受けてほしい。`,
    icon: "🎯",
  },
];

export default function NotifyPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [trustedPeople, setTrustedPeople] = useState<TrustedPerson[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedNudge, setSelectedNudge] = useState("family");
  const [selectedTiming, setSelectedTiming] = useState("now");
  const [selectedMethod, setSelectedMethod] = useState<NotificationMethodType>("line");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setTrustedPeople(getTrustedPeople());
  }, []);

  const togglePerson = (id: string) => {
    setSelectedPeople((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const nudgeTemplate = NUDGE_MESSAGES.find((n) => n.id === selectedNudge)!;

  const buildMailtoLink = (person: (typeof trustedPeople)[0]) => {
    const senderName = user ? `${user.age}歳の知人` : "知人";
    const letterUrl = `https://yarude-kenkatsu.vercel.app/letter?from=${encodeURIComponent(senderName)}`;
    const nudge = NUDGE_MESSAGES.find((n) => n.id === selectedNudge)!;
    const subject = encodeURIComponent("【がん検診のご案内】あなたに届いてほしいお知らせ");
    const body = encodeURIComponent(
      `${person.name} さんへ\n\n` +
      nudge.message(person.name) + "\n\n" +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `あなたへの検診案内（クリックして開いてください）：\n` +
      letterUrl + "\n\n" +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `このリンクには、あなたに受けていただきたいがん検診と\n` +
      `門真市での受け方・費用・予約方法がまとめられています。\n\n` +
      `YARUDE健活 | 門真市共創プロジェクト\n` +
      `https://yarude-kenkatsu.vercel.app`
    );
    return `mailto:${person.contact}?subject=${subject}&body=${body}`;
  };

  const handleSend = () => {
    if (selectedPeople.length === 0 || !user) return;
    const screenings = getRecommendedScreenings(user.age, user.gender);

    selectedPeople.forEach((pid) => {
      const person = trustedPeople.find((p) => p.id === pid)!;
      const log: NotificationLog = {
        id: crypto.randomUUID(),
        userId: user.id,
        screeningId: screenings[0]?.id ?? "general",
        notificationGroup: user.notificationGroup,
        method: selectedMethod,
        sentAt: new Date().toISOString(),
      };
      addNotificationLog(log);

      if (person.contactType === "email" && selectedMethod === "email") {
        window.location.href = buildMailtoLink(person);
      }
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-5">
        <div className="text-center py-10 space-y-4">
          <div className="text-6xl">✅</div>
          <h2 className="text-xl font-bold text-slate-800">送信しました！</h2>
          <p className="text-sm text-slate-500">
            {selectedPeople.length}人に検診の案内を送りました。
            あなたの声かけが、大切な人の命を守るかもしれません。
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <Link href="/screening">
              <Button variant="outline" className="w-full text-sm">自分の検診を確認</Button>
            </Link>
            <Link href="/admin">
              <Button className="w-full bg-emerald-600 text-white text-sm">効果を確認する</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">大切な人に伝える</h1>
        <p className="text-sm text-slate-500 mt-1">あなたの声かけが、受診のきっかけになります</p>
      </div>

      {trustedPeople.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-slate-500 text-sm">信頼する人が登録されていません</p>
            <Link href="/trusted-people">
              <Button className="bg-emerald-600 text-white">信頼する人を登録する</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Step 1: 送る相手 */}
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-medium text-slate-800 text-sm">① 送る相手を選ぶ</h3>
              <div className="space-y-2">
                {trustedPeople.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePerson(p.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      selectedPeople.includes(p.id)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedPeople.includes(p.id) ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                    }`}>
                      {selectedPeople.includes(p.id) && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.contact}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: メッセージ */}
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-medium text-slate-800 text-sm">② メッセージの種類</h3>
              <div className="space-y-2">
                {NUDGE_MESSAGES.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNudge(n.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedNudge === n.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{n.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{n.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              {selectedPeople.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">プレビュー（最初の相手）</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {nudgeTemplate.message(
                      trustedPeople.find((p) => p.id === selectedPeople[0])?.name ?? "〇〇"
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: タイミング */}
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-medium text-slate-800 text-sm">③ 通知タイミング</h3>
              <p className="text-xs text-slate-500">通知を送るタイミングも受診率に影響します（RCT検証中）</p>
              <div className="grid grid-cols-2 gap-2">
                {TIMING_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setSelectedTiming(t.value)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      selectedTiming === t.value ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-700">{t.label}</p>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 4: 送信方法 */}
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-medium text-slate-800 text-sm">④ 送信方法</h3>
              <div className="flex gap-2">
                {(["line", "sms", "email"] as NotificationMethodType[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMethod(m)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedMethod === m
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {m === "line" ? "💬 LINE" : m === "sms" ? "📱 SMS" : "📧 メール"}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedMethod === "email" && selectedPeople.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 space-y-2">
              <p className="font-medium">📧 メール送信の手順</p>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-violet-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                <div>
                  <p className="font-medium text-violet-700">PDFをダウンロードする</p>
                  <p className="text-slate-500">検診案内を見やすいPDFとして保存します。</p>
                  <a
                    href={`/letter?from=${encodeURIComponent(user ? `${user.age}歳の知人` : "知人")}`}
                    target="_blank"
                    className="mt-1 inline-block bg-violet-100 text-violet-700 hover:bg-violet-200 px-2 py-1 rounded font-medium transition-colors"
                  >
                    📄 案内レターページを開く（PDFダウンロード）
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                <div>
                  <p className="font-medium text-blue-700">メールアプリで送信する</p>
                  <p className="text-slate-500">件名・本文が自動入力されます。ダウンロードしたPDFを添付して送信してください。</p>
                </div>
              </div>
            </div>
          )}
          <Button
            onClick={handleSend}
            disabled={selectedPeople.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-base font-medium"
          >
            {selectedPeople.length > 0
              ? selectedMethod === "email"
                ? `📧 メールを作成して送る（${selectedPeople.length}人）`
                : `${selectedPeople.length}人に送る →`
              : "送る相手を選んでください"}
          </Button>
        </>
      )}
    </div>
  );
}
