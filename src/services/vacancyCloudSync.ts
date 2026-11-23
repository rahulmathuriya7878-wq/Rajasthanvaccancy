import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { CategoryType, VacancyItem } from '../types';

export const VACANCY_OVERRIDES_COLLECTION = 'vacancy_overrides';

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const VALID_CATEGORIES: ReadonlySet<string> = new Set([
  'latest_job',
  'admit_card',
  'result',
  'answer_key',
  'syllabus',
  'scheme',
  'upcoming',
  'ugc_net',
  'exam_date',
  'news',
]);

export interface CloudVacancyOverridesMap {
  overrides: Record<string, VacancyItem>;
  deletedIds: string[];
}

export interface CloudSyncResult {
  synced: boolean;
  reason?: 'auth_required' | 'permission_denied' | 'invalid_id' | 'quota_exceeded' | 'error';
  message?: string;
}

/**
 * Recursively converts JS objects into Firestore-safe native Maps & Lists:
 * - Strips undefined properties
 * - Wraps nested arrays (e.g., tableData.rows: string[][]) in native { __fsRow: true, cells: [...] } Maps
 *   because Firestore forbids direct arrays-inside-arrays.
 */
function encodeValueForFirestore(value: unknown, insideArray = false): unknown {
  if (value === undefined) return null;
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (Array.isArray(value)) {
    const encodedItems = value
      .filter((item) => item !== undefined)
      .map((item) => encodeValueForFirestore(item, true));
    if (insideArray) {
      return { __fsRow: true, cells: encodedItems };
    }
    return encodedItems;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined || typeof v === 'function') continue;
      out[k] = encodeValueForFirestore(v, false);
    }
    return out;
  }
  return String(value);
}

/**
 * Recursively restores Firestore-encoded nested row maps ({ __fsRow: true, cells: [...] })
 * back into native JS arrays.
 */
function decodeValueFromFirestore(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => decodeValueFromFirestore(item));
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (obj.__fsRow === true && Array.isArray(obj.cells)) {
      return obj.cells.map((item) => decodeValueFromFirestore(item));
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = decodeValueFromFirestore(v);
    }
    return out;
  }
  return value;
}

function sanitizeCategory(cat?: string): CategoryType {
  if (cat && VALID_CATEGORIES.has(cat)) {
    return cat as CategoryType;
  }
  return 'latest_job';
}

function sanitizeString(val: unknown, maxLen: number): string {
  const s = typeof val === 'string' ? val : val == null ? '' : String(val);
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

export function subscribeVacancyOverrides(
  onUpdate: (data: CloudVacancyOverridesMap) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, VACANCY_OVERRIDES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const overrides: Record<string, VacancyItem> = {};
      const deletedIds: string[] = [];

      snapshot.forEach((docSnap) => {
        const raw = docSnap.data();
        const vacancyId = typeof raw.vacancyId === 'string' ? raw.vacancyId : docSnap.id;
        if (!vacancyId) return;

        if (raw.isDeleted === true) {
          deletedIds.push(vacancyId);
          return;
        }

        if (raw.payload && typeof raw.payload === 'object') {
          const decoded = decodeValueFromFirestore(raw.payload) as VacancyItem;
          if (decoded && typeof decoded === 'object') {
            overrides[vacancyId] = {
              ...decoded,
              id: vacancyId,
            };
          }
        }
      });

      onUpdate({ overrides, deletedIds });
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, VACANCY_OVERRIDES_COLLECTION);
      } catch (wrappedErr) {
        if (onError) onError(wrappedErr as Error);
      }
    }
  );
}

export async function saveVacancyOverrideToCloud(
  vacancy: VacancyItem
): Promise<CloudSyncResult> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    return {
      synced: false,
      reason: 'auth_required',
      message: 'Google एडमिन लॉगिन आवश्यक है ताकि अपडेट सभी फोन पर दिखे।',
    };
  }

  const vacancyId = sanitizeString(vacancy.id, 128).trim();
  if (!vacancyId || !VALID_ID_REGEX.test(vacancyId)) {
    return {
      synced: false,
      reason: 'invalid_id',
      message: 'अमान्य पोस्ट ID।',
    };
  }

  const docPath = `${VACANCY_OVERRIDES_COLLECTION}/${vacancyId}`;
  const docRef = doc(db, VACANCY_OVERRIDES_COLLECTION, vacancyId);

  const sanitizedPayload = encodeValueForFirestore({
    ...vacancy,
    id: vacancyId,
    updatedAt: new Date().toISOString().split('T')[0],
  }) as Record<string, unknown>;

  try {
    let existingCreatedAt: unknown = null;
    try {
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists()) {
        existingCreatedAt = existingSnap.data()?.createdAt || null;
      }
    } catch (readErr) {
      handleFirestoreError(readErr, OperationType.GET, docPath);
    }

    const record = {
      vacancyId,
      isDeleted: false,
      title: sanitizeString(vacancy.title || vacancy.titleHi || vacancyId, 500),
      titleHi: sanitizeString(vacancy.titleHi || vacancy.title || vacancyId, 500),
      category: sanitizeCategory(vacancy.category),
      payload: sanitizedPayload,
      updatedByUid: user.uid,
      createdAt: existingCreatedAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, record);
    return { synced: true };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    try {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        docPath
      );
    } catch {
      // Structured error logged via handleFirestoreError
    }

    if (rawMessage.toLowerCase().includes('quota exceeded')) {
      return {
        synced: false,
        reason: 'quota_exceeded',
        message: 'Firestore दैनिक कोटा समाप्त हो गया है। कल पुनः प्रयास करें।',
      };
    }

    if (
      rawMessage.toLowerCase().includes('permission') ||
      rawMessage.toLowerCase().includes('insufficient')
    ) {
      return {
        synced: false,
        reason: 'permission_denied',
        message: 'क्लाउड अपडेट की अनुमति केवल अधिकृत एडमिन Google खाते (rahulmathuriya7878@gmail.com) को है।',
      };
    }

    return {
      synced: false,
      reason: 'error',
      message: rawMessage,
    };
  }
}

export async function markVacancyDeletedInCloud(
  vacancyIdRaw: string,
  existingVacancy?: VacancyItem
): Promise<CloudSyncResult> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    return {
      synced: false,
      reason: 'auth_required',
      message: 'पोस्ट को सभी फोन से हटाने के लिए Google एडमिन लॉगिन आवश्यक है।',
    };
  }

  const vacancyId = sanitizeString(vacancyIdRaw, 128).trim();
  if (!vacancyId || !VALID_ID_REGEX.test(vacancyId)) {
    return {
      synced: false,
      reason: 'invalid_id',
      message: 'अमान्य पोस्ट ID।',
    };
  }

  const docPath = `${VACANCY_OVERRIDES_COLLECTION}/${vacancyId}`;
  const docRef = doc(db, VACANCY_OVERRIDES_COLLECTION, vacancyId);

  try {
    let existingCreatedAt: unknown = null;
    try {
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists()) {
        existingCreatedAt = existingSnap.data()?.createdAt || null;
      }
    } catch (readErr) {
      handleFirestoreError(readErr, OperationType.GET, docPath);
    }

    await setDoc(docRef, {
      vacancyId,
      isDeleted: true,
      title: sanitizeString(existingVacancy?.title || vacancyId, 500),
      titleHi: sanitizeString(existingVacancy?.titleHi || vacancyId, 500),
      category: sanitizeCategory(existingVacancy?.category),
      payload: {},
      updatedByUid: user.uid,
      createdAt: existingCreatedAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { synced: true };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    try {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } catch {
      // Structured error logged
    }
    return {
      synced: false,
      reason: rawMessage.toLowerCase().includes('permission') ? 'permission_denied' : 'error',
      message: rawMessage,
    };
  }
}
