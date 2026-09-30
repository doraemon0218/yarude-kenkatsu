import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YARUDE健活 | がん検診受診支援",
  description: "あなたと大切な人を守る、根拠に基づくがん検診受診サポート",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50">
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-700">YARUDE健活</span>
              <span className="text-xs text-slate-400 hidden sm:block">門真市共創プロジェクト</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/demo" className="text-xs px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium">
                デモ
              </Link>
              <Link href="/screening" className="text-xs px-2.5 py-1.5 rounded-full text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                検診
              </Link>
              <Link href="/trusted-people" className="text-xs px-2.5 py-1.5 rounded-full text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                信頼する人
              </Link>
              <Link href="/admin" className="text-xs px-2.5 py-1.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
                管理
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">{children}</main>
        <footer className="border-t border-slate-200 bg-white mt-auto">
          <div className="max-w-3xl mx-auto px-4 py-4 text-xs text-slate-400 text-center">
            検診情報は厚生労働省「がん予防重点健康教育及びがん検診実施のための指針」に基づきます。
          </div>
        </footer>
      </body>
    </html>
  );
}
