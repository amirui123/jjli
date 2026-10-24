import { MainMenusGradientCard } from "@cuicui/ui/cuicui/other/cursors/dynamic-cards/gradient-card";
import Link from "next/link";
import { notFound } from "next/navigation";
import MenuCategoryList from "#/src/components/main-menus/menu-category-wrapper";

import { sectionList } from "@/section-list";
import { getCategoryPreviewBySlug } from "#/src/features/preview-category/utils/render-preview-category";
import { newFindSectionBySlug } from "#/src/utils/section-category-components-utils/section-list-utils";

type Props = {
  params: Promise<{ section: string }>;
};

export function generateStaticParams() {
  const paramsArray: {
    section: string;
  }[] = [];
  for (const section of sectionList) {
    paramsArray.push({
      section: section.slug,
    });
  }

  // Return the generated params array
  return paramsArray;
}

export default async function Page({ params }: Props) {
  const { section: sectionParam } = await params;
  const sectionInList = newFindSectionBySlug(sectionParam);

  if (!sectionInList) {
    return notFound();
  }

  return (
    <MenuCategoryList
      description={sectionInList.meta.description}
      title={sectionInList.meta.name}
    >
      {sectionInList.categories.map((category) => {
        return (
          <Link
            href={`/${sectionInList.slug}/${category.slug}`}
            key={category.slug}
          >
            <MainMenusGradientCard
              description={category.meta.description}
              title={category.meta.name}
            >
              <div className="flex items-center justify-center size-full gap-2 py-4 px-12">
                {getCategoryPreviewBySlug(category)}
              </div>
            </MainMenusGradientCard>
          </Link>
        );
      })}
    </MenuCategoryList>
  );
}
