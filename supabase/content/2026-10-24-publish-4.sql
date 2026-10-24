-- Publish run 4 (2026-10-24), by Claude as the AI Workflow, after batches 6
-- and 7 (ceremonies). Each item cites 2+ different websites that were opened
-- and compared with the draft; private.ai_publish checks that and every other
-- publish rule. Items the database refuses stay drafts. Re-running is safe.
--
-- Details the sources disagree on are not in any published text (see
-- docs/adat-data.md). The Sumba region goes first so Pasola can follow it.

do $$
declare
  r record;
  v_id uuid;
begin
  for r in
    select * from (values
      (1, 'region', 'sumba', 'Region for Pasola; summary matches its item.'),
      (2, 'ceremony', 'pasola', 'detikBali and Liputan6: Sumba Barat, wooden spears, Feb/Mar by the rato, nyale first, Marapu. Spear size left out.'),
      (2, 'ceremony', 'ngaben', 'Kompas and GNFI: Balinese Hindu cremation, five elements, ngulapin and meseh lawang, ashes in a young coconut.'),
      (2, 'ceremony', 'tiwah', 'detikKalimantan and Kompas: Dayak Ngaju, Kaharingan, bones to the sandung, sapundu. Spirit-world name left out.'),
      (2, 'ceremony', 'sekaten', 'detikJogja and Kompas: Maulid, Sunan Kalijaga, 5-12 Mulud, Grebeg Mulud and gunungan. Gamelan names left out.'),
      (2, 'ceremony', 'seren-taun', 'GNFI and detikJabar: seren + taun, Nyi Pohaci, 22 Rayagung in Cigugur, Kasepuhan communities.'),
      (2, 'ceremony', 'yadnya-kasada', 'Kompas and detikJatim: Tengger at Bromo, offerings into the crater, 15 Kasada. Legend names left out.'),
      (2, 'ceremony', 'mapalus', 'Kompas and GNFI: Minahasa mutual cooperation in farming, celebrations and funerals.'),
      (2, 'ceremony', 'bakar-batu', 'Kompas and Liputan6: Papuan heated-stone feast for thanks, guests and peace.'),
      (2, 'ceremony', 'manene', 'Kompas and detikSulsel: Toraja ancestors cleaned and re-dressed every three years.'),
      (2, 'ceremony', 'tabuik', 'GNFI and Kompas (+ indonesia.travel): Pariaman, 1-10 Muharram, Husein at Karbala, tower to the sea.'),
      (2, 'ceremony', 'mappacci', 'UNM journal and Kompas: Bugis pre-akad henna rite, paccing = clean, the four stages and items.'),
      (2, 'ceremony', 'mangongkal-holi', 'GNFI and JPTAM: Batak Toba bone reburial into a tugu, with an adat feast.'),
      (2, 'ceremony', 'baayun-maulid', 'ANTARA and GNFI: Banjar Maulid swinging in tapih with syair maulid, Banua Halat and Banjarmasin.'),
      (2, 'ceremony', 'pukul-sapu', 'GNFI and ANTARA: Mamala and Morella, 7 Syawal, brotherhood. Broom palm left out.'),
      (2, 'ceremony', 'bau-nyale', 'GNFI and Kompas: Sasak, 20th of the 10th Sasak month, Putri Mandalika, south Lombok beaches.'),
      (2, 'ceremony', 'palang-pintu', 'GNFI and Katadata: Betawi wedding, pantun and silat at the bride''s door. Recitation type left out.'),
      (2, 'ceremony', 'peusijuek', 'detikSumut and GNFI: Acehnese cooling rite, items, leaders, peacemaking.'),
      (2, 'ceremony', 'caci', 'indonesia.travel and Wikipedia: Manggarai whip duel, buffalo-hide shield, Penti harvest.'),
      (2, 'ceremony', 'rambu-solo', 'GNFI and Kompas: Toraja funeral, smoke going down, rank, buffalo and Puya. Duration left out.'),
      (2, 'ceremony', 'karapan-sapi', 'GNFI and Mojok: Madura bull race, harvest origin, speed, criticism of harm to bulls.')
    ) as t (step, entity, slug, note)
    order by step
  loop
    execute format('select id from public.%I where slug = $1', case r.entity
      when 'region' then 'regions' when 'story' then 'stories' when 'recipe' then 'recipes'
      when 'costume' then 'costumes' else 'ceremonies' end)
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
