"use client";

// やることリストPDF：Canvasに直接描いてjsPDFに貼る（日本語フォント埋め込み不要・html2canvas非依存）
import type { UserProfile } from "./types";
import {
  buildActionSteps,
  buildFuturePlan,
  fiscalYearLabel,
  getBmiInfo,
  isDoneThisYear,
  KADOMA_HEALTH_PHONE,
  type Plan,
} from "./plan-data";
import { INSIGHTS } from "./insight-data";
import { buildGameState } from "./game-data";

const W = 1240; // A4 @150dpi
const H = 1754;
const M = 80;
const FONT = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif';
const C = {
  text: "#1e293b",
  sub: "#475569",
  faint: "#94a3b8",
  line: "#e2e8f0",
  brand: "#059669",
  brandBg: "#ecfdf5",
  todo: "#ea580c",
  todoBg: "#fff7ed",
  self: "#7c3aed",
};

class Pager {
  pages: HTMLCanvasElement[] = [];
  ctx!: CanvasRenderingContext2D;
  y = M;

  constructor() {
    this.newPage();
  }

  newPage() {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = "top";
    this.pages.push(c);
    this.ctx = ctx;
    this.y = M;
  }

  ensure(h: number) {
    if (this.y + h > H - M - 40) this.newPage();
  }

  font(size: number, bold = false) {
    this.ctx.font = `${bold ? "bold " : ""}${size}px ${FONT}`;
  }

  // 日本語はスペースで区切れないので1文字ずつ折り返す
  wrap(text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    let line = "";
    for (const ch of text) {
      if (this.ctx.measureText(line + ch).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else line += ch;
    }
    if (line) lines.push(line);
    return lines;
  }

  text(text: string, x: number, size: number, color: string, opts: { bold?: boolean; maxWidth?: number; lh?: number } = {}) {
    this.font(size, opts.bold);
    const lines = this.wrap(text, opts.maxWidth ?? W - M - x);
    const lh = opts.lh ?? Math.round(size * 1.5);
    this.ensure(lines.length * lh);
    this.ctx.fillStyle = color;
    for (const l of lines) {
      this.ctx.fillText(l, x, this.y);
      this.y += lh;
    }
  }

  rect(x: number, y: number, w: number, h: number, fill?: string, stroke?: string, r = 12) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  heading(label: string, color: string) {
    this.ensure(90);
    this.y += 24;
    this.rect(M, this.y, 10, 40, color, undefined, 4);
    this.font(36, true);
    this.ctx.fillStyle = C.text;
    this.ctx.fillText(label, M + 26, this.y);
    this.y += 64;
  }
}

export async function downloadTodoPdf(user: UserProfile, plan: Plan): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const p = new Pager();
  const ctx = () => p.ctx;
  const now = new Date();
  const steps = buildActionSteps(plan, now);
  const future = buildFuturePlan(plan, user);
  const bmi = getBmiInfo(user);
  const todoCount = plan.states.filter((s) => s.status === "todo").length;
  const okCount = plan.states.filter((s) => s.status === "ok").length;
  const game = buildGameState(plan, user);

  // ヘッダー
  p.rect(0, 0, W, 210, C.brand, undefined, 0);
  p.y = 50;
  p.text("YARUDE健活", M, 28, "#d1fae5", { bold: true });
  p.text("わたしの健診 やることリスト", M, 54, "#ffffff", { bold: true });
  p.y = 230;
  p.text(
    `${user.age}歳・${user.gender === "male" ? "男性" : "女性"}　｜　${fiscalYearLabel(plan.thisFY)}　｜　作成日 ${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`,
    M,
    26,
    C.sub
  );
  p.y += 6;
  p.text(`今年度やること ${todoCount}件　／　できている ${okCount}件`, M, 32, C.todo, { bold: true });
  p.text(
    `健診クエスト：いまのランク「${game.rankName}」（カバー率 ${game.coverage}%）${game.nextRankName ? `　あと${game.toNextRank}件で「${game.nextRankName}」` : ""}`,
    M,
    26,
    "#b45309",
    { bold: true }
  );
  if (bmi) {
    p.y += 4;
    p.text(`身長 ${user.heightCm}cm・体重 ${user.weightKg}kg → BMI ${bmi.bmi}（${bmi.label}）　${bmi.advice}`, M, 24, C.sub);
  }

  // いつ・何をする
  p.heading("いつ・何をする（今年度）", C.todo);
  if (steps.length === 0) {
    p.text("今年度にやることは、すべてできています。", M, 30, C.brand, { bold: true });
  }
  steps.forEach((step, i) => {
    const itemLines = step.items.length;
    p.ensure(150 + Math.min(itemLines, 1) * 130);
    const top = p.y;
    // 月バッジ
    p.rect(M, top, 150, 96, i === 0 ? C.todo : C.todoBg, C.todo);
    p.font(36, true);
    ctx().fillStyle = i === 0 ? "#ffffff" : C.todo;
    ctx().textAlign = "center";
    ctx().fillText(step.monthLabel, M + 75, top + 12);
    p.font(22);
    ctx().fillText(step.relative, M + 75, top + 58);
    ctx().textAlign = "left";

    const x = M + 180;
    p.y = top;
    p.text(`STEP ${i + 1}　${step.title}`, x, 32, C.text, { bold: true });
    p.text(step.detail, x, 24, C.sub);
    if (step.phone) p.text(`電話：門真市 健康増進課 ${step.phone}（平日）`, x, 24, C.brand, { bold: true });
    p.y = Math.max(p.y, top + 100) + 8;

    for (const s of step.items) {
      const prep = step.checkable ? INSIGHTS[s.item.id]?.burden.prep : undefined;
      const done = isDoneThisYear(s, plan.thisFY);
      p.ensure(prep ? 130 : 96);
      const rowTop = p.y;
      p.rect(x, rowTop + 2, 34, 34, done ? C.brand : "#ffffff", done ? C.brand : C.sub, 4);
      if (done) {
        p.font(28, true);
        ctx().fillStyle = "#ffffff";
        ctx().fillText("✓", x + 6, rowTop + 4);
      }
      p.y = rowTop;
      p.text(s.item.name, x + 52, 28, C.text, { bold: true, maxWidth: 520 });
      const afterName = p.y;
      p.y = rowTop;
      p.font(24, true);
      ctx().fillStyle = s.item.kind === "public" ? C.brand : C.self;
      ctx().fillText(`${s.item.kind === "public" ? "市の補助" : "自費"} ${s.item.cost}`, x + 600, rowTop + 4);
      p.y = afterName;
      if (step.checkable || step.phone) p.text(`申込・受診先：${s.item.where}`, x + 52, 22, C.sub);
      if (prep) p.text(`準備：${prep}`, x + 52, 22, C.todo);
      if (step.checkable)
        p.text(
          done && s.lastRecord
            ? `受けた：${s.lastRecord.replace("-", "年")}月`
            : "受けた日　　　　年　　　月　　　日",
          x + 52,
          22,
          done ? C.brand : C.faint
        );
      p.y += 10;
    }
    p.y += 16;
    ctx().strokeStyle = C.line;
    ctx().lineWidth = 2;
    ctx().beginPath();
    ctx().moveTo(M, p.y);
    ctx().lineTo(W - M, p.y);
    ctx().stroke();
    p.y += 20;
  });

  // できていること
  const ok = plan.states.filter((s) => s.status === "ok");
  if (ok.length > 0) {
    p.heading("できていること", C.brand);
    for (const s of ok) {
      p.text(`✓ ${s.item.name}　${s.headline}`, M + 10, 26, C.text);
    }
  }

  // 来年度以降
  p.heading("来年度からの予定", C.brand);
  for (const f of future) {
    const names = f.items.map((it) => it.name.replace(/（.*?）/g, "")).join("・") || "予定なし";
    p.ensure(80);
    const top = p.y;
    p.font(26, true);
    ctx().fillStyle = C.brand;
    ctx().fillText(`${f.fy}年度（${f.age}歳）`, M + 10, top);
    p.text(names, M + 290, 24, C.text, { maxWidth: W - M - (M + 290) });
    p.y = Math.max(p.y, top + 40) + 8;
  }

  // フッター（全ページ）
  p.pages.forEach((c, i) => {
    const fctx = c.getContext("2d")!;
    fctx.font = `20px ${FONT}`;
    fctx.fillStyle = C.faint;
    fctx.textBaseline = "top";
    fctx.fillText(
      `問い合わせ：門真市 健康増進課 ${KADOMA_HEALTH_PHONE}（平日）　最新のプラン：yarude-kenkatsu.vercel.app/plan`,
      M,
      H - M - 10
    );
    fctx.fillText(
      `この表は医師の診断の代わりではありません。気になる症状があれば検診を待たずに受診してください。　${i + 1}/${p.pages.length}`,
      M,
      H - M + 20
    );
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  p.pages.forEach((c, i) => {
    if (i > 0) pdf.addPage();
    pdf.addImage(c.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297);
  });
  pdf.save(`健診やることリスト_${plan.thisFY}年度.pdf`);
}
