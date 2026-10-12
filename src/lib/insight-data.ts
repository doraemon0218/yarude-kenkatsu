// 検査ごとの「受ける人の負担」と「受けるメリット」
// メリットは％ではなく「1,000人が受けると…」の人数（自然頻度）で示す。
// 生存率：全がん協 部位別臨床病期別5年相対生存率（2011–2013年診断症例、国立がん研究センター公表）
// 人数の目安：全国の市区町村検診の実績と、厚生労働省のプロセス指標基準値（要精検率・がん発見率）から概算

export type PainLevel = 0 | 1 | 2 | 3;

export const PAIN_LABELS: Record<PainLevel, string> = {
  0: "痛みなし",
  1: "少しチクッ・違和感",
  2: "少しつらい",
  3: "つらい",
};

export interface Burden {
  time: string; // 当日にかかる時間
  pain: PainLevel;
  painNote: string;
  prep: string; // 前日・当日の準備（PDFにも載せる）
  radiation?: string;
  after?: string; // 受けた後の注意
  ifPositive?: string; // 「要精密検査」になったら何をするか
}

export interface Benefit {
  headline: string; // ひとことで
  effect: string; // 検診の効果（根拠の強さも含めて）
  per?: { base: number; recall: string; found: string; foundLabel: string };
  survival?: { early: number; late: number };
  downsides: string[];
}

export interface Insight {
  burden: Burden;
  benefit: Benefit;
}

export const RADIATION_REFERENCE = "日本で普通に暮らすだけで、1年に約2.1mSvの自然放射線を浴びています。";

export const INSIGHTS: Record<string, Insight> = {
  colon: {
    burden: {
      time: "当日は提出だけ（数分）",
      pain: 0,
      painNote: "自宅で便の表面をこするだけ",
      prep: "届いたキットで、提出日の前の数日間に便を2回とる（食事制限なし）",
      ifPositive: "大腸カメラ（下剤を飲んで腸をきれいにし、日帰りで約30分）。保険診療で数千〜1万円ほど。",
    },
    benefit: {
      headline: "一番手軽で、効果がはっきりしている検診",
      effect: "毎年受けると、大腸がんで亡くなる人が約2〜3割減ることが、海外の大規模な比較試験で確かめられています。",
      per: { base: 1000, recall: "約60人", found: "約1〜2人", foundLabel: "がんが見つかる" },
      survival: { early: 98.8, late: 23.3 },
      downsides: [
        "「要精密検査」の約30人に29人は、がんではありません（痔などでも陽性になります）。",
        "1回陰性でも見逃しはあるため、毎年続けることが大切です。",
      ],
    },
  },
  lung: {
    burden: {
      time: "約5〜10分",
      pain: 0,
      painNote: "立って胸のレントゲンを撮るだけ",
      prep: "金属・ボタンのない服で。タバコを吸う人は痰の検査（3日分）が加わることも",
      radiation: "約0.06mSv（ごくわずか）",
      ifPositive: "胸のCT検査（10分ほど・痛みなし）。",
    },
    benefit: {
      headline: "肺がんは症状が出たときには進んでいることが多い",
      effect: "日本の研究では肺がんで亡くなる人を約3〜4割減らしたと報告されています（海外の試験では効果がはっきりしない結果もあります）。",
      per: { base: 10000, recall: "約170人", found: "約3〜5人", foundLabel: "がんが見つかる" },
      survival: { early: 85.6, late: 7.3 },
      downsides: [
        "小さいがんはレントゲンでは見えないことがあります。",
        "「要精密検査」の大半は、がんではありません。",
      ],
    },
  },
  gastric: {
    burden: {
      time: "約15〜20分",
      pain: 2,
      painNote: "バリウムと発泡剤を飲み、げっぷを我慢。台の上で体の向きを変えます",
      prep: "前日の夜9時以降は食べない（当日朝は水も控える）",
      radiation: "約3〜4mSv（自然に浴びる量の1〜2年分）",
      after: "下剤を飲み、水を多めに。バリウムが出るまで白い便が出ます（便秘に注意）。",
      ifPositive: "胃カメラ（口か鼻から・10分ほど。眠くなる薬を使える施設も）。",
    },
    benefit: {
      headline: "日本人に多いがん。早期ならほぼ治ります",
      effect: "日本・韓国の研究で、胃がんで亡くなる人を約3〜6割減らしたと報告されています。",
      per: { base: 1000, recall: "約60〜70人", found: "約1人", foundLabel: "がんが見つかる" },
      survival: { early: 98.7, late: 6.2 },
      downsides: [
        "検査中に気分が悪くなる・便秘になることがあります。",
        "胃カメラのほうが精度は高いですが、市の検診はバリウムです（自費なら胃カメラも選べます）。",
      ],
    },
  },
  breast: {
    burden: {
      time: "約10〜15分",
      pain: 2,
      painNote: "乳房を板ではさんで撮影。はさむ数秒間は痛いことがあります",
      prep: "生理が終わって1週間ほどの、乳房が張っていない時期がおすすめ。制汗剤は使わない",
      radiation: "約0.1〜0.4mSv（ごくわずか）",
      ifPositive: "乳房のエコー・追加のマンモグラフィ。必要なら針で組織をとる検査。",
    },
    benefit: {
      headline: "女性に一番多いがん。40〜50代に多い",
      effect: "2年に1回受けると、乳がんで亡くなる人が約2割減ることが、海外の比較試験で確かめられています。",
      per: { base: 1000, recall: "約60人", found: "約3人", foundLabel: "がんが見つかる" },
      survival: { early: 100.0, late: 38.8 },
      downsides: [
        "「要精密検査」の約20人に19人は、がんではありません。",
        "命に関わらない小さながんまで見つけて治療すること（過剰診断）が、一定数あると言われています。",
      ],
    },
  },
  cervical: {
    burden: {
      time: "約5分",
      pain: 1,
      painNote: "内診台で、子宮の入り口を細いブラシでこする。少し違和感",
      prep: "生理中は避ける。前日の性交渉・膣洗浄は控える",
      after: "少し出血することがありますが、すぐ止まります。",
      ifPositive: "拡大鏡で子宮の入り口を見て、組織を少しとる検査。",
    },
    benefit: {
      headline: "がんになる前の段階で見つけて、がんを防げる検診",
      effect: "定期的な検診で、子宮頸がんになる人・亡くなる人を大きく（7〜8割ほど）減らせたことが各国の統計で示されています。",
      per: { base: 10000, recall: "約200人", found: "約5人", foundLabel: "がんが見つかる（がんの手前の病変はもっと多く見つかります）" },
      survival: { early: 93.6, late: 26.5 },
      downsides: [
        "がんの手前の病変の多くは自然に消えますが、念のため経過観察や治療をすることがあります。",
      ],
    },
  },
  tokutei: {
    burden: {
      time: "約30〜60分",
      pain: 1,
      painNote: "採血でチクッとする以外は、測るだけ",
      prep: "前日の夜9時以降は食べない（水・お茶はOK）。朝の尿をとることも",
    },
    benefit: {
      headline: "糖尿病・高血圧・脂質異常を、症状が出る前に見つける",
      effect: "これらは自覚症状なく進み、心筋梗塞・脳卒中・腎不全の原因になります。数値が悪ければ、無料の保健指導（生活の見直しの相談）を受けられます。",
      downsides: ["結果が少し悪いだけで不安になることがありますが、多くは生活の見直しで改善できます。"],
    },
  },
  hepatitis: {
    burden: {
      time: "約5分（採血のみ）",
      pain: 1,
      painNote: "採血でチクッとするだけ",
      prep: "特になし（他の検診と一緒に受けられます）",
    },
    benefit: {
      headline: "一生に1回でOK。肝がんの原因を見つける",
      effect: "B型・C型肝炎は症状なく進み、肝硬変・肝がんの原因になります。今は飲み薬で治せる・抑えられるので、知ることに大きな意味があります。",
      downsides: [],
    },
  },
  dental: {
    burden: {
      time: "約15〜30分",
      pain: 0,
      painNote: "歯と歯ぐきを見て、器具で軽く触るだけ",
      prep: "特になし。歯みがきをしてから行きましょう",
    },
    benefit: {
      headline: "歯を残すことは、食べる力と全身の健康につながる",
      effect: "歯周病は糖尿病・心臓病・誤嚥性肺炎とも関係します。早めの治療で歯を残せます。",
      downsides: [],
    },
  },
  "self-eye": {
    burden: {
      time: "約15〜30分",
      pain: 0,
      painNote: "目に風（または器具）を当てて圧を測り、目の奥を見る",
      prep: "瞳を開く目薬を使うと4〜5時間まぶしくなります。車・自転車で行かない",
    },
    benefit: {
      headline: "失明の原因1位「緑内障」は、自分では気づけない",
      effect: "40歳以上の約20人に1人が緑内障です。早く見つけて目薬を続ければ、多くは見え方を保てます。",
      downsides: ["自費になります（約1,000〜3,000円）。"],
    },
  },
  "self-bone": {
    burden: {
      time: "約5〜10分",
      pain: 0,
      painNote: "横になる・かかとを機械に乗せるだけ",
      prep: "金属のついた服は避ける",
      radiation: "ごくわずか（胸のレントゲンより少ない）",
    },
    benefit: {
      headline: "骨折・寝たきりを防ぐ第一歩",
      effect: "骨粗しょう症は痛みなく進みます。早く分かれば、薬・食事・運動で骨折を減らせます（海外の公的機関も推奨）。",
      downsides: ["自費になります（約1,000〜3,000円）。"],
    },
  },
  "self-hearing": {
    burden: {
      time: "約10〜15分",
      pain: 0,
      painNote: "ヘッドホンで音が聞こえたらボタンを押すだけ",
      prep: "特になし",
    },
    benefit: {
      headline: "聞こえの対策は、認知症の予防にもつながる",
      effect: "聞こえにくさは、認知症の「防げる原因」の中で最も大きいもののひとつです。補聴器で会話が増え、生活が変わります。",
      downsides: ["自費になります（約1,000〜3,000円）。"],
    },
  },
};
