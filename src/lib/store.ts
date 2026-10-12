"use client";

import type {
  UserProfile,
  TrustedPerson,
  NotificationLog,
} from "./types";

const KEYS = {
  user: "yarude_user",
  trustedPeople: "yarude_trusted_people",
  notificationLogs: "yarude_notification_logs",
  screeningRecords: "yarude_screening_records",
} as const;

// 検診・検査ごとの最終受診月（"YYYY-MM"）
export type ScreeningRecords = Record<string, string>;

function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUser(): UserProfile | null {
  return getItem<UserProfile>(KEYS.user);
}

export function saveUser(user: UserProfile): void {
  setItem(KEYS.user, user);
}

export function getTrustedPeople(): TrustedPerson[] {
  return getItem<TrustedPerson[]>(KEYS.trustedPeople) ?? [];
}

export function saveTrustedPeople(people: TrustedPerson[]): void {
  setItem(KEYS.trustedPeople, people);
}

export function addTrustedPerson(person: TrustedPerson): void {
  const existing = getTrustedPeople();
  setItem(KEYS.trustedPeople, [...existing, person]);
}

export function removeTrustedPerson(id: string): void {
  const existing = getTrustedPeople();
  setItem(
    KEYS.trustedPeople,
    existing.filter((p) => p.id !== id)
  );
}

export function getScreeningRecords(): ScreeningRecords {
  return getItem<ScreeningRecords>(KEYS.screeningRecords) ?? {};
}

export function saveScreeningRecords(records: ScreeningRecords): void {
  setItem(KEYS.screeningRecords, records);
}

export function setScreeningRecord(itemId: string, yearMonth: string | null): ScreeningRecords {
  const next = { ...getScreeningRecords() };
  if (yearMonth) next[itemId] = yearMonth;
  else delete next[itemId];
  saveScreeningRecords(next);
  return next;
}

// 複数まとめて記録（null は記録を消す）
export function updateScreeningRecords(updates: Record<string, string | null>): ScreeningRecords {
  const next = { ...getScreeningRecords() };
  for (const [id, ym] of Object.entries(updates)) {
    if (ym) next[id] = ym;
    else delete next[id];
  }
  saveScreeningRecords(next);
  return next;
}

export function getNotificationLogs(): NotificationLog[] {
  return getItem<NotificationLog[]>(KEYS.notificationLogs) ?? [];
}

export function addNotificationLog(log: NotificationLog): void {
  const existing = getNotificationLogs();
  setItem(KEYS.notificationLogs, [...existing, log]);
}

export function updateNotificationLog(
  id: string,
  updates: Partial<NotificationLog>
): void {
  const existing = getNotificationLogs();
  setItem(
    KEYS.notificationLogs,
    existing.map((l) => (l.id === id ? { ...l, ...updates } : l))
  );
}

export function getFunnelStats() {
  const logs = getNotificationLogs();
  const groups = [
    "self_only",
    "self_and_family",
    "community",
  ] as const;

  return groups.map((group) => {
    const gl = logs.filter((l) => l.notificationGroup === group);
    return {
      group,
      sent: gl.length,
      opened: gl.filter((l) => l.openedAt).length,
      scheduled: gl.filter((l) => l.scheduledAt).length,
      screened: gl.filter((l) => l.screenedAt).length,
    };
  });
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
