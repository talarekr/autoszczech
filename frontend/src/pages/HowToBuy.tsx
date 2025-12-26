import { useTranslation } from "react-i18next";

interface HighlightItem {
  title: string;
  description: string;
}

interface StepItem {
  title: string;
  description: string;
}

interface DeliveryItem {
  title: string;
  points: string[];
}

interface TransportSection {
  description: string[];
  bulletTitle: string;
  bullets: string[];
  extraFeesTitle: string;
  extraFees: string[];
}

export default function HowToBuy() {
  const { t } = useTranslation();

  const highlights = t("howToBuyPage.highlights", {
    returnObjects: true,
    defaultValue: [],
  }) as HighlightItem[];

  const steps = t("howToBuyPage.steps", {
    returnObjects: true,
    defaultValue: [],
  }) as StepItem[];

  const delivery = t("howToBuyPage.delivery", {
    returnObjects: true,
  }) as DeliveryItem;

  const transport = t("howToBuyPage.transport", {
    returnObjects: true,
  }) as TransportSection;

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] bg-gradient-to-br from-red-700 via-red-600 to-red-500 p-10 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-100">
          {t("howToBuyPage.badge")}
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight lg:text-5xl">
          {t("howToBuyPage.title")}
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-red-100">{t("howToBuyPage.lead")}</p>
      </section>

      <section className="rounded-[28px] bg-white p-8 shadow-lg ring-1 ring-neutral-200">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
              {t("howToBuyPage.info.badge")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
              {t("howToBuyPage.info.title")}
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-5 shadow-inner"
            >
              <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-700">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-8 shadow-lg ring-1 ring-neutral-200">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
          {t("howToBuyPage.process.badge")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
          {t("howToBuyPage.process.title")}
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {steps.map((step, index) => (
            <div key={step.title} className="flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-base text-red-700">
                  {index + 1}
                </span>
                {t("howToBuyPage.process.step")}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-line">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] bg-white p-8 shadow-lg ring-1 ring-neutral-200">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
            {t("howToBuyPage.delivery.badge")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">{delivery.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
            {delivery.points[0]}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
            {delivery.points[1]}
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-neutral-800">
            {delivery.points.slice(2).map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">{t("howToBuyPage.delivery.footer")}</p>
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-lg ring-1 ring-neutral-200">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
            {t("howToBuyPage.transport.badge")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
            {t("howToBuyPage.transport.title")}
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-700">
            {transport.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-neutral-900">{transport.bulletTitle}</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
            {transport.bullets.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm font-semibold text-neutral-900">{transport.extraFeesTitle}</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
            {transport.extraFees.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
