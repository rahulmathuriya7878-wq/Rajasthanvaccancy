'use client';

import type { User } from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function sanitizeText(value: unknown, maxLen: number): string {
  const s = typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

export async function syncUserProfileToFirestore(user: User): Promise<void> {
  if (!user || !user.emailVerified || !user.email) return;
  if (!VALID_ID_REGEX.test(user.uid) || user.uid.length > 128) return;

  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  const email = sanitizeText(user.email, 254);
  const displayName = user.displayName ? sanitizeText(user.displayName, 120) : undefined;
  const photoURL = user.photoURL ? sanitizeText(user.photoURL, 500) : undefined;

  if (email.length < 3) return;

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const updatePayload: Record<string, unknown> = {
        email,
        updatedAt: serverTimestamp(),
      };
      if (displayName) updatePayload.displayName = displayName;
      if (photoURL) updatePayload.photoURL = photoURL;
      await updateDoc(userRef, updatePayload);
    } else {
      const createPayload: Record<string, unknown> = {
        uid: user.uid,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (displayName) createPayload.displayName = displayName;
      if (photoURL) createPayload.photoURL = photoURL;
      await setDoc(userRef, createPayload);
    }
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    } catch {
      // Logged with structured FirestoreErrorInfo
    }
  }
}
