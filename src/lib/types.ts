export type Gender = "male" | "female";

export type OccupationType =
  | "employee_large"
  | "employee_small"
  | "self_employed"
  | "part_time"
  | "other";

export type FamilyStructure =
  | "alone"
  | "couple"
  | "family_with_children"
  | "multi_generation"
  | "other";

export type BarrierCategory =
  | "structural"
  | "economic"
  | "informational"
  | "psychological"
  | "habitual"
  | "social";

export type BarrierType =
  // 構造的・環境的
  | "no_workplace_program"
  | "no_paid_leave"
  | "access_difficulty"
  // 経済的
  | "cost_concern"
  | "cost_unknown_subsidy"
  // 情報的
  | "no_information"
  | "unsure_eligibility"
  | "unsure_how_to_apply"
  // 心理的
  | "afraid_of_results"
  | "anxiety_after_positive"
  | "fatalism"
  // 習慣・動機的
  | "busy_work"
  | "no_symptoms"
  | "forgot"
  | "no_urgency"
  // 社会的
  | "no_accompaniment"
  | "other";

// RCT第2軸：メッセージフレーム
export type MessageFrameType =
  | "loss_frame"    // 「今受けなければ…」損失回避
  | "gain_frame"    // 「受けることで…」利得強調
  | "social_norm"   // 「門真市の〇〇%が…」社会規範
  | "authority";    // 「かかりつけ医から」権威推奨

export type RelationshipType =
  | "spouse"
  | "parent"
  | "child"
  | "sibling"
  | "friend"
  | "old_friend"
  | "colleague"
  | "senior"
  | "junior"
  | "neighbor";

export type ContactType = "phone" | "line" | "email";

export type NotificationGroupType =
  | "self_only"
  | "self_and_family"
  | "community";

export type NotificationTimingType = "immediate" | "monthly" | "seasonal";

export type NotificationMethodType = "line" | "sms" | "email";

export interface UserProfile {
  id: string;
  age: number;
  gender: Gender;
  occupation: OccupationType;
  familyStructure: FamilyStructure;
  healthAwarenessScore: 1 | 2 | 3 | 4 | 5;
  hasWorkplaceCheckup?: boolean | null;
  lastScreeningYear?: number;
  barriers: BarrierType[];
  // RCT割付：2×2 factorial（通知対象 × メッセージフレーム）
  notificationGroup: NotificationGroupType;
  messageFrame?: MessageFrameType;
  registeredAt: string;
}

export interface TrustedPerson {
  id: string;
  name: string;
  relationship: RelationshipType;
  contact: string;
  contactType: ContactType;
  addedAt: string;
}

export interface Citation {
  org: string;
  orgEn?: string;
  title: string;
  year: string;
  url: string;
  grade?: string;
}

export interface ScreeningRecommendation {
  id: string;
  cancerType: string;
  cancerTypeEn: string;
  description: string;
  targetGender: "all" | "female_only";
  minAge: number;
  maxAge?: number;
  intervalMonths: number;
  intervalLabel: string;
  evidence: string;
  symptoms: string[];
  plainLanguage: string;
  citations: Citation[];
}

export type DayOfWeek = "月" | "火" | "水" | "木" | "金" | "土" | "日";

export interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  website?: string;
  applyUrl?: string;
  availableScreenings: string[];
  distanceKm: number;
  openHours: string;
  openDays: DayOfWeek[];
  hasSaturdayHours: boolean;
  hasEveningHours: boolean;
  onlineReservation: boolean;
  screeningCosts: Partial<Record<string, string>>;
  costNote?: string;
  notes?: string;
}

export interface NotificationLog {
  id: string;
  userId: string;
  screeningId: string;
  notificationGroup: NotificationGroupType;
  messageFrame?: MessageFrameType;
  method: NotificationMethodType;
  sentAt: string;
  openedAt?: string;
  scheduledAt?: string;
  screenedAt?: string;
}

export interface FunnelStats {
  group: NotificationGroupType;
  sent: number;
  opened: number;
  scheduled: number;
  screened: number;
}
