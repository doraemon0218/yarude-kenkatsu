"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUser } from "@/lib/store";
import { getRecommendedScreenings } from "@/lib/screening-data";
import type { ScreeningRecommendation, UserProfile } from "@/lib/types";

const KADOMA_LINKS = [
  {
    label: "がん検診予約（集団検診）",
    url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/2/4105.html",
    icon: "🔬",
    note: "WEB予約「アイテル」対応",
  },
  {
    label: "予防接種案内",
    url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/kenko/7/index.html",
    icon: "💉",
    note: "HPVワクチン・インフルエンザ等",
  },
  {
    label: "特定健診（メタボ健診）",
    url: "https://www.city.kadoma.osaka.jp/kenko_fukushi/hoken/21293.html",
    icon: "📋",
    note: "国民健康保険加入者向け",
  },
];

const COST_TABLE: Record<string, { cost: string; note?: string }> = {
  colon: { cost: "300円" },
  lung: { cost: "100円" },
  gastric: { cost: "800円" },
  breast: { cost: "1,200〜1,500円", note: "年齢により異なる" },
  cervical: { cost: "500円" },
};

export default function LetterContent() {
  const searchParams = useSearchParams();
  const fromName = searchParams.get("from") ?? "";
  const [user, setUser] = useState<UserProfile | null>(null);
  const [screenings, setScreenings] = useState<ScreeningRecommendation[]>([]);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setUser(u);
      setScreenings(getRecommendedScreenings(u.age, u.gender));
    } else {
      setScreenings(getRecommendedScreenings(45, "male"));
    }
  }, []);

  const generateAndDownloadPDF = async () => {
    if (!letterRef.current) return;
    setPdfGenerating(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(letterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageHeight = pdf.internal.pageSize.getHeight() - 20;
      let yOffset = 10;
      let remainingHeight = imgHeight;
      let sourceY = 0;
      while (remainingHeight > 0) {
        const sliceHeight = Math.min(remainingHeight, pageHeight);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceHeight / imgWidth) * canvas.width;
        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
        const imgData = sliceCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 10, yOffset, imgWidth, sliceHeight);
        sourceY += sliceCanvas.height;
        remainingHeight -= sliceHeight;
        if (remainingHeight > 0) {
          pdf.addPage();
          yOffset = 10;
        }
      }
      const filename = fromName
        ? `がん検診案内_${fromName}より.pdf`
        : "がん検診案内_YARUDE健活.pdf";
      pdf.save(filename);
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="space-y-0 max-w-2xl mx-auto">
      {/* Print / PDF hint */}
      <div className="bg-slate-100 rounded-xl px-4 py-2 flex items-center justify-between mb-4 print:hidden gap-2 flex-wrap">
        <span className="text-xs text-slate-500">メールに添付するPDFを作成できます</span>
        <div className="flex items-center gap-2">
          <button
            onClick={generateAndDownloadPDF}
            disabled={pdfGenerating}
            className="text-xs bg-violet-600 hover:bg-violet-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {pdfGenerating ? "生成中…" : "📄 PDFをダウンロード"}
          </button>
          <button
            onClick={() => window.print()}
            className="text-xs text-emerald-700 font-medium hover:underline"
          >
            🖨️ 印刷
          </button>
        </div>
      </div>

      {/* Letter body */}
      <div ref={letterRef} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:shadow-none print:border-slate-300">

        {/* Header */}
        <div className="bg-emerald-600 text-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">💚</div>
            <div>
              <p className="text-emerald-100 text-sm">
                {fromName ? `${fromName}さんから` : "YARUDE健活から"}のご案内
              </p>
              <h1 className="text-xl font-bold">あなたへのがん検診のご案内</h1>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Greeting */}
          <div className="text-sm text-slate-700 leading-relaxed space-y-2 border-b border-slate-100 pb-5">
            {fromName && (
              <p className="font-medium">
                {fromName}さんより、大切なご連絡が届いています。
              </p>
            )}
            <p>
              がんは、早期発見できれば多くの場合が治ります。<br />
              厚生労働省の指針に基づき、あなたに受けていただきたい検診をお知らせします。
            </p>
            <p className="text-slate-500">
              門真市では低負担（100〜1,500円程度）でがん検診が受けられます。<br />
              ぜひ今年度中に予約してみてください。
            </p>
          </div>

          {/* Recommended screenings */}
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-3">
              📋 受けていただきたい検診
              {user && (
                <span className="text-sm font-normal text-slate-500 ml-2">
                  （{user.age}歳・{user.gender === "male" ? "男性" : "女性"}）
                </span>
              )}
            </h2>
            <div className="space-y-2">
              {screenings.map((s) => {
                const cost = COST_TABLE[s.id];
                return (
                  <div key={s.id} className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800">{s.cancerType}検診</span>
                        <Badge variant="outline" className="text-xs bg-white border-emerald-200 text-emerald-700">
                          {s.intervalLabel}
                        </Badge>
                        {cost && (
                          <Badge variant="outline" className="text-xs bg-white border-amber-200 text-amber-700">
                            門真市 {cost.cost}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{s.description}</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{s.plainLanguage}</p>
                      {cost?.note && (
                        <p className="text-xs text-slate-400 mt-0.5">※ {cost.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              ※ 70歳以上・市民税非課税世帯・生活保護受給者は費用免除。
            </p>
          </div>

          {/* Kadoma links */}
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-3">🏛️ 門真市での受け方</h2>
            <div className="space-y-2">
              {KADOMA_LINKS.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-3 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 group-hover:text-emerald-700">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500">{item.note}</p>
                    <p className="text-xs text-emerald-600 mt-0.5 truncate">{item.url}</p>
                  </div>
                  <span className="text-slate-300 group-hover:text-emerald-500 flex-shrink-0 mt-1">→</span>
                </a>
              ))}
            </div>
            <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-xs font-medium text-slate-700">📞 健康増進課（成人保健グループ）</p>
              <p className="text-xs text-slate-600 mt-0.5">
                <a href="tel:06-6904-6400" className="text-emerald-600 font-medium hover:underline">
                  06-6904-6400
                </a>
                　平日 9:00〜17:30
              </p>
              <p className="text-xs text-slate-400">〒571-0064 門真市御堂町14-1 保健福祉センター4階</p>
            </div>
          </div>

          {/* Evidence note */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-medium text-blue-800 mb-1">📚 根拠について</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              この案内は厚生労働省「がん予防重点健康教育及びがん検診実施のための指針」（2023年改訂）に基づいています。
              「受けると、がんで亡くなる確率が下がる」と科学的に確かめられた検診のみを掲載しています。
            </p>
            <a
              href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/gan/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
            >
              🔗 厚生労働省がん検診情報
            </a>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              YARUDE健活 ｜ 門真市共創プロジェクト
            </p>
            <Link href="/" className="text-xs text-emerald-600 hover:underline mt-1 inline-block">
              自分の検診も確認する → yarude-kenkatsu.vercel.app
            </Link>
          </div>
        </div>
      </div>

      {/* CTA for new users */}
      <div className="mt-4 space-y-2 print:hidden">
        <Link href="/">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            自分の検診を調べる（無料・登録なし）
          </Button>
        </Link>
        <p className="text-xs text-center text-slate-400">
          年齢と性別を入れるだけ。門真市での受け方もわかります。
        </p>
      </div>

      <style>{`
        @media print {
          header, footer, nav { display: none !important; }
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
