import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { CategoryType, VacancyItem } from '../types';

export const JOBS_COLLECTION = 'jobs';
const VACANCY_OVERRIDES_COLLECTION = 'vacancy_overrides';

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

export interface FirestoreJobDatesMap {
  startDate: string;
  lastDate: string;
  notificationDate: string;
  examDate: string;
}

export interface FirestoreJobLinksMap {
  applyOnlineUrl: string;
  notificationPdfUrl: string;
  officialWebsiteUrl: string;
}

export interface FirestoreJobDocument {
  jobId: string;
  slug: string;
  title: string;
  titleHi: string;
  category: CategoryType;
  totalPosts: string;
  qualification: string;
  dates: FirestoreJobDatesMap;
  links: FirestoreJobLinksMap;
  description: string;
  status: string;
  payload: Record<string, unknown>;
  updatedByUid: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface CloudVacancyOverridesMap {
  overrides: Record<string, VacancyItem>;
  deletedIds: string[];
}

export interface CloudSyncResult {
  synced: boolean;
  collection?: string;
  docId?: string;
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

/**
 * Maps a VacancyItem (or PostBuilderClient form payload) into the strict schema
 * of the Firestore `jobs` collection (`/jobs/{jobId}`).
 */
export function mapVacancyToFirestoreJobDoc(
  vacancy: VacancyItem,
  updatedByUid: string,
  existingCreatedAt?: unknown
): FirestoreJobDocument {
  const jobId = sanitizeString(vacancy.id, 128).trim();
  const title = sanitizeString(vacancy.title || vacancy.titleHi || jobId, 500).trim() || jobId;
  const titleHi = sanitizeString(vacancy.titleHi || vacancy.title || jobId, 500).trim() || jobId;
  const totalPosts =
    sanitizeString(vacancy.totalPosts ?? 'विभिन्न पद', 120).trim() || 'विभिन्न पद';
  const qualLevels = Array.isArray(vacancy.qualification) ? vacancy.qualification.join(', ') : '';
  const qualDetail = vacancy.qualificationDetailsHi || vacancy.qualificationDetails || '';
  const qualification =
    sanitizeString(
      qualLevels && qualDetail ? `${qualLevels} — ${qualDetail}` : qualLevels || qualDetail || 'As per notification',
      500
    ).trim() || 'As per notification';

  const imp = vacancy.importantDates || {};
  const dates: FirestoreJobDatesMap = {
    startDate: sanitizeString(imp.applyStartDate || '', 120),
    lastDate: sanitizeString(imp.applyLastDate || '', 120),
    notificationDate: sanitizeString(imp.notificationDate || '', 120),
    examDate: sanitizeString(imp.examDate || imp.admitCardDate || '', 120),
  };

  const links: FirestoreJobLinksMap = {
    applyOnlineUrl: sanitizeString(vacancy.officialLinks?.applyOnlineUrl || '', 500),
    notificationPdfUrl: sanitizeString(vacancy.officialLinks?.notificationPdfUrl || '', 500),
    officialWebsiteUrl: sanitizeString(vacancy.officialLinks?.officialWebsiteUrl || '', 500),
  };

  const sanitizedPayload = encodeValueForFirestore({
    ...vacancy,
    id: jobId,
    updatedAt: new Date().toISOString().split('T')[0],
  }) as Record<string, unknown>;

  return {
    jobId,
    slug: jobId,
    title,
    titleHi,
    category: sanitizeCategory(vacancy.category),
    totalPosts,
    qualification,
    dates,
    links,
    description: sanitizeString(vacancy.descriptionHi || vacancy.description || '', 20000),
    status: sanitizeString(vacancy.status || 'active', 64) || 'active',
    payload: sanitizedPayload,
    updatedByUid,
    createdAt: existingCreatedAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function subscribeVacancyOverrides(
  onUpdate: (data: CloudVacancyOverridesMap) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  let jobsMap: Record<string, VacancyItem> = {};
  let overridesMap: Record<string, VacancyItem> = {};
  let deletedIdsList: string[] = [];

  const emitMerged = () => {
    const mergedOverrides: Record<string, VacancyItem> = {
      ...overridesMap,
      ...jobsMap,
    };
    const deletedSet = new Set(deletedIdsList);
    for (const delId of deletedSet) {
      delete mergedOverrides[delId];
    }
    onUpdate({
      overrides: mergedOverrides,
      deletedIds: Array.from(deletedSet),
    });
  };

  const jobsColRef = collection(db, JOBS_COLLECTION);
  const unsubJobs = onSnapshot(
    jobsColRef,
    (snapshot) => {
      const nextJobs: Record<string, VacancyItem> = {};
      snapshot.forEach((docSnap) => {
        const raw = docSnap.data();
        const jobId = typeof raw.jobId === 'string' ? raw.jobId : docSnap.id;
        if (!jobId) return;

        if (raw.payload && typeof raw.payload === 'object') {
          const decoded = decodeValueFromFirestore(raw.payload) as VacancyItem;
          if (decoded && typeof decoded === 'object') {
            nextJobs[jobId] = {
              ...decoded,
              id: jobId,
              title: typeof raw.title === 'string' && raw.title ? raw.title : decoded.title,
              titleHi: typeof raw.titleHi === 'string' && raw.titleHi ? raw.titleHi : decoded.titleHi,
              category: sanitizeCategory(typeof raw.category === 'string' ? raw.category : decoded.category),
            };
          }
        }
      });
      jobsMap = nextJobs;
      emitMerged();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, JOBS_COLLECTION);
      } catch (wrappedErr) {
        if (onError) onError(wrappedErr as Error);
      }
    }
  );

  const overridesColRef = collection(db, VACANCY_OVERRIDES_COLLECTION);
  const unsubOverrides = onSnapshot(
    overridesColRef,
    (snapshot) => {
      const nextOverrides: Record<string, VacancyItem> = {};
      const nextDeleted: string[] = [];

      snapshot.forEach((docSnap) => {
        const raw = docSnap.data();
        const vacancyId = typeof raw.vacancyId === 'string' ? raw.vacancyId : docSnap.id;
        if (!vacancyId) return;

        if (raw.isDeleted === true) {
          nextDeleted.push(vacancyId);
          return;
        }

        if (raw.payload && typeof raw.payload === 'object') {
          const decoded = decodeValueFromFirestore(raw.payload) as VacancyItem;
          if (decoded && typeof decoded === 'object') {
            nextOverrides[vacancyId] = {
              ...decoded,
              id: vacancyId,
            };
          }
        }
      });

      overridesMap = nextOverrides;
      deletedIdsList = nextDeleted;
      emitMerged();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, VACANCY_OVERRIDES_COLLECTION);
      } catch (wrappedErr) {
        if (onError) onError(wrappedErr as Error);
      }
    }
  );

  return () => {
    unsubJobs();
    unsubOverrides();
  };
}

/**
 * Saves or updates a job post directly in the Firestore `jobs` collection (`/jobs/{jobId}`)
 * and keeps `/vacancy_overrides/{jobId}` synchronized.
 */
export async function saveVacancyOverrideToCloud(
  vacancy: VacancyItem
): Promise<CloudSyncResult> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    return {
      synced: false,
      collection: JOBS_COLLECTION,
      reason: 'auth_required',
      message: 'Google एडमिन लॉगिन आवश्यक है ताकि अपडेट सभी फोन पर दिखे।',
    };
  }

  const jobId = sanitizeString(vacancy.id, 128).trim();
  if (!jobId || !VALID_ID_REGEX.test(jobId)) {
    return {
      synced: false,
      collection: JOBS_COLLECTION,
      reason: 'invalid_id',
      message: 'अमान्य पोस्ट ID (Slug)।',
    };
  }

  const jobDocPath = `${JOBS_COLLECTION}/${jobId}`;
  const jobDocRef = doc(db, JOBS_COLLECTION, jobId);

  try {
    let existingJobCreatedAt: unknown = null;
    try {
      const existingJobSnap = await getDoc(jobDocRef);
      if (existingJobSnap.exists()) {
        existingJobCreatedAt = existingJobSnap.data()?.createdAt || null;
      }
    } catch (readErr) {
      handleFirestoreError(readErr, OperationType.GET, jobDocPath);
    }

    const jobRecord = mapVacancyToFirestoreJobDoc(vacancy, user.uid, existingJobCreatedAt);
    await setDoc(jobDocRef, jobRecord);

    // Also keep vacancy_overrides synchronized for backward compatibility
    const overridePath = `${VACANCY_OVERRIDES_COLLECTION}/${jobId}`;
    const overrideRef = doc(db, VACANCY_OVERRIDES_COLLECTION, jobId);
    try {
      let existingOverrideCreatedAt: unknown = null;
      const existingOverrideSnap = await getDoc(overrideRef);
      if (existingOverrideSnap.exists()) {
        existingOverrideCreatedAt = existingOverrideSnap.data()?.createdAt || null;
      }
      await setDoc(overrideRef, {
        vacancyId: jobId,
        isDeleted: false,
        title: jobRecord.title,
        titleHi: jobRecord.titleHi,
        category: jobRecord.category,
        payload: jobRecord.payload,
        updatedByUid: user.uid,
        createdAt: existingOverrideCreatedAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (overrideErr) {
      try {
        handleFirestoreError(overrideErr, OperationType.WRITE, overridePath);
      } catch {
        // Primary jobs collection write succeeded
      }
    }

    return {
      synced: true,
      collection: JOBS_COLLECTION,
      docId: jobId,
    };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    try {
      handleFirestoreError(error, OperationType.WRITE, jobDocPath);
    } catch {
      // Structured error logged via handleFirestoreError
    }

    if (rawMessage.toLowerCase().includes('quota exceeded')) {
      return {
        synced: false,
        collection: JOBS_COLLECTION,
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
        collection: JOBS_COLLECTION,
        reason: 'permission_denied',
        message: 'क्लाउड अपडेट की अनुमति केवल अधिकृत एडमिन Google खाते (rahulmathuriya7878@gmail.com) को है।',
      };
    }

    return {
      synced: false,
      collection: JOBS_COLLECTION,
      reason: 'error',
      message: rawMessage,
    };
  }
}

/**
 * Deletes a job post from the Firestore `jobs` collection (`/jobs/{jobId}`)
 * and marks it deleted in `/vacancy_overrides/{jobId}` so even built-in posts are hidden across devices.
 */
export async function markVacancyDeletedInCloud(
  vacancyIdRaw: string,
  existingVacancy?: VacancyItem
): Promise<CloudSyncResult> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    return {
      synced: false,
      collection: JOBS_COLLECTION,
      reason: 'auth_required',
      message: 'पोस्ट को सभी फोन से हटाने के लिए Google एडमिन लॉगिन आवश्यक है।',
    };
  }

  const jobId = sanitizeString(vacancyIdRaw, 128).trim();
  if (!jobId || !VALID_ID_REGEX.test(jobId)) {
    return {
      synced: false,
      collection: JOBS_COLLECTION,
      reason: 'invalid_id',
      message: 'अमान्य पोस्ट ID।',
    };
  }

  const jobDocPath = `${JOBS_COLLECTION}/${jobId}`;
  const jobDocRef = doc(db, JOBS_COLLECTION, jobId);

  try {
    await deleteDoc(jobDocRef);

    // Also record deletion tombstone in vacancy_overrides so default initial posts stay deleted
    const overridePath = `${VACANCY_OVERRIDES_COLLECTION}/${jobId}`;
    const overrideRef = doc(db, VACANCY_OVERRIDES_COLLECTION, jobId);
    try {
      let existingCreatedAt: unknown = null;
      const existingSnap = await getDoc(overrideRef);
      if (existingSnap.exists()) {
        existingCreatedAt = existingSnap.data()?.createdAt || null;
      }
      await setDoc(overrideRef, {
        vacancyId: jobId,
        isDeleted: true,
        title: sanitizeString(existingVacancy?.title || jobId, 500),
        titleHi: sanitizeString(existingVacancy?.titleHi || jobId, 500),
        category: sanitizeCategory(existingVacancy?.category),
        payload: {},
        updatedByUid: user.uid,
        createdAt: existingCreatedAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (overrideErr) {
      try {
        handleFirestoreError(overrideErr, OperationType.WRITE, overridePath);
      } catch {
        // Primary delete from jobs succeeded
      }
    }

    return {
      synced: true,
      collection: JOBS_COLLECTION,
      docId: jobId,
    };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    try {
      handleFirestoreError(error, OperationType.DELETE, jobDocPath);
    } catch {
      // Structured error logged
    }
    return {
      synced: false,
      collection: JOBS_COLLECTION,
      reason: rawMessage.toLowerCase().includes('permission') ? 'permission_denied' : 'error',
      message: rawMessage,
    };
  }
}
