import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  getDefaultPersistentResultTemplate,
  normalizePersistentResultTemplate,
  RESULT_DETAILS_TABLE_TEMPLATE,
  type PersistentResultTemplate,
} from '../utils/adminPostUtils';

export const ADMIN_TEMPLATES_COLLECTION = 'admin_templates';
export const RESULT_DETAILS_TEMPLATE_ID = RESULT_DETAILS_TABLE_TEMPLATE.id;
export const LOCAL_RESULT_TEMPLATE_STORAGE_KEY = 'raj_admin_result_details_template_v1';

export type TemplateSyncSource = 'default' | 'local' | 'cloud';

export interface TemplateSaveResult {
  synced: boolean;
  source: TemplateSyncSource;
  template: PersistentResultTemplate;
  reason?: 'auth_required' | 'permission_denied' | 'quota_exceeded' | 'error';
  message?: string;
}

export function loadCachedResultDetailsTemplate(): {
  template: PersistentResultTemplate;
  isCustomizedLocally: boolean;
} {
  const defaults = getDefaultPersistentResultTemplate();
  if (typeof window === 'undefined') {
    return { template: defaults, isCustomizedLocally: false };
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_RESULT_TEMPLATE_STORAGE_KEY);
    if (!raw) {
      return { template: defaults, isCustomizedLocally: false };
    }
    const parsed = JSON.parse(raw) as Partial<PersistentResultTemplate>;
    return {
      template: normalizePersistentResultTemplate(parsed),
      isCustomizedLocally: true,
    };
  } catch {
    return { template: defaults, isCustomizedLocally: false };
  }
}

export function saveCachedResultDetailsTemplate(template: PersistentResultTemplate): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized = normalizePersistentResultTemplate(template);
    window.localStorage.setItem(LOCAL_RESULT_TEMPLATE_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Non-blocking storage fallback
  }
}

function decodeFirestoreTemplateDoc(raw: Record<string, unknown>): PersistentResultTemplate {
  const rawRows = Array.isArray(raw.rows) ? raw.rows : [];
  const defaultRows: string[][] = rawRows
    .map((entry) => {
      if (Array.isArray(entry)) {
        return entry.map((cell) => String(cell ?? ''));
      }
      if (entry && typeof entry === 'object' && Array.isArray((entry as { cells?: unknown }).cells)) {
        return ((entry as { cells: unknown[] }).cells).map((cell) => String(cell ?? ''));
      }
      return null;
    })
    .filter((row): row is string[] => Array.isArray(row));

  return normalizePersistentResultTemplate({
    templateId: typeof raw.templateId === 'string' ? raw.templateId : RESULT_DETAILS_TEMPLATE_ID,
    title: typeof raw.title === 'string' ? raw.title : undefined,
    titleHi: typeof raw.titleHi === 'string' ? raw.titleHi : undefined,
    content: typeof raw.content === 'string' ? raw.content : undefined,
    contentHi: typeof raw.contentHi === 'string' ? raw.contentHi : undefined,
    headers: Array.isArray(raw.headers)
      ? raw.headers.map((h) => String(h ?? ''))
      : undefined,
    defaultRows: defaultRows.length > 0 ? defaultRows : undefined,
    autoGenerateOnResult:
      typeof raw.autoGenerateOnResult === 'boolean' ? raw.autoGenerateOnResult : true,
  });
}

export function subscribeResultDetailsTemplateFromCloud(
  onUpdate: (template: PersistentResultTemplate, source: 'cloud' | 'default') => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docPath = `${ADMIN_TEMPLATES_COLLECTION}/${RESULT_DETAILS_TEMPLATE_ID}`;
  const docRef = doc(db, ADMIN_TEMPLATES_COLLECTION, RESULT_DETAILS_TEMPLATE_ID);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(getDefaultPersistentResultTemplate(), 'default');
        return;
      }
      const decoded = decodeFirestoreTemplateDoc(snapshot.data() as Record<string, unknown>);
      saveCachedResultDetailsTemplate(decoded);
      onUpdate(decoded, 'cloud');
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, docPath);
      } catch (wrappedErr) {
        if (onError) onError(wrappedErr as Error);
      }
    }
  );
}

export async function saveResultDetailsTemplateToCloud(
  rawTemplate: Partial<PersistentResultTemplate>
): Promise<TemplateSaveResult> {
  const normalized = normalizePersistentResultTemplate(rawTemplate);
  saveCachedResultDetailsTemplate(normalized);

  const user = auth.currentUser;
  if (!user || !user.email) {
    return {
      synced: false,
      source: 'local',
      template: normalized,
      reason: 'auth_required',
      message: 'Template saved locally on this browser. Sign in with Google Admin to sync across devices.',
    };
  }

  const docPath = `${ADMIN_TEMPLATES_COLLECTION}/${RESULT_DETAILS_TEMPLATE_ID}`;
  const docRef = doc(db, ADMIN_TEMPLATES_COLLECTION, RESULT_DETAILS_TEMPLATE_ID);

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

    const encodedRows = normalized.defaultRows.slice(0, 50).map((row) => ({
      cells: normalized.headers.map((_, idx) => String(row[idx] ?? '').slice(0, 500)),
    }));

    await setDoc(docRef, {
      templateId: RESULT_DETAILS_TEMPLATE_ID,
      title: normalized.title,
      titleHi: normalized.titleHi,
      content: normalized.content,
      contentHi: normalized.contentHi,
      headers: normalized.headers,
      rows: encodedRows,
      autoGenerateOnResult: normalized.autoGenerateOnResult,
      updatedByUid: user.uid,
      createdAt: existingCreatedAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      synced: true,
      source: 'cloud',
      template: normalized,
    };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    try {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } catch {
      // Structured diagnostic logged via handleFirestoreError
    }

    if (rawMessage.toLowerCase().includes('quota exceeded')) {
      return {
        synced: false,
        source: 'local',
        template: normalized,
        reason: 'quota_exceeded',
        message: 'Saved locally. Firestore daily quota exceeded; cloud sync will work after quota reset.',
      };
    }

    if (
      rawMessage.toLowerCase().includes('permission') ||
      rawMessage.toLowerCase().includes('insufficient')
    ) {
      return {
        synced: false,
        source: 'local',
        template: normalized,
        reason: 'permission_denied',
        message: 'Saved locally. Cloud template sync requires an authorized Admin Google account.',
      };
    }

    return {
      synced: false,
      source: 'local',
      template: normalized,
      reason: 'error',
      message: rawMessage,
    };
  }
}

export async function resetResultDetailsTemplateInCloud(): Promise<TemplateSaveResult> {
  const defaults = getDefaultPersistentResultTemplate();
  return saveResultDetailsTemplateToCloud(defaults);
}
