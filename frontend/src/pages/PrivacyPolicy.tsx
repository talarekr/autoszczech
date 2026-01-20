import { useTranslation } from "react-i18next";

interface PolicySection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  afterBullets?: string[];
}

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  const intro = (t("privacyPolicyPage.intro", {
    returnObjects: true,
    defaultValue: [],
  }) as string[]) || [];

  const sections = (t("privacyPolicyPage.sections", {
    returnObjects: true,
    defaultValue: [],
  }) as PolicySection[]) || [];

  const closing = (t("privacyPolicyPage.closing", {
    returnObjects: true,
    defaultValue: [],
  }) as string[]) || [];

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] bg-gradient-to-br from-red-700 via-red-600 to-red-500 p-10 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-100">
          {t("privacyPolicyPage.badge")}
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight lg:text-5xl">
          {t("privacyPolicyPage.title")}
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-red-100">
          {t("privacyPolicyPage.lead")}
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
            {section.afterBullets?.map((paragraph) => (
              <p key={paragraph} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}

      {closing.length > 0 && (
        <section className="rounded-[28px] bg-white p-8 shadow-lg ring-1 ring-neutral-200">
          <div className="space-y-4 text-sm leading-relaxed text-neutral-800">
            {closing.map((paragraph) => (
              <p key={paragraph} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
