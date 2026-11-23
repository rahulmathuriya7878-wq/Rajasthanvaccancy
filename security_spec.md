# Firestore Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants

1. **Global Default-Deny**: Any path not explicitly matched is denied for both read and write.
2. **Vacancy Overrides (`/vacancy_overrides/{vacancyId}`)**:
   - Publicly readable (`get`, `list`) so every visitor on any phone/browser receives live edits made in Word In-Place Edit Mode.
   - Strictly writable (`create`, `update`, `delete`) ONLY by a verified admin (`isAdmin()`).
   - Document ID `{vacancyId}` must satisfy `isValidId(vacancyId)` (`^[a-zA-Z0-9_\-]+$`, `<= 128` chars) and equal `incoming().vacancyId`.
   - `updatedByUid` MUST equal `request.auth.uid`.
   - `createdAt` MUST equal `request.time` on create and remain immutable (`incoming().createdAt == existing().createdAt`) on update.
   - `updatedAt` MUST equal `request.time` on both create and update.
   - Strict key allowlist (`hasAll` + `hasOnly` on create; `affectedKeys().hasOnly(...)` on update) blocks shadow/ghost fields.
   - `payload` MUST be a native `map` (`is map`), never a JSON string.
3. **Users (`/users/{userId}`) — PII Isolation**:
   - Strictly owner-only or admin-only `get`, `create`, `update`, `delete`. No blanket `isSignedIn()` reads or `list` scraping.
   - Cannot self-assign RBAC fields (`role`, `isAdmin`) because strict `hasOnly` blocks unknown fields.
   - `uid` must equal `userId` and `request.auth.uid`; `createdAt` is immutable; timestamps must equal `request.time`.
4. **Saved Vacancies (`/saved_vacancies/{saveId}`)**:
   - Strictly owner-scoped (`resource.data.userId == request.auth.uid`) on `get`, `list`, `update`, `delete` and `incoming().userId == request.auth.uid` on `create`.
   - Verified email required for writes.
5. **Admins (`/admins/{userId}`)**:
   - Only verified admins (`rahulmathuriya7878@gmail.com` with `email_verified == true`, or an existing `/admins/{uid}` doc with `email_verified == true`) may read or write admin records.
   - Non-admin users can check only their own `/admins/{request.auth.uid}` existence (`get`), never `list` or `write`.
6. **Health Check (`/test/connection`)**:
   - Read-only `get` allowed strictly for document ID `'connection'` to support startup offline detection; writes are always denied.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)

1. **Unauthenticated Override Create**: Anonymous user writes to `/vacancy_overrides/reet-2026`.
2. **Non-Admin Signed-In Override Create**: Authenticated regular user (`other@gmail.com`, `email_verified: true`) writes to `/vacancy_overrides/reet-2026`.
3. **Unverified Admin Email Spoof**: User with `email: 'rahulmathuriya7878@gmail.com'` but `email_verified: false` attempts to write to `/vacancy_overrides/reet-2026`.
4. **Shadow Field Injection on Create**: Admin creates `/vacancy_overrides/reet-2026` with extra ghost field `isSuperVerified: true`.
5. **Shadow Field Injection on Update**: Admin updates `/vacancy_overrides/reet-2026` with extra ghost field `hackedFlag: true`.
6. **Immutable `createdAt` Tampering**: Admin updates `/vacancy_overrides/reet-2026` attempting to alter `createdAt`.
7. **Forged Client Timestamp**: Admin creates `/vacancy_overrides/reet-2026` with a backdated `updatedAt` timestamp instead of `request.time`.
8. **ID Poisoning / Path Mismatch**: Admin creates `/vacancy_overrides/../../bad..id` or mismatches path `vacancyId` vs `incoming().vacancyId`.
9. **Value Poisoning (Oversized / Invalid Type)**: Admin sets `title` to a 10,000-character string or sets `payload` to a JSON string instead of a `map`.
10. **PII Blanket Read on `/users/{otherUid}`**: Authenticated User A attempts `get` or `list` on `/users/userB`.
11. **Self-Assigned Admin Escalation**: Authenticated User A attempts to create `/admins/{userA}` or add `isAdmin: true` to `/users/{userA}`.
12. **Cross-User Saved Vacancy Scraping**: Authenticated User A attempts `list` on `/saved_vacancies` without `where('userId', '==', userA)` or `delete` on User B's bookmark.
