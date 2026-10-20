import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ZonesTonalesPage } from "@/components/products/ZonesTonalesPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "zonesTonales.meta" });

  const getOgImage = (loc: string) => {
    if (loc === "en") return "/images/tonal-zones-cover-en.png";
    if (loc === "nl") return "/images/tonale-zones-cover-nl.png";
    return "/images/zones-tonales-cover.png";
  };
  const ogImage = getOgImage(locale);

  return {
    title: t("title"),
    description: t("desc"),
    openGraph: {
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
    alternates: {
      canonical: `/${locale}/products/zones-tonales`,
      languages: {
        fr: "/fr/products/zones-tonales",
        en: "/en/products/zones-tonales",
        nl: "/nl/products/zones-tonales",
        "x-default": "/fr/products/zones-tonales",
      },
    },
  };
}

export default async function ZonesTonalesRoute() {
  return (
    <main id="main-content">
      <div className="wrap">
        <ZonesTonalesPage />
      </div>
    </main>
  );
}
