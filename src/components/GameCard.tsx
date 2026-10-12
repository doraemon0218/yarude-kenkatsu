"use client";

import { useEffect, useRef, useState } from "react";
import { HealthAvatar } from "@/components/HealthAvatar";
import { RANKS, type AvatarStyle, type GameState } from "@/lib/game-data";

export function GameCard({ game, onStyleChange }: { game: GameState; onStyleChange: (s: AvatarStyle) => void }) {
  const prevRank = useRef(game.rankIndex);
  const [rankUp, setRankUp] = useState<string | null>(null);

  useEffect(() => {
    if (game.rankIndex > prevRank.current) {
      setRankUp(game.rankName);
      const t = setTimeout(() => setRankUp(null), 3500);
      prevRank.current = game.rankIndex;
      return () => clearTimeout(t);
    }
    prevRank.current = game.rankIndex;
  }, [game.rankIndex, game.rankName]);

  const equippedIds = new Set(game.equipped.map((e) => e.id));

  return (
    <section className="relative rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white p-4 space-y-3 overflow-hidden">
      {rankUp && (
        <div className="absolute inset-x-0 top-0 z-10 bg-amber-400 text-amber-950 text-center text-sm font-bold py-2 animate-pulse" role="status">
          🎉 ランクアップ！「{rankUp}」になりました
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-amber-900">🏆 健診クエスト</h2>
        <div className="flex rounded-full border border-amber-300 bg-white p-0.5 text-xs" role="group" aria-label="キャラクターを選ぶ">
          {(["hero", "dress"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStyleChange(s)}
              aria-pressed={game.style === s}
              className={`px-2.5 py-1 rounded-full font-medium ${game.style === s ? "bg-amber-500 text-white" : "text-amber-800"}`}
            >
              {s === "hero" ? "⚔️ 勇者" : "👗 ドレス"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 bg-white rounded-2xl border border-amber-200">
          <HealthAvatar style={game.style} equipped={equippedIds} rankIndex={game.rankIndex} final={game.final.unlocked} size={120} />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-xs text-amber-700">いまのランク</p>
          <p className="text-2xl font-bold text-amber-900 leading-tight">{game.rankName}</p>
          <p className="text-xs text-slate-600">
            健診カバー率 <span className="font-bold text-slate-800">{game.coverage}%</span>（{game.covered.length}/{game.target.length}）
          </p>
          <div className="h-2.5 bg-amber-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${game.coverage}%` }} />
          </div>
          {game.nextRankName ? (
            <p className="text-xs font-medium text-orange-700">
              あと{game.toNextRank}件受けると「{game.nextRankName}」に！
            </p>
          ) : (
            <p className="text-xs font-bold text-amber-700">最高ランク達成！この状態を毎年キープしよう</p>
          )}
        </div>
      </div>

      {/* ランクの階段 */}
      <ol className="flex items-center justify-between gap-0.5" aria-label="ランク一覧">
        {RANKS.map((r, i) => (
          <li key={r.min} className="flex-1 text-center">
            <div
              className={`h-1.5 rounded-full ${i <= game.rankIndex ? "bg-amber-500" : "bg-slate-200"}`}
              title={r[game.style]}
            />
            <p className={`text-[9px] mt-1 leading-tight ${i === game.rankIndex ? "text-amber-800 font-bold" : "text-slate-400"}`}>
              {r[game.style]}
            </p>
          </li>
        ))}
      </ol>

      {/* 装備 */}
      <div className="grid grid-cols-4 gap-1.5">
        {game.equipped.map((e) => (
          <div key={e.id} className="bg-white border border-amber-300 rounded-xl p-1.5 text-center">
            <p className="text-xl" aria-hidden>
              {e.icon}
            </p>
            <p className="text-[10px] font-bold text-amber-900 leading-tight">{e.name}</p>
          </div>
        ))}
        {game.locked.map((e) => (
          <div key={e.id} className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-1.5 text-center">
            <p className="text-xl opacity-30" aria-hidden>
              🔒
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">{e.name}</p>
          </div>
        ))}
        <div
          className={`rounded-xl p-1.5 text-center border ${
            game.final.unlocked ? "bg-amber-100 border-amber-400" : "bg-slate-50 border-dashed border-slate-300"
          }`}
        >
          <p className={`text-xl ${game.final.unlocked ? "" : "opacity-30"}`} aria-hidden>
            {game.final.unlocked ? game.final.icon : "🔒"}
          </p>
          <p className={`text-[10px] leading-tight ${game.final.unlocked ? "font-bold text-amber-900" : "text-slate-400"}`}>
            {game.final.name}
          </p>
        </div>
      </div>
      <p className="text-[11px] text-slate-500">
        受けるべき検診・検査を受けるほど装備が増えます。期限が切れると「やること」に戻るので、毎年続けて装備をキープしましょう。
      </p>
    </section>
  );
}
