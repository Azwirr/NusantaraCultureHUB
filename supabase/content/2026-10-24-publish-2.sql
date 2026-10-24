-- Publish run 2 (2026-10-24), by Claude as the AI Workflow, after batch 4.
-- Each item cites 2+ different websites that were opened and compared with
-- the draft; private.ai_publish checks that and every other publish rule.
-- Items the database refuses stay drafts. Re-running is safe.

do $$
declare
  r record;
  v_id uuid;
begin
  for r in
    select * from (values
      (1, 'region', 'sasak', 'Region with well-sourced items; summary matches its items.'),
      (2, 'story', 'putri-mandalika', 'GNFI and Mongabay: the princess who refuses three suitors, leaps into the sea and becomes nyale; Bau Nyale at Seger and Kuta.'),
      (2, 'story', 'putri-tandampalik', 'detikSulsel and Gramedia: Luwu princess, Bone proposal, skin disease and exile, healing, marriage to the Bone prince.'),
      (2, 'story', 'batu-berdaun', 'GNFI and REINHA: the grandmother, two grandchildren, the crab claw, the leaf-shaped stone.'),
      (2, 'story', 'kasuari-dan-dara-makota', 'detikJogja and Analisadaily: the proud cassowary, the flying race with the crowned pigeon, and why it walks.'),
      (3, 'recipe', 'ayam-taliwang', 'Liputan6 and detikBali: young chicken in chilli, kencur and terasi paste, simmered then grilled; Lombok origin.'),
      (4, 'costume', 'baju-lambung', 'Orami, detikTravel and indonesia.travel: black sleeveless Sasak top with V neckline, kain lempot, worn at weddings.')
    ) as t (step, entity, slug, note)
    order by step
  loop
    execute format('select id from public.%I where slug = $1', case r.entity
      when 'region' then 'regions' when 'story' then 'stories'
      when 'recipe' then 'recipes' else 'costumes' end)
      into v_id using r.slug;
    if v_id is null then
      raise notice 'not found: % %', r.entity, r.slug;
      continue;
    end if;
    begin
      perform private.ai_publish(r.entity, v_id, r.note);
    exception when others then
      raise notice 'stays a draft: % % (%)', r.entity, r.slug, sqlerrm;
    end;
  end loop;
end;
$$;
