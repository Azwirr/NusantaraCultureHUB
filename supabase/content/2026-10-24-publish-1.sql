-- Publish run 1 (Phase 2d, 2026-10-23), by Claude as the AI Workflow, after
-- batch 3. Each item cites 2+ different websites that were opened and
-- compared with the draft; private.ai_publish checks that and every other
-- publish rule, and logs each approval as 'ai_workflow' with the note below.
-- Items the database refuses stay drafts and are reported, not skipped silently.
--
-- Run as a database operator after batches 1 to 3. Re-running is safe.

do $$
declare
  r record;
  v_id uuid;
  v_ok int := 0;
begin
  for r in
    select * from (values
      -- Regions first: their items need an approved region.
      (1, 'region', 'jawa', 'Region with well-sourced items; summary matches its items.'),
      (1, 'region', 'minangkabau', 'Region with well-sourced items; summary matches its items.'),
      (1, 'region', 'bugis', 'Region with well-sourced items; summary matches its items.'),
      (1, 'region', 'batak', 'Region with well-sourced items; summary matches its items.'),
      (1, 'region', 'sunda', 'Region with well-sourced items; summary matches its items.'),
      (1, 'region', 'bali', 'Region with well-sourced items; summary matches its items.'),
      (1, 'region', 'banjar', 'Region with well-sourced items; summary matches its items.'),
      (1, 'region', 'maluku', 'Region with well-sourced items; summary matches its items.'),
      (1, 'region', 'papua', 'Region with well-sourced items; summary matches its items.'),
      -- Stories (with their chapters). Versions differ between sources; each
      -- draft follows its first source and the second confirms the core tale.
      (2, 'story', 'timun-mas', 'detikJateng and Kompas: Mbok Randa/Sirni, golden cucumber, hermit''s four bundles, sea of mud.'),
      (2, 'story', 'malin-kundang', 'detikSumut and GNFI: the son who denies his mother is cursed into stone at Air Manis.'),
      (2, 'story', 'danau-toba', 'detikSumut and GNFI: Toba, the fish-woman, the broken promise, Lake Toba and Samosir.'),
      (2, 'story', 'sangkuriang', 'detikJabar and BandungBergerak: Si Tumang, the scar, the one-night task, the dawn trick, Tangkuban Parahu.'),
      (2, 'story', 'manik-angkeran', 'GNFI and HaiBunda: Sidi Mantra, Naga Besukih, the cut tail, revival, the staff that makes the Bali Strait.'),
      (2, 'story', 'putri-junjung-buih', 'detikKalimantan and GNFI: the baby from the river foam and the woven cloth; the draft follows the Negara Dipa version.'),
      -- Recipes.
      (3, 'recipe', 'gudeg-yogyakarta', 'indonesia.travel and Kompas: young jackfruit, coconut milk, palm sugar, bay leaves, long slow cooking.'),
      (3, 'recipe', 'rawon', 'indonesia.travel and Kompas: beef, kluwek paste, lime leaves and lemongrass, bean sprouts and sambal.'),
      (3, 'recipe', 'soto-ayam', 'indonesia.travel and Kompas: turmeric chicken broth with noodles, egg and fried shallots.'),
      (3, 'recipe', 'pecel', 'ANTARA and Kompas: blanched vegetables with a peanut, chilli, palm sugar and tamarind sauce.'),
      (3, 'recipe', 'rendang-daging', 'indonesia.travel and Kompas: beef simmered in coconut milk and spice paste until dry.'),
      (3, 'recipe', 'dendeng-balado', 'RRI and Kompas: boiled, sliced and fried beef in a coarse chilli sambal with lime leaves.'),
      (3, 'recipe', 'sate-padang', 'indonesia.travel and Kompas: grilled beef in a rice-flour spice sauce (Kompas also uses peanuts).'),
      (3, 'recipe', 'coto-makassar', 'CNN Indonesia and Kompas: beef broth thickened with roasted ground peanuts, served with ketupat.'),
      (3, 'recipe', 'konro-bakar', 'RRI and Kompas: ribs simmered with spices and kluwek, grilled, served with peanut sauce.'),
      (3, 'recipe', 'barongko', 'Kompas TV and Kompas: mashed banana, egg, sugar and coconut milk, steamed in banana leaf.'),
      (3, 'recipe', 'arsik-ikan-mas', 'Fimela and Liputan6: carp on lemongrass and torch ginger with andaliman and asam, cooked nearly dry.'),
      (3, 'recipe', 'ayam-betutu', 'Orami and indonesia.travel: whole chicken in spice paste, wrapped in banana leaf, steamed then baked.'),
      (3, 'recipe', 'soto-banjar', 'Orami and HaiBunda: chicken broth with pekak, cloves, cardamom and cinnamon, ketupat and perkedel.'),
      -- Traditional dress.
      (4, 'costume', 'ulos', 'indonesia.travel and detikEdu: hand-woven Batak cloth for ceremonies; Sibolang, Ragi Hotang, Ragidup.'),
      (4, 'costume', 'kebaya-sunda', 'detikJabar and Kompas: U-shaped neckline, long cut to the thighs, bright colours.'),
      (4, 'costume', 'payas-agung', 'GNFI and ANTARA: Balinese bridal dress, once for the nobility, dominant gold, crown.'),
      (4, 'costume', 'bagajah-gamuling-baular-lulut', 'detikKalimantan and Liputan6: Banjar bridal dress with a Hindu influence, kemben and jasmine.'),
      (4, 'costume', 'baju-cele', 'ANTARA and indonesia.travel: bright geometric or check pattern, worn at ceremonies and weddings.'),
      (4, 'costume', 'rok-rumbai', 'GNFI and Kompas: Papuan women''s skirt of dried sago leaves or plant fibre.'),
      (4, 'costume', 'baju-bodo', 'indonesia.travel and detikSulsel: square-cut short-sleeved blouse worn with a silk lipa sabbe.'),
      (4, 'costume', 'baju-bundo-kanduang', 'Serupa journal and Kompas: tingkuluak, gold-thread baju kurung, songket sarong and salempang.'),
      (4, 'costume', 'pengantin-jawa', 'GNFI and ANTARA: groom''s beskap, blangkon and jarik; bride''s kebaya with batik cloth.')
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
      v_ok := v_ok + 1;
    exception when others then
      raise notice 'stays a draft: % % (%)', r.entity, r.slug, sqlerrm;
    end;
  end loop;
  raise notice 'published % items', v_ok;
end;
$$;
