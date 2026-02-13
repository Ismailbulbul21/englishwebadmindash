# Add exam flow (appforenglish Supabase)

## Supabase project (appforenglish)

- **Project:** appforenglish (`irgatccwxeexvvcrozxg`) — connected via MCP from `c:\Users\hp\.cursor\mcp.json`.
- **Tables:**
  - **`exams`** — one row per chapter. Columns: `id`, `chapter_id` (UUID), `passing_score` (integer 0–100, default 70), `created_at`, `updated_at`.
  - **`exam_questions`** — many rows per exam. Columns: `id`, `exam_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer` (exactly `'a'`, `'b'`, `'c'`, or `'d'`), `question_order` (integer, unique per exam), `created_at`, `updated_at`.
- **RLS:** Authenticated users can SELECT exams/questions (for published chapters). Admins (in `admin_users`) can SELECT/INSERT/UPDATE/DELETE all exams and exam_questions.

## Flow in the admin dashboard

1. **Courses → course → Chapters**  
   Each chapter row has an **“Add / Manage exam”** link.

2. **Open exam for a chapter**  
   Link goes to `/chapters/:chapterId/exam` (Exam editor).

3. **No exam yet**
   - Form: **Passing score (%)** 0–100 (default 70).
   - Button: **“Create exam”** → inserts one row into `exams` with `chapter_id` and `passing_score`.

4. **Exam created**
   - **Exam settings:** Edit passing score (0–100), then **“Update Passing Score”** (updates `exams.passing_score`).
   - **Questions:** List of questions; each shows question text, options A–D, correct answer highlighted.
   - **“Add Question”** opens a form:
     - Question text (required)
     - Option A, B, C, D (required)
     - Correct answer: exactly one of **a / b / c / d** (radio)
     - Question order (integer, suggested as next number)
   - **Save** → insert into `exam_questions` with `exam_id`, `question_text`, `option_a`–`option_d`, `correct_answer`, `question_order`.
   - **Edit** → same form, update existing row.
   - **Delete** → remove row from `exam_questions`.

5. **Validation**
   - All fields required; `correct_answer` must be one of `'a'`,`'b'`,`'c'`,`'d'` (Zod schema).
   - Passing score clamped to 0–100 in UI and in the create-exam mutation.

The mobile app reads `exams` and `exam_questions` (e.g. by `chapter_id` → exam → questions) to show the exam after the user watches the chapter video.
