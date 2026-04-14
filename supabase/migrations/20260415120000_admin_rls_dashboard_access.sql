-- Admin RLS for App for English admin dashboard (additive; learner policies unchanged).
-- Applied to project irgatccwxeexvvcrozxg via Supabase MCP; keep in repo for reproducibility.

DROP POLICY IF EXISTS "Admins can select all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;

CREATE POLICY "Admins can select all subscriptions"
ON public.subscriptions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

DROP POLICY IF EXISTS "Admins can select all speaking_sessions" ON public.speaking_sessions;
CREATE POLICY "Admins can select all speaking_sessions"
ON public.speaking_sessions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

DROP POLICY IF EXISTS "Admins can select all session_ratings" ON public.session_ratings;
CREATE POLICY "Admins can select all session_ratings"
ON public.session_ratings FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

DROP POLICY IF EXISTS "Admins can select all waiting_users" ON public.waiting_users;
CREATE POLICY "Admins can select all waiting_users"
ON public.waiting_users FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

DROP POLICY IF EXISTS "Admins can delete waiting_users" ON public.waiting_users;
CREATE POLICY "Admins can delete waiting_users"
ON public.waiting_users FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

DROP POLICY IF EXISTS "Admins can select all lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;

CREATE POLICY "Admins can select all lessons"
ON public.lessons FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can insert lessons"
ON public.lessons FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can update lessons"
ON public.lessons FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can delete lessons"
ON public.lessons FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

DROP POLICY IF EXISTS "Admins can select all lesson_sections" ON public.lesson_sections;
DROP POLICY IF EXISTS "Admins can insert lesson_sections" ON public.lesson_sections;
DROP POLICY IF EXISTS "Admins can update lesson_sections" ON public.lesson_sections;
DROP POLICY IF EXISTS "Admins can delete lesson_sections" ON public.lesson_sections;

CREATE POLICY "Admins can select all lesson_sections"
ON public.lesson_sections FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can insert lesson_sections"
ON public.lesson_sections FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can update lesson_sections"
ON public.lesson_sections FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can delete lesson_sections"
ON public.lesson_sections FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

DROP POLICY IF EXISTS "Admins can select all lesson_items" ON public.lesson_items;
DROP POLICY IF EXISTS "Admins can insert lesson_items" ON public.lesson_items;
DROP POLICY IF EXISTS "Admins can update lesson_items" ON public.lesson_items;
DROP POLICY IF EXISTS "Admins can delete lesson_items" ON public.lesson_items;

CREATE POLICY "Admins can select all lesson_items"
ON public.lesson_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can insert lesson_items"
ON public.lesson_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can update lesson_items"
ON public.lesson_items FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can delete lesson_items"
ON public.lesson_items FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

DROP POLICY IF EXISTS "Admins can select all lesson_quiz_questions" ON public.lesson_quiz_questions;
DROP POLICY IF EXISTS "Admins can insert lesson_quiz_questions" ON public.lesson_quiz_questions;
DROP POLICY IF EXISTS "Admins can update lesson_quiz_questions" ON public.lesson_quiz_questions;
DROP POLICY IF EXISTS "Admins can delete lesson_quiz_questions" ON public.lesson_quiz_questions;

CREATE POLICY "Admins can select all lesson_quiz_questions"
ON public.lesson_quiz_questions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can insert lesson_quiz_questions"
ON public.lesson_quiz_questions FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can update lesson_quiz_questions"
ON public.lesson_quiz_questions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

CREATE POLICY "Admins can delete lesson_quiz_questions"
ON public.lesson_quiz_questions FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));

DROP POLICY IF EXISTS "Admins can select all lesson_progress" ON public.lesson_progress;
CREATE POLICY "Admins can select all lesson_progress"
ON public.lesson_progress FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid() AND au.is_admin = true));
