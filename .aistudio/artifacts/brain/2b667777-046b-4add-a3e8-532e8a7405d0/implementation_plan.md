# Comprehensive Post Editing Interface Implementation Plan

Administrators need to edit every single box, table, and section of any job post or scheme. We will upgrade the `AddVacancyModal` into a full-featured admin editor.

## Proposed Changes

### 1. Upgrade `AddVacancyModal.tsx` State & Pre-filling
- **Complete Form State**: Add state variables for nested structures:
  - `tspBreakdown`: Non-TSP, TSP, Sahariya post counts.
  - `postBreakdown`: Dynamic list of post breakdown rows (Post Name, Category/Subject, Posts Count, Qualification).
  - `salaryTable`: Dynamic list of pay scales (Post Name, Pay Level, Salary Range).
  - `examPattern`: Exam Mode, Total Marks, Duration, Negative Marking, Subject list (Subject Name, Questions, Marks), and Exam Notes.
  - `requiredDocuments`: List of required documents (newline-separated or dynamic inputs).
  - `howToApply`: Step-by-step application instructions.
  - Extended `officialLinks`: Syllabus PDF, Admit Card Link, Result Link in addition to Apply Online and Notification PDF.
- **Pre-fill logic in `useEffect`**: When `editItem` is provided, pre-fill all nested tables, breakdown items, exam pattern, TSP numbers, documents, and links.

### 2. Full Modal UI Sections in `AddVacancyModal.tsx`
- **Section 1: Basic Information & Location** (Titles, Board, Category, Department, Advt No, Job Location).
- **Section 2: Brief Summary & Full Blog Content Editor** (Instant template generators).
- **Section 3: TSP / Non-TSP Vacancy Breakdown** (Inputs for Non-TSP, TSP, Sahariya posts).
- **Section 4: Detailed Post Breakdown Table Editor** (Add / Remove post rows dynamically).
- **Section 5: Salary & Pay Scale Table Editor** (Add / Remove pay level rows).
- **Section 6: Exam Pattern & Subject-wise Marks Editor** (Exam mode, total marks, negative marking, dynamic subject rows).
- **Section 7: Important Dates, Fees & Age Limits** (Complete date fields, category fees, age min/max/as-on-date, relaxation notes).
- **Section 8: Selection Process, Documents & How to Apply** (Editable lists/text areas for application steps and document requirements).
- **Section 9: Official Links & PDF Attachments** (Apply link, Notification PDF, Syllabus PDF, Admit Card link, Result link, Official website).

### 3. Submission & State Persistence
- Construct the updated `VacancyItem` with all modified fields on submit.
- Update state in `App.tsx` and persist in local storage.

## User Verification
After completing code updates, test opening the edit modal on any post and verifying that all sections can be updated and saved.
