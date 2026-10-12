import type { AvatarStyle } from "@/lib/game-data";

// 装備IDの集合と最終報酬の有無からキャラクターを描く（SVGの重ね合わせ）
export function HealthAvatar({
  style,
  equipped,
  rankIndex,
  final,
  size = 160,
}: {
  style: AvatarStyle;
  equipped: Set<string>;
  rankIndex: number;
  final: boolean;
  size?: number;
}) {
  const has = (id: string) => equipped.has(id);
  const skin = "#f6d2b4";
  const hair = style === "dress" ? "#6b3e26" : "#3f2a1d";

  // ドレスはランクが上がるほど華やかに
  const dressFills = ["#cbd5e1", "#e9d5ff", "#f9a8d4", "#f472b6", "#ec4899", "url(#dressGrad)", "url(#dressGrad)"];
  const dressFill = dressFills[Math.min(rankIndex, dressFills.length - 1)];

  return (
    <svg viewBox="0 0 160 200" width={size} height={(size * 200) / 160} role="img" aria-label="あなたのキャラクター">
      <defs>
        <radialGradient id="aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dressGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="55%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* 地面 */}
      <ellipse cx="80" cy="188" rx="46" ry="7" fill="#0f172a" opacity="0.08" />

      {/* 最終報酬：オーラ */}
      {final && <circle cx="80" cy="100" r="78" fill="url(#aura)" />}

      {style === "hero" ? (
        <g>
          {/* マント */}
          {has("cape") && <path d="M52 70 L108 70 L120 176 L40 176 Z" fill="#dc2626" />}
          {/* 脚 */}
          <rect x="64" y="140" width="12" height="36" rx="4" fill="#78716c" />
          <rect x="84" y="140" width="12" height="36" rx="4" fill="#78716c" />
          {/* ブーツ */}
          {has("boots") && (
            <g fill="#7c2d12">
              <rect x="61" y="164" width="17" height="16" rx="4" />
              <rect x="82" y="164" width="17" height="16" rx="4" />
            </g>
          )}
          {/* 胴：村人の服 → よろい */}
          <rect x="56" y="72" width="48" height="72" rx="12" fill={has("armor") ? "url(#silver)" : "#a16207"} />
          {has("armor") && (
            <g>
              <rect x="56" y="104" width="48" height="8" fill="#eab308" />
              <circle cx="80" cy="88" r="7" fill="#2563eb" stroke="#eab308" strokeWidth="2" />
            </g>
          )}
          {!has("armor") && <rect x="56" y="112" width="48" height="6" fill="#57534e" />}
          {/* 腕 */}
          <rect x="42" y="78" width="14" height="44" rx="7" fill={has("armor") ? "#cbd5e1" : skin} />
          <rect x="104" y="78" width="14" height="44" rx="7" fill={has("armor") ? "#cbd5e1" : skin} />
          {/* 剣 */}
          {has("sword") && (
            <g>
              <rect x="116" y="40" width="7" height="72" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
              <rect x="107" y="108" width="25" height="6" rx="2" fill="#ca8a04" />
              <rect x="116" y="114" width="7" height="14" rx="2" fill="#78350f" />
            </g>
          )}
          {/* 盾 */}
          {has("shield") && (
            <g>
              <path d="M24 86 L58 86 L58 116 Q41 136 24 116 Z" fill="#1d4ed8" stroke="#eab308" strokeWidth="3" />
              <path d="M41 94 L41 124 M30 104 L52 104" stroke="#fde047" strokeWidth="4" />
            </g>
          )}
          {/* 頭 */}
          <circle cx="80" cy="50" r="22" fill={skin} />
          {!has("helmet") && <path d="M58 46 Q60 24 80 24 Q100 24 102 46 Q92 34 80 36 Q68 34 58 46 Z" fill={hair} />}
          {has("helmet") && (
            <g>
              <path d="M56 50 Q56 22 80 22 Q104 22 104 50 L98 50 Q96 34 80 34 Q64 34 62 50 Z" fill="url(#silver)" stroke="#64748b" strokeWidth="1.5" />
              <path d="M80 22 Q88 6 100 10 Q90 14 84 24" fill="#dc2626" />
            </g>
          )}
          {/* 王冠 */}
          {final && <path d="M62 26 L66 10 L74 20 L80 6 L86 20 L94 10 L98 26 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />}
        </g>
      ) : (
        <g>
          {/* ヴェール */}
          {has("train") && <path d="M58 40 Q30 110 30 180 L130 180 Q130 110 102 40 Z" fill="#e9d5ff" opacity="0.55" />}
          {/* 長い髪（後ろ） */}
          <path d="M56 50 Q54 92 64 100 L96 100 Q106 92 104 50 Z" fill={hair} />
          {/* ドレス */}
          <path d="M62 74 L98 74 L104 110 L128 176 L32 176 L56 110 Z" fill={dressFill} />
          {rankIndex >= 3 && (
            <path d="M32 176 Q42 166 52 176 Q62 166 72 176 Q82 166 92 176 Q102 166 112 176 Q122 166 128 176" fill="none" stroke="#fff" strokeWidth="3" />
          )}
          {rankIndex >= 4 && (
            <path d="M56 110 Q80 122 104 110" fill="none" stroke="#fde68a" strokeWidth="4" />
          )}
          {rankIndex >= 5 &&
            [
              [60, 140],
              [96, 132],
              [78, 158],
              [108, 160],
              [50, 162],
            ].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="#fff" />)}
          {/* 靴 */}
          {has("shoes") && (
            <g fill="#bae6fd" stroke="#38bdf8" strokeWidth="1.5">
              <ellipse cx="68" cy="180" rx="9" ry="4" />
              <ellipse cx="92" cy="180" rx="9" ry="4" />
            </g>
          )}
          {/* 腕・手袋 */}
          <rect x="46" y="78" width="12" height="40" rx="6" fill={has("gloves") ? "#ffffff" : skin} stroke={has("gloves") ? "#e2e8f0" : "none"} />
          <rect x="102" y="78" width="12" height="40" rx="6" fill={has("gloves") ? "#ffffff" : skin} stroke={has("gloves") ? "#e2e8f0" : "none"} />
          {/* ステッキ */}
          {has("wand") && (
            <g>
              <rect x="111" y="62" width="4" height="58" rx="2" fill="#a78bfa" />
              <path d="M113 44 L117 54 L128 55 L119 61 L122 72 L113 66 L104 72 L107 61 L98 55 L109 54 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            </g>
          )}
          {/* 頭 */}
          <circle cx="80" cy="50" r="22" fill={skin} />
          <path d="M58 48 Q60 24 80 24 Q100 24 102 48 Q96 36 84 34 Q72 40 58 48 Z" fill={hair} />
          {/* 首飾り */}
          {has("necklace") && (
            <g>
              <path d="M66 74 Q80 88 94 74" fill="none" stroke="#f8fafc" strokeWidth="3" strokeDasharray="1 3" strokeLinecap="round" />
              <circle cx="80" cy="84" r="4" fill="#38bdf8" stroke="#fff" strokeWidth="1.5" />
            </g>
          )}
          {/* ティアラ */}
          {has("tiara") && (
            <g>
              <path d="M64 30 Q80 18 96 30 L92 22 L86 26 L80 14 L74 26 L68 22 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="80" cy="20" r="2.5" fill="#f472b6" />
            </g>
          )}
          {/* 最終報酬：きらめき */}
          {final &&
            [
              [30, 40],
              [134, 36],
              [24, 120],
              [140, 116],
            ].map(([x, y]) => (
              <path key={`${x}-${y}`} d={`M${x} ${y - 8} L${x + 2} ${y - 2} L${x + 8} ${y} L${x + 2} ${y + 2} L${x} ${y + 8} L${x - 2} ${y + 2} L${x - 8} ${y} L${x - 2} ${y - 2} Z`} fill="#facc15" />
            ))}
        </g>
      )}

      {/* 顔 */}
      <circle cx="72" cy="52" r="2.5" fill="#1e293b" />
      <circle cx="88" cy="52" r="2.5" fill="#1e293b" />
      <path d={rankIndex >= 2 ? "M72 61 Q80 68 88 61" : "M74 62 Q80 65 86 62"} fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="66" cy="58" r="3" fill="#fda4af" opacity="0.6" />
      <circle cx="94" cy="58" r="3" fill="#fda4af" opacity="0.6" />
    </svg>
  );
}
