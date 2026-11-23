/**
 * Phase 0 / Phase 5 Security Rules Verification Suite (Dirty Dozen Payloads)
 * Verifies the exact boolean invariants enforced by firestore.rules.
 */

export interface MockAuth {
  uid: string;
  token: {
    email?: string;
    email_verified?: boolean;
  };
}

export interface DirtyDozenCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: MockAuth | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const VALID_CATEGORIES = new Set([
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
const BOOTSTRAPPED_ADMIN_EMAIL = 'rahulmathuriya7878@gmail.com';
const OVERRIDE_KEYS = [
  'vacancyId',
  'isDeleted',
  'title',
  'titleHi',
  'category',
  'payload',
  'updatedByUid',
  'createdAt',
  'updatedAt',
];

export function evaluateVacancyOverrideWrite(
  auth: MockAuth | null,
  docId: string,
  data: Record<string, unknown>,
  serverTime: number,
  existingData?: Record<string, unknown>
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!auth || auth.token.email_verified !== true) return 'PERMISSION_DENIED';
  if (auth.token.email !== BOOTSTRAPPED_ADMIN_EMAIL) return 'PERMISSION_DENIED';
  if (docId.length < 1 || docId.length > 128 || !VALID_ID_REGEX.test(docId)) return 'PERMISSION_DENIED';

  const keys = Object.keys(data);
  const hasAll = OVERRIDE_KEYS.every((k) => keys.includes(k));
  const hasOnly = keys.every((k) => OVERRIDE_KEYS.includes(k));
  if (!hasAll || !hasOnly) return 'PERMISSION_DENIED';

  if (data.vacancyId !== docId) return 'PERMISSION_DENIED';
  if (typeof data.isDeleted !== 'boolean') return 'PERMISSION_DENIED';
  if (typeof data.title !== 'string' || data.title.length > 500) return 'PERMISSION_DENIED';
  if (typeof data.titleHi !== 'string' || data.titleHi.length > 500) return 'PERMISSION_DENIED';
  if (typeof data.category !== 'string' || !VALID_CATEGORIES.has(data.category)) return 'PERMISSION_DENIED';
  if (typeof data.payload !== 'object' || data.payload === null || Array.isArray(data.payload)) return 'PERMISSION_DENIED';
  if (data.updatedByUid !== auth.uid) return 'PERMISSION_DENIED';
  if (data.updatedAt !== serverTime) return 'PERMISSION_DENIED';

  if (!existingData) {
    if (data.createdAt !== serverTime) return 'PERMISSION_DENIED';
  } else {
    if (data.createdAt !== existingData.createdAt) return 'PERMISSION_DENIED';
  }

  return 'ALLOW';
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated override create',
    collection: 'vacancy_overrides',
    docId: 'reet-2026',
    operation: 'create',
    auth: null,
    payload: { vacancyId: 'reet-2026', isDeleted: false, title: 'Hack', titleHi: 'Hack', category: 'latest_job', payload: {}, updatedByUid: 'anon', createdAt: 1000, updatedAt: 1000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Non-admin authenticated override create',
    collection: 'vacancy_overrides',
    docId: 'reet-2026',
    operation: 'create',
    auth: { uid: 'user-2', token: { email: 'attacker@gmail.com', email_verified: true } },
    payload: { vacancyId: 'reet-2026', isDeleted: false, title: 'Hack', titleHi: 'Hack', category: 'latest_job', payload: {}, updatedByUid: 'user-2', createdAt: 1000, updatedAt: 1000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified admin email spoofing',
    collection: 'vacancy_overrides',
    docId: 'reet-2026',
    operation: 'create',
    auth: { uid: 'spoof-1', token: { email: BOOTSTRAPPED_ADMIN_EMAIL, email_verified: false } },
    payload: { vacancyId: 'reet-2026', isDeleted: false, title: 'Spoof', titleHi: 'Spoof', category: 'latest_job', payload: {}, updatedByUid: 'spoof-1', createdAt: 1000, updatedAt: 1000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow field injection on create',
    collection: 'vacancy_overrides',
    docId: 'reet-2026',
    operation: 'create',
    auth: { uid: 'admin-1', token: { email: BOOTSTRAPPED_ADMIN_EMAIL, email_verified: true } },
    payload: { vacancyId: 'reet-2026', isDeleted: false, title: 'Valid', titleHi: 'Valid', category: 'latest_job', payload: {}, updatedByUid: 'admin-1', createdAt: 1000, updatedAt: 1000, ghostField: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow field injection on update',
    collection: 'vacancy_overrides',
    docId: 'reet-2026',
    operation: 'update',
    auth: { uid: 'admin-1', token: { email: BOOTSTRAPPED_ADMIN_EMAIL, email_verified: true } },
    payload: { vacancyId: 'reet-2026', isDeleted: false, title: 'Valid', titleHi: 'Valid', category: 'latest_job', payload: {}, updatedByUid: 'admin-1', createdAt: 900, updatedAt: 1000, hackedFlag: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Immutable createdAt tampering',
    collection: 'vacancy_overrides',
    docId: 'reet-2026',
    operation: 'update',
    auth: { uid: 'admin-1', token: { email: BOOTSTRAPPED_ADMIN_EMAIL, email_verified: true } },
    payload: { vacancyId: 'reet-2026', isDeleted: false, title: 'Valid', titleHi: 'Valid', category: 'latest_job', payload: {}, updatedByUid: 'admin-1', createdAt: 999, updatedAt: 1000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Forged client timestamp',
    collection: 'vacancy_overrides',
    docId: 'reet-2026',
    operation: 'create',
    auth: { uid: 'admin-1', token: { email: BOOTSTRAPPED_ADMIN_EMAIL, email_verified: true } },
    payload: { vacancyId: 'reet-2026', isDeleted: false, title: 'Valid', titleHi: 'Valid', category: 'latest_job', payload: {}, updatedByUid: 'admin-1', createdAt: 500, updatedAt: 500 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'ID poisoning with illegal path characters',
    collection: 'vacancy_overrides',
    docId: '../bad.id',
    operation: 'create',
    auth: { uid: 'admin-1', token: { email: BOOTSTRAPPED_ADMIN_EMAIL, email_verified: true } },
    payload: { vacancyId: '../bad.id', isDeleted: false, title: 'Valid', titleHi: 'Valid', category: 'latest_job', payload: {}, updatedByUid: 'admin-1', createdAt: 1000, updatedAt: 1000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Value poisoning: JSON string payload instead of native Map',
    collection: 'vacancy_overrides',
    docId: 'reet-2026',
    operation: 'create',
    auth: { uid: 'admin-1', token: { email: BOOTSTRAPPED_ADMIN_EMAIL, email_verified: true } },
    payload: { vacancyId: 'reet-2026', isDeleted: false, title: 'Valid', titleHi: 'Valid', category: 'latest_job', payload: '{"hack":1}', updatedByUid: 'admin-1', createdAt: 1000, updatedAt: 1000 },
    expectedResult: 'PERMISSION_DENIED',
  },
];

// Verify Dirty Dozen vacancy_override invariants deterministically
for (const testCase of DIRTY_DOZEN_CASES) {
  const existing = testCase.operation === 'update' ? { createdAt: 900 } : undefined;
  const result = evaluateVacancyOverrideWrite(
    testCase.auth,
    testCase.docId,
    testCase.payload || {},
    1000,
    existing
  );
  if (result !== testCase.expectedResult) {
    throw new Error(`Security test #${testCase.id} (${testCase.name}) failed: expected ${testCase.expectedResult}, got ${result}`);
  }
}
