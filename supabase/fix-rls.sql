-- =========================================================================
-- FIX: REKURSION INFINIT PADA RLS EXAMS & SUPERVISORS
-- Jalankan skrip ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ibjcsmzahscbrkgaqujp/sql/new
-- =========================================================================

-- 1. Hapus policy yang saling merujuk (circular reference)
DROP POLICY IF EXISTS "Supervisors can view assigned exams" ON public.exams;
DROP POLICY IF EXISTS "Organizers manage supervisors" ON public.supervisors;
DROP POLICY IF EXISTS "Supervisors view their invitations" ON public.supervisors;
DROP POLICY IF EXISTS "Organizers manage their exams" ON public.exams;
DROP POLICY IF EXISTS "Public can view basic exam info by code" ON public.exams;
DROP POLICY IF EXISTS "Organizers and supervisors view participants" ON public.participants;
DROP POLICY IF EXISTS "Organizers and supervisors view sessions" ON public.sessions;
DROP POLICY IF EXISTS "Organizers and supervisors view events" ON public.events;
DROP POLICY IF EXISTS "Organizers and supervisors manage unlock requests" ON public.unlock_requests;

-- 2. Kebijakan EXAMS yang Bersih (Tanpa Subquery rekursif ke supervisors)
CREATE POLICY "Organizers manage their exams"
ON public.exams FOR ALL
USING (auth.uid() = organizer_id);

CREATE POLICY "Public can view basic exam info by code"
ON public.exams FOR SELECT
TO anon, authenticated
USING (status IN ('scheduled', 'ongoing', 'draft'));

-- 3. Kebijakan SUPERVISORS
CREATE POLICY "Supervisors view their invitations"
ON public.supervisors FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Organizers manage supervisors"
ON public.supervisors FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.exams
        WHERE exams.id = supervisors.exam_id AND exams.organizer_id = auth.uid()
    )
);

-- 4. Kebijakan PARTICIPANTS
CREATE POLICY "Organizers view participants"
ON public.participants FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.exams
        WHERE exams.id = participants.exam_id
          AND exams.organizer_id = auth.uid()
    )
);

-- 5. Kebijakan SESSIONS
CREATE POLICY "Organizers view sessions"
ON public.sessions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.participants
        JOIN public.exams ON exams.id = participants.exam_id
        WHERE participants.id = sessions.participant_id
          AND exams.organizer_id = auth.uid()
    )
);

-- 6. Kebijakan EVENTS
CREATE POLICY "Organizers view events"
ON public.events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.sessions
        JOIN public.participants ON participants.id = sessions.participant_id
        JOIN public.exams ON exams.id = participants.exam_id
        WHERE sessions.id = events.session_id
          AND exams.organizer_id = auth.uid()
    )
);

-- 7. Kebijakan UNLOCK REQUESTS
CREATE POLICY "Organizers manage unlock requests"
ON public.unlock_requests FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.sessions
        JOIN public.participants ON participants.id = sessions.participant_id
        JOIN public.exams ON exams.id = participants.exam_id
        WHERE sessions.id = unlock_requests.session_id
          AND exams.organizer_id = auth.uid()
    )
);

