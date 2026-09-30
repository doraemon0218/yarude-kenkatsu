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
} as const;

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
