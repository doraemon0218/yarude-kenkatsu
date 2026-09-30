import type { UserProfile, TrustedPerson, NotificationLog } from "./types";

export const DEMO_USERS: UserProfile[] = [
  {
    id: "demo-user-tanaka",
    age: 48,
    gender: "male",
    occupation: "self_employed",
    familyStructure: "alone",
    healthAwarenessScore: 2,
    lastScreeningYear: 2021,
    barriers: ["busy_work", "no_symptoms", "forgot"],
    notificationGroup: "self_only",
    registeredAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "demo-user-sato",
    age: 44,
    gender: "male",
    occupation: "self_employed",
    familyStructure: "family_with_children",
    healthAwarenessScore: 2,
    lastScreeningYear: undefined,
    barriers: ["busy_work", "cost_concern", "forgot"],
    notificationGroup: "self_and_family",
    registeredAt: "2026-04-01T10:00:00.000Z",
  },
];

export const DEMO_USER_META = [
  {
    id: "demo-user-tanaka",
    name: "田中 健一",
    age: 48,
    emoji: "👨‍💼",
    desc: "48歳・自営業（内装業）・一人暮らし",
    note: "最後に検診を受けたのは2021年。忙しさを理由に後回しにしている。",
    color: "blue",
  },
  {
    id: "demo-user-sato",
    name: "佐藤 誠",
    age: 44,
    emoji: "👨‍🔧",
    desc: "44歳・自営業（電気工事業）・子育て中",
    note: "がん検診を一度も受けたことがない。費用と時間が気になっている。",
    color: "orange",
  },
];

export const DEMO_TRUSTED_BY_USER: Record<string, TrustedPerson[]> = {
  "demo-user-tanaka": [
    {
      id: "tp-tanaka-to-sato",
      name: "佐藤 誠",
      relationship: "colleague",
      contact: "doraemon0218@hotmail.com",
      contactType: "email",
      addedAt: "2026-04-01T09:30:00.000Z",
    },
  ],
  "demo-user-sato": [
    {
      id: "tp-sato-to-tanaka",
      name: "田中 健一",
      relationship: "senior",
      contact: "doraemon0218@hotmail.com",
      contactType: "email",
      addedAt: "2026-04-01T10:30:00.000Z",
    },
  ],
};

export const DEMO_NOTIFICATION_LOGS: NotificationLog[] = [
  {
    id: "log-001",
    userId: "demo-user-tanaka",
    screeningId: "colon",
    notificationGroup: "self_only",
    method: "sms",
    sentAt: "2026-04-10T08:00:00.000Z",
  },
  {
    id: "log-002",
    userId: "demo-user-tanaka",
    screeningId: "lung",
    notificationGroup: "self_only",
    method: "sms",
    sentAt: "2026-04-10T08:00:00.000Z",
    openedAt: "2026-04-10T12:30:00.000Z",
  },
  {
    id: "log-003",
    userId: "demo-user-sato",
    screeningId: "colon",
    notificationGroup: "self_and_family",
    method: "line",
    sentAt: "2026-04-12T09:00:00.000Z",
    openedAt: "2026-04-12T20:00:00.000Z",
    scheduledAt: "2026-04-15T10:00:00.000Z",
  },
  {
    id: "log-004",
    userId: "demo-user-sato",
    screeningId: "lung",
    notificationGroup: "self_and_family",
    method: "line",
    sentAt: "2026-04-12T09:00:00.000Z",
    openedAt: "2026-04-12T20:00:00.000Z",
    scheduledAt: "2026-04-15T10:00:00.000Z",
    screenedAt: "2026-05-20T10:00:00.000Z",
  },
];

export const DEMO_TIMELINE = [
  {
    date: "4月1日",
    actor: "tanaka",
    action: "アプリ登録",
    detail: "年齢・職業・障壁を入力。検診推奨リストを確認。",
    type: "register",
  },
  {
    date: "4月1日",
    actor: "tanaka",
    action: "佐藤さんを登録",
    detail: "仕事仲間の佐藤さんを「信頼する人」として追加。",
    type: "add",
  },
  {
    date: "4月10日",
    actor: "tanaka",
    action: "佐藤さんへ通知送信",
    detail: "「大腸がん・肺がん検診の案内」をSMSで送信。メッセージ：「佐藤さん、一緒に今年の検診を受けに行かない？」",
    type: "notify",
  },
  {
    date: "4月10日",
    actor: "sato",
    action: "SMSを受信・開封",
    detail: "田中さんからのメッセージを確認。自分も気になっていたところだった。",
    type: "open",
  },
  {
    date: "4月12日",
    actor: "sato",
    action: "アプリ登録",
    detail: "田中さんに教えてもらいアプリ登録。検診推奨を確認し、田中さんを信頼する人として追加。",
    type: "register",
  },
  {
    date: "4月12日",
    actor: "sato",
    action: "田中さんへ返信通知",
    detail: "「田中さんも一緒に受けましょう！」とLINEで送信。",
    type: "notify",
  },
  {
    date: "4月15日",
    actor: "sato",
    action: "検診を予定登録",
    detail: "5月20日の門真市保健福祉センターの集団検診に申込。カレンダーに追加。",
    type: "schedule",
  },
  {
    date: "4月16日",
    actor: "tanaka",
    action: "田中さんも予定登録",
    detail: "佐藤さんに背中を押され、同じ検診回に申込。",
    type: "schedule",
  },
  {
    date: "5月20日",
    actor: "sato",
    action: "佐藤さん受診完了",
    detail: "大腸がん・肺がん検診を受診。人生初のがん検診。",
    type: "screened",
  },
  {
    date: "5月20日",
    actor: "tanaka",
    action: "田中さん受診完了",
    detail: "4年ぶりの受診。2人で一緒に行くことができた。",
    type: "screened",
  },
];
