'use client';

import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  sanitizeNotificationPreferences,
  sanitizeSavedAlerts,
  type NotificationDeliveryPreferences,
  type SavedSearchAlert,
} from '../utils/jobAlertEngine';

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export interface CloudAlertPreferencesSnapshot {
  savedAlerts: SavedSearchAlert[];
  preferences: NotificationDeliveryPreferences;
  readNotificationIds: string[];
}

export async function loadUserAlertPreferencesFromCloud(
  user: User
): Promise<CloudAlertPreferencesSnapshot | null> {
  if (!user || !user.uid || !VALID_ID_REGEX.test(user.uid) || user.uid.length > 128) {
    return null;
  }

  const path = `user_alert_preferences/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'user_alert_preferences', user.uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      savedAlerts: sanitizeSavedAlerts(Array.isArray(data?.savedAlerts) ? data.savedAlerts : []),
      preferences: sanitizeNotificationPreferences(data?.preferences),
      readNotificationIds: Array.isArray(data?.readNotificationIds)
        ? data.readNotificationIds
            .filter((id: unknown): id is string => typeof id === 'string' && id.length <= 160)
            .slice(0, 200)
        : [],
    };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.GET, path);
    } catch {
      // Logged with structured FirestoreErrorInfo
    }
    return null;
  }
}

export async function saveUserAlertPreferencesToCloud(
  user: User,
  payload: CloudAlertPreferencesSnapshot
): Promise<boolean> {
  if (!user || !user.email || !user.uid || !VALID_ID_REGEX.test(user.uid) || user.uid.length > 128) {
    return false;
  }

  const path = `user_alert_preferences/${user.uid}`;
  const docRef = doc(db, 'user_alert_preferences', user.uid);
  const safeAlerts = sanitizeSavedAlerts(payload.savedAlerts);
  const safePrefs = sanitizeNotificationPreferences(payload.preferences);
  const safeReadIds = Array.from(new Set(payload.readNotificationIds))
    .filter((id) => typeof id === 'string' && id.length > 0 && id.length <= 160)
    .slice(0, 200);

  try {
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      await updateDoc(docRef, {
        savedAlerts: safeAlerts,
        preferences: safePrefs,
        readNotificationIds: safeReadIds,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        userId: user.uid,
        savedAlerts: safeAlerts,
        preferences: safePrefs,
        readNotificationIds: safeReadIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Logged with structured FirestoreErrorInfo
    }
    return false;
  }
}
