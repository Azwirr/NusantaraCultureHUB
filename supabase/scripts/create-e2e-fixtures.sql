-- Review-queue fixture for tests/e2e/review-queue.spec.ts. Staging or local
-- only, never production. Run once per environment as a database operator:
--
--   psql "$DB_URL" -f supabase/scripts/create-e2e-fixtures.sql
--
-- It is a draft story with two complete chapters, created by the operator (no
-- auth user), so the e2e reviewer is neither its creator nor its editor.
--
-- It can never become public:
-- * the story cites no source, so guard_approval refuses to approve it;
-- * a chapter is public only when its story is approved too.
-- The e2e test approves and unpublishes chapter 2 to prove that a reviewer
-- can approve someone else's work, and edits chapter 1 to prove that the
-- editor is refused. Real reviewers should leave it alone; the title says so.

insert into public.stories (region_id, slug, title_id, title_en, summary_id, summary_en)
select id, 'e2e-uji', '[E2E] Cerita uji, jangan disetujui', '[E2E] Test story, do not approve',
  'Data uji otomatis untuk antrean peninjau.', 'Automated test data for the review queue.'
from public.regions where slug = 'jawa'
on conflict (slug) do nothing;

insert into public.story_chapters (story_id, chapter_no, text_id, text_en,
  audio_description_id, audio_description_en, image_alt_id, image_alt_en)
select s.id, c.no, 'Teks uji.', 'Test text.', 'Deskripsi uji.', 'Test description.', 'Alt uji.', 'Test alt.'
from public.stories s cross join (values (1), (2)) as c (no)
where s.slug = 'e2e-uji'
on conflict (story_id, chapter_no) do nothing;
