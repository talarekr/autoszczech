import { FormEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";

const sanitizePhoneHref = (value: string) => value.replace(/\s+/g, "");

const IconBubble = ({
  children,
  tone = "red",
}: {
  children: ReactNode;
  tone?: "red" | "neutral";
}) => (
  <div
    className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-semibold ${
      tone === "red" ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-500"
    }`}
  >
    {children}
  </div>
);

export default function Contact() {
  const { t } = useTranslation();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const contactCards = [
    {
      key: "office",
      title: t("contact.sections.office.title"),
      description: t("contact.sections.office.description"),
      phoneLabel: t("contact.sections.office.phoneLabel"),
      phone: t("contact.sections.office.phone"),
      emailLabel: t("contact.sections.office.emailLabel"),
      email: t("contact.sections.office.email"),
    },
    {
      key: "transport",
      title: t("contact.sections.transport.title"),
      description: t("contact.sections.transport.description"),
      phoneLabel: t("contact.sections.transport.phoneLabel"),
      phone: t("contact.sections.transport.phone"),
      emailLabel: t("contact.sections.transport.emailLabel"),
      email: t("contact.sections.transport.email"),
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-4 md:grid-cols-2">
        {contactCards.map((card) => (
          <article
            key={card.key}
            id={card.key === "transport" ? "transport" : undefined}
            className="card flex h-full flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <IconBubble tone="red">{card.key === "transport" ? "🚚" : "✉️"}</IconBubble>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">{card.title}</h2>
                <p className="text-sm text-neutral-600">{card.description}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
                <IconBubble>📞</IconBubble>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{card.phoneLabel}</p>
                  <a
                    href={`tel:${sanitizePhoneHref(card.phone)}`}
                    className="text-base font-semibold text-neutral-900 transition hover:text-red-600"
                  >
                    {card.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
                <IconBubble>✉️</IconBubble>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{card.emailLabel}</p>
                  <a
                    href={`mailto:${card.email}`}
                    className="text-base font-semibold text-neutral-900 transition hover:text-red-600"
                  >
                    {card.email}
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="card space-y-6">
        <div className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-600">
          {t("contact.form.badge")}
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900">{t("contact.form.title")}</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-neutral-800">
                {t("contact.form.name")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder={t("contact.form.namePlaceholder")}
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-neutral-800">
                {t("contact.form.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder={t("contact.form.emailPlaceholder")}
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-semibold text-neutral-800">
              {t("contact.form.phone")}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder={t("contact.form.phonePlaceholder")}
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-semibold text-neutral-800">
              {t("contact.form.message")}
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder={t("contact.form.messagePlaceholder")}
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
          <label className="flex gap-3 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
              required
            />
            <span>{t("contact.form.consent")}</span>
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-500"
            >
              {t("contact.form.submit")}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-3xl shadow-sm">
        <iframe
          title={t("contact.location.mapTitle")}
          src="https://www.google.com/maps?q=Korytnica+52A+08-455+Trojan%C3%B3w&output=embed"
          className="h-[360px] w-full sm:h-[420px] lg:h-[520px]"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
}
