"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTrustedPeople, addTrustedPerson, removeTrustedPerson } from "@/lib/store";
import type { TrustedPerson, RelationshipType, ContactType } from "@/lib/types";

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  spouse: "配偶者・パートナー",
  parent: "親",
  child: "子ども",
  sibling: "兄弟・姉妹",
  friend: "友人",
  old_friend: "旧友",
  colleague: "職場の同僚",
  senior: "先輩",
  junior: "後輩",
  neighbor: "近所の方",
};

const RELATIONSHIP_EMOJI: Record<RelationshipType, string> = {
  spouse: "💑",
  parent: "👨‍👩‍👦",
  child: "👶",
  sibling: "👫",
  friend: "👥",
  old_friend: "🎓",
  colleague: "🤝",
  senior: "👴",
  junior: "🌱",
  neighbor: "🏘️",
};

export default function TrustedPeoplePage() {
  const [people, setPeople] = useState<TrustedPerson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<RelationshipType>("spouse");
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState<ContactType>("phone");

  useEffect(() => {
    setPeople(getTrustedPeople());
  }, []);

  const handleAdd = () => {
    if (!name || !contact) return;
    const person: TrustedPerson = {
      id: crypto.randomUUID(),
      name,
      relationship,
      contact,
      contactType,
      addedAt: new Date().toISOString(),
    };
    addTrustedPerson(person);
    setPeople(getTrustedPeople());
    setName("");
    setContact("");
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    removeTrustedPerson(id);
    setPeople(getTrustedPeople());
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">信頼する人を登録</h1>
        <p className="text-sm text-slate-500 mt-1">大切な人に検診を勧めたり、あなたへの声かけをお願いできます</p>
      </div>

      {/* Concept explanation */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-medium text-emerald-800">「あなたがいないと困る」という声かけ</p>
          <p className="text-xs text-emerald-700">
            行政からの通知よりも、家族や友人からの一言が行動を変えます。登録した人に検診の案内を送ったり、逆にあなたへの声かけをお願いすることができます。
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white rounded-lg p-2.5 text-center">
              <p className="text-xs font-medium text-slate-700">あなた → 大切な人</p>
              <p className="text-xs text-slate-500">検診を勧める</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 text-center">
              <p className="text-xs font-medium text-slate-700">大切な人 → あなた</p>
              <p className="text-xs text-slate-500">受診を応援してもらう</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* People list */}
      {people.length > 0 ? (
        <div className="space-y-3">
          {people.map((p) => (
            <Card key={p.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                    {RELATIONSHIP_EMOJI[p.relationship]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{p.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {RELATIONSHIP_LABELS[p.relationship]}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.contactType === "phone" ? "📞" : p.contactType === "line" ? "💬" : "📧"}
                      {" "}{p.contact}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors text-sm"
                  >
                    削除
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <a
                    href={p.contactType === "phone" ? `tel:${p.contact}` : `sms:${p.contact}`}
                    className="flex-1 text-center py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                  >
                    📨 検診を勧める
                  </a>
                  <Link href="/notify" className="flex-1">
                    <button className="w-full py-2 rounded-lg border border-emerald-600 text-emerald-700 text-xs font-medium hover:bg-emerald-50 transition-colors">
                      🔔 声かけを依頼
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-400">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-sm">まだ登録されていません</p>
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium text-slate-800">新しく登録する</h3>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">お名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：田中 太郎"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">関係性</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(RELATIONSHIP_LABELS) as [RelationshipType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setRelationship(key)}
                    className={`text-xs px-2 py-2 rounded-lg border transition-all text-left ${
                      relationship === key
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {RELATIONSHIP_EMOJI[key]} {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">連絡先の種類</label>
              <div className="flex gap-2">
                {(["phone", "line", "email"] as ContactType[]).map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setContactType(ct)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                      contactType === ct
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {ct === "phone" ? "電話" : ct === "line" ? "LINE" : "メール"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">
                {contactType === "phone" ? "電話番号" : contactType === "line" ? "LINE ID" : "メールアドレス"}
              </label>
              <input
                type={contactType === "email" ? "email" : "tel"}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={contactType === "phone" ? "090-XXXX-XXXX" : contactType === "line" ? "@example" : "example@email.com"}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">キャンセル</Button>
              <Button
                onClick={handleAdd}
                disabled={!name || !contact}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                登録する
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
        >
          + 信頼する人を追加
        </Button>
      )}

      <Link href="/notify">
        <Button variant="outline" className="w-full rounded-xl">
          通知を送る →
        </Button>
      </Link>
    </div>
  );
}
