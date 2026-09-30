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

export type BarrierType =
  | "busy_work"
  | "no_symptoms"
  | "afraid_of_results"
  | "cost_concern"
  | "no_information"
  | "forgot"
  | "other";

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
  lastScreeningYear?: number;
  barriers: BarrierType[];
  notificationGroup: NotificationGroupType;
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
  notes?: string;
}

export interface NotificationLog {
  id: string;
  userId: string;
  screeningId: string;
  notificationGroup: NotificationGroupType;
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
