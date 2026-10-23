import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SaveSlot } from "@/components/save-slot";
import { RecipeView } from "@/components/views/recipe-view";
import { getRecipe } from "@/lib/content";
import { contentHref } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/recipes/[slug]">): Promise<Metadata> {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const recipe = await getRecipe(slug, locale);
  return recipe ? { title: recipe.title } : { title: dict.recipeDetail.title };
}

// FR-07 recipe page. Approved recipes only; the halal label only through HalalBadge.
export default async function RecipePage({ params }: PageProps<"/[lang]/recipes/[slug]">) {
  const dict = await getDictionary();
  return (
    <div className="page-container py-10 md:py-16">
      <Suspense
        fallback={
          <p role="status" className="text-body-md text-on-surface-variant">
            {dict.common.loading}
          </p>
        }
      >
        <Recipe params={params} />
      </Suspense>
    </div>
  );
}

async function Recipe({ params }: Pick<PageProps<"/[lang]/recipes/[slug]">, "params">) {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const recipe = await getRecipe(slug, locale);
  if (!recipe) notFound();
  return <RecipeView
      recipe={recipe}
      dict={dict} locale={locale}
      actions={<SaveSlot type="recipe" id={recipe.id} title={recipe.title} nextPath={contentHref("recipe", recipe.slug)} copy={dict.save} />}
    />;
}
