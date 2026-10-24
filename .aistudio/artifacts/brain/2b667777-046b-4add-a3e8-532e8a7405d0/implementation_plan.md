# Implementation Plan - PM Viksit Bharat Rojgar Yojana Addition

Add a comprehensive, authoritative scheme publication for "PM Viksit Bharat Rojgar Yojana 2026" inside the "सरकारी योजना (Sarkari Yojana)" category of the portal, equipped with official announcement details, application procedure, direct government portal links, and handcrafted expert teacher summary notes.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following choices were confirmed during Turn 1 clarification:

- **Confirmed Decision 1**: Add "PM Viksit Bharat Rojgar Yojana" as a new detailed scheme post inside the `Sarkari Yojana` category in `mockVacancies.ts`.
- **Confirmed Decision 2**: Present a clean, focused official announcement summary with official website links (`e-Shram` / `NCS` / `Pradhan Mantri Rojgar Incentive`).
- **Confirmed Decision 3**: Include a dedicated handwritten teacher notes section featuring expert tips and a document verification checklist for scheme beneficiaries.

---

## 1. Overview & Core Concept

- **What It Does**:
  - Adds a new entry titled "PM Viksit Bharat Rojgar Yojana 2026 (पीएम विकसित भारत रोजगार योजना)" to the mock dataset (`INITIAL_VACANCIES`) under category `scheme` and organization `Sarkari Yojana`.
  - Enables candidates and job seekers to browse, search, and view full details of this central welfare scheme directly from the home grid, "Sarkari Yojana" filter tab, and category archives.
- **Target Audience**: Youth, job seekers, and informal sector workers across Rajasthan and India looking for wage incentives, skill registration, and government employment assistance.
- **Key Value**: Provides clean, scam-free, authentic official information regarding the PM Viksit Bharat Rojgar scheme along with official application links and expert guidance.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Discovery**: User visits the portal, clicks on the "Sarkari Yojana" header tab or filters by category "Sarkari Yojana" on the home page.
  2. **Preview Card**: The "PM Viksit Bharat Rojgar Yojana 2026" card appears with a distinct "NEW" badge, total posts/beneficiaries indicator, and concise Hindi summary.
  3. **Full Scheme Detail View**: Clicking the card opens the full detail page containing:
     - Overview summary table & official announcement highlights.
     - Eligibility criteria & age limits.
     - Application fee info (Zero fee / Free registration).
     - Step-by-step application instructions.
     - Official Government portal links (`ncs.gov.in`, `eshram.gov.in`, `india.gov.in`).
     - **Handwritten Teacher Summary Notes**: A styled box with handcrafted tips and document verification checklist.
- **Visual Identity & Theme**:
  - Consistent with the applet's amber/emerald theme, clean Mangal/Noto Sans Devanagari typography, and unboxed clean metadata.
  - Distinctive yellow/amber card theme for government welfare schemes.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Data Integration via `mockVacancies.ts`**:
  - *Chosen Approach*: Add the complete scheme item directly into `INITIAL_VACANCIES` in `src/data/mockVacancies.ts`.
  - *Why*: Ensures the scheme is available on first load for all users, supports filtering, searching, bookmarks, and full detail views seamlessly without external database overhead.
- **Decision 2: Direct Link Focus**:
  - *Chosen Approach*: Highlight official government links (`ncs.gov.in`, `eshram.gov.in`) and clear non-affiliation notices.
  - *Why*: Protects candidates from fake registration scams and aligns with portal safety guidelines.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────┐
│              src/data/mockVacancies.ts                   │
│  - Add 'pm-viksit-bharat-rojgar-yojana-2026' entry      │
└──────────────────────────┬──────────────────────────────┘
                           │ (Initializes LocalStorage)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    src/App.tsx                          │
│  - Passes vacancies to FastUpdatesGrid & Search Filters │
└──────────────────────────┬──────────────────────────────┘
                           │ (User clicks scheme card)
                           ▼
┌─────────────────────────────────────────────────────────┐
│            src/components/VacancyDetailPage.tsx          │
│  - Renders Overview, Eligibility, Official Links        │
│  - Renders Handwritten Teacher Summary Notes Box        │
└─────────────────────────────────────────────────────────┘
```

### Data Model (`VacancyItem` Entry Summary)

```typescript
{
  id: 'pm-viksit-bharat-rojgar-yojana-2026',
  title: 'PM Viksit Bharat Rojgar Yojana 2026',
  titleHi: 'पीएम विकसित भारत रोजगार योजना 2026',
  shortTitleHi: 'PM विकसित भारत रोजगार योजना',
  organization: 'Sarkari Yojana',
  category: 'scheme',
  totalPosts: 100000,
  postNameHi: 'युवा रोजगार प्रोत्साहन व स्वरोजगार सहायता',
  departmentHi: 'श्रम एवं रोजगार मंत्रालय, भारत सरकार',
  briefSummaryHi: 'केंद्र सरकार द्वारा युवाओं को रोजगार के अवसर, वित्तीय प्रोत्साहन एवं कौशल प्रशिक्षण प्रदान करने हेतु पीएम विकसित भारत रोजगार योजना 2026 की घोषणा।',
  // Includes handwritten notes, official links, important dates, and eligibility details
}
```

---

## Implementation Steps

1. **Update `src/data/mockVacancies.ts`**: Append the complete `pm-viksit-bharat-rojgar-yojana-2026` object to `INITIAL_VACANCIES`.
2. **Clear cached vacancies key in `src/App.tsx`**: Update storage key version if needed to load the new initial mock data smoothly.
3. **Verify compilation & lint**: Execute `compile_applet` and `lint_applet` to ensure zero build errors.
