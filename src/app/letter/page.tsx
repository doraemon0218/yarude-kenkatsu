import { Suspense } from "react";
import LetterContent from "./LetterContent";

export default function LetterPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-slate-400 text-sm">読み込み中…</div>}>
      <LetterContent />
    </Suspense>
  );
}
