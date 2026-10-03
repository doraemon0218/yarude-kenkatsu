# YARUDE健活 仕様・議事録

> このファイルはプロジェクトの仕様・設計意図・議事録を集約します。
> 開発セッションごとに更新してください。

---

## プロジェクト概要

**サービス名**：YARUDE健活
**目的**：がん検診受診率の向上（行動変容 × 社会的つながり × EBPM）
**対象自治体（初期）**：大阪府門真市（共創プロジェクト）
**想定ユーザー**：検診を受けていない40〜60代の市民（特に自営業・中小企業勤務者）

---

## コアコンセプト

1. **人間関係を活用したナッジ**：本人への通知だけでなく、大切な人への勧奨・逆勧奨
2. **ナッジ心理学**：損失回避メッセージ（プロスペクト理論）の活用
3. **EBPM（証拠に基づく政策立案）**：通知方法・タイミングをRCT的に分類し受診率を観察
4. **根拠に基づく情報提供**：厚労省指針 + USPSTF + WHO の比較を一般市民向けに提示

---

## 機能一覧（実装済み）

### ユーザーフロー
- [ x ] 3ステップオンボーディング（年齢・性別 → 職業・家族構成・健康意識 → 受診歴・障壁）
- [ x ] 推奨がん検診表示（厚労省指針ベース、引用リンク付き）
- [ x ] 最寄り施設表示（電話・申込リンク）
- [ x ] 信頼する人の登録（家族・友人・同僚・先輩・後輩・旧友・近隣住民）
- [ x ] ナッジ通知送信（LINE/SMS/メール選択、メッセージ種類・タイミング選択）
- [ x ] メール通知：PDFダウンロード（html2canvas + jsPDF）→ 添付フロー

### 情報提供
- [ x ] 世界標準比較ページ（/standards）：日本 vs USPSTF vs WHO の一覧表 + 展開詳細
- [ x ] 「世界標準で受けるには（自費）」：肺がんLDCT・子宮頸がんHPV検査の受け方・費用・リンク
- [ x ] 案内レターページ（/letter）：印刷・PDF保存対応、パーソナライズ検診内容

### 行政向け
- [ x ] 行政職員ダッシュボード（/admin）：ファネル・時系列・背景因子分析・RCT設計タブ
- [ x ] 門真市公式ページへのクイックリンク

### デモ
- [ x ] 2人のデモユーザー（田中健一・佐藤誠）、互いに信頼する人として登録
- [ x ] ワンクリックログイン
- [ x ] 10ステップの体験タイムライン

---

## データモデル

### UserProfile
```typescript
{
  id, age, gender,
  occupation: "employee_large" | "employee_small" | "self_employed" | "part_time" | "other",
  familyStructure: "alone" | "couple" | "family_with_children" | "multi_generation" | "other",
  healthAwarenessScore: 1〜5,
  hasWorkplaceCheckup?: boolean | null,  // 職場健診の有無（構造的障壁分析用）
  lastScreeningYear?: number,
  barriers: BarrierType[],  // 受診しない理由（カテゴリ分類済み、17種類）
  notificationGroup: "self_only" | "self_and_family" | "community",  // RCT第1軸
  messageFrame?: "loss_frame" | "gain_frame" | "social_norm" | "authority",  // RCT第2軸
  registeredAt: string,
}
```

### TrustedPerson
```typescript
{
  id, name,
  relationship: "spouse"|"parent"|"child"|"sibling"|"friend"|"old_friend"|"colleague"|"senior"|"junior"|"neighbor",
  contact: string,  // メールアドレスまたは電話番号
  contactType: "email" | "phone",
  addedAt: string,
}
```

### NotificationLog
```typescript
{
  id, userId, screeningId,
  notificationGroup,
  method: "line" | "sms" | "email",
  sentAt, openedAt?, scheduledAt?, screenedAt?,
}
```

---

## RCT設計（2×2 Factorial）

| アーム | 通知対象 | メッセージフレーム | 割付 |
|-------|---------|----------------|------|
| A1 | 本人のみ | 損失回避型 | 25% |
| A2 | 本人のみ | 利得強調型 | 25% |
| B1 | 本人＋信頼する人 | 損失回避型 | 25% |
| B2 | 本人＋信頼する人 | 利得強調型 | 25% |

**第1軸（通知対象）**：self_only / self_and_family
**第2軸（メッセージフレーム）**：loss_frame / gain_frame / social_norm / authority（登録時ランダム割付）
**観察指標**：通知開封率・レターページ訪問率・受診完了率
**タイミング変数**：今すぐ / 1ヶ月前 / 2週間前 / 当日朝
**必要サンプル数**：α=0.05・検出力80%で各アーム約60名（合計240名）

---

## 世界標準との乖離

| がん種 | 日本 | 世界標準 | 乖離レベル |
|------|------|--------|---------|
| 大腸がん | FOBT・40歳〜 | 内視鏡/FOBT・45歳〜 | 軽微 |
| 肺がん | X線・40歳〜 | LDCT・50歳〜喫煙者 | **重要** |
| 胃がん | 内視鏡・50歳〜 | 非推奨（東アジア除く） | 軽微 |
| 乳がん | マンモ・40歳〜・2年 | マンモ・40歳〜・2年 | 一致 |
| 子宮頸がん | 細胞診・20歳〜・2年 | HPV検査・30歳〜・5〜10年 | **重要** |

---

## 他自治体展開に向けた設計方針（TODO）

現在は門真市のURLや価格をコード内にハードコードしているが、以下の構造に移行することで他自治体へ展開可能にする。

### 方針
- `src/lib/municipality-data.ts` に自治体設定を集約
- 環境変数 `NEXT_PUBLIC_MUNICIPALITY_ID` で切り替え
- または `/[city]/` サブルートで複数自治体に対応

### 自治体設定スキーマ（案）
```typescript
interface MunicipalityConfig {
  id: string;               // "kadoma", "osaka", etc.
  name: string;             // "門真市"
  prefecture: string;       // "大阪府"
  screeningCosts: Record<string, string>;   // { colon: "300円", ... }
  links: {
    cancerScreening: string;
    vaccination: string;
    specificCheckup: string;
    contact: { name: string; phone: string; address: string; hours: string; }
  };
  freeEligibility?: string;  // "70歳以上・非課税世帯は無料"
}
```

### 優先対応ファイル
1. `src/lib/municipality-data.ts`（新規作成）
2. `src/app/letter/LetterContent.tsx` — KADOMA_LINKS, COST_TABLE
3. `src/app/standards/page.tsx` — Kadoma official links section
4. `src/app/facilities/page.tsx` — facility-data.ts と連動

---

## デプロイ情報

- **リポジトリ**：github.com/doraemon0218/yarude-kenkatsu
- **本番URL**：https://yarude-kenkatsu.vercel.app
- **デプロイ方法**：main ブランチへの push で Vercel が自動デプロイ

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-09-30 | 初期実装：オンボーディング・検診推奨・施設・信頼する人・通知・管理 |
| 2026-09-30 | デモページ強化：ワンクリックログイン、タイムライン |
| 2026-09-30 | 世界標準比較ページ（/standards）、案内レターページ（/letter）、PDF生成追加 |
| 2026-10-01 | /standards に一覧比較テーブル追加（視覚的負担軽減） |
| 2026-10-01 | 他自治体展開方針をSPEC.mdに記載 |
| 2026-10-03 | 障壁分析の構造的改善：17種類の障壁を6カテゴリに分類、介入マッピング追加 |
| 2026-10-03 | RCTを2×2 Factorial設計に拡張（通知対象×メッセージフレーム） |
| 2026-10-03 | オンボーディングに「職場健診の有無」質問追加、障壁をカテゴリ別グループ表示 |
| 2026-10-03 | 管理ダッシュボード「障壁分析」タブを構造的分析ビューに刷新 |
