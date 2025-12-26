import { useTranslation } from "react-i18next";

interface TermsSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export default function Terms() {
  const { t } = useTranslation();

  const intro = (t("termsPage.intro", {
    returnObjects: true,
    defaultValue: [],
  }) as string[]) || [];

  const sections = (t("termsPage.sections", {
    returnObjects: true,
    defaultValue: [],
  }) as TermsSection[]) || [];

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 p-10 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-200">
          {t("termsPage.badge")}
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight lg:text-5xl">
          {t("termsPage.title")}
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-neutral-100">
          {t("termsPage.lead")}
        </p>
      </section>

      {intro.length > 0 && (
        <section className="rounded-[28px] bg-white p-8 shadow-lg ring-1 ring-neutral-200">
          <div className="space-y-4 text-sm leading-relaxed text-neutral-800">
            {intro.map((paragraph) => (
              <p key={paragraph} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {sections.map((section) => (
        <section
          key={section.title}
          className="rounded-[28px] bg-white p-8 shadow-lg ring-1 ring-neutral-200"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
            {section.title}
          </p>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-800">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-red-500" aria-hidden />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
