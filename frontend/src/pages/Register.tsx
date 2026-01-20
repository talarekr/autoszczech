import axios from "axios";
import { ChangeEvent, FormEvent, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiUrl } from "../lib/api";

interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  country: string;
  postalCode: string;
  city: string;
  street: string;
  houseNumber: string;
  apartmentNumber: string;
  birthDate: string;
  taxId: string;
  pesel: string;
  acceptRules: boolean;
}

const initialState: FormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "+48",
  country: "pl",
  postalCode: "",
  city: "",
  street: "",
  houseNumber: "",
  apartmentNumber: "",
  birthDate: "",
  taxId: "",
  pesel: "",
  acceptRules: false
};

export default function Register() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.type === "checkbox" ? (event.target as HTMLInputElement).checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (!form.acceptRules) {
      setErrorKey("register.errors.consent");
      return;
    }

    if (form.password.trim() !== form.confirmPassword.trim()) {
      setErrorKey("register.errors.mismatch");
      return;
    }

    setSubmitting(true);
    setErrorKey(null);
    setSubmitted(false);

    try {
      const apiUrl = await getApiUrl();
      const { confirmPassword, acceptRules, ...payload } = form;

      const normalizedPayload = {
        ...payload,
        email: payload.email.trim().toLowerCase(),
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
      };

      await axios.post(`${apiUrl}/api/auth/register`, {
        ...normalizedPayload,
        registrationSource: "web",
      });

      setSubmitted(true);
      setForm(initialState);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setErrorKey("register.errors.duplicate");
      } else {
        setErrorKey("register.errors.server");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <section className="card space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">{t("register.badge")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-neutral-900">{t("register.title")}</h1>
          <p className="text-sm text-neutral-600">{t("register.description")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t("register.fields.firstName")} required value={form.firstName} onChange={handleChange("firstName")} />
            <Field label={t("register.fields.middleName")} value={form.middleName} onChange={handleChange("middleName")} />
            <Field label={t("register.fields.lastName")} required value={form.lastName} onChange={handleChange("lastName")} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("register.fields.email")} type="email" required value={form.email} onChange={handleChange("email")} />
            <Field label={t("register.fields.phone")} required value={form.phone} onChange={handleChange("phone")} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("register.fields.password")} type="password" required value={form.password} onChange={handleChange("password")} />
            <Field
              label={t("register.fields.confirmPassword")}
              type="password"
              required
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-neutral-900">{t("register.personalData")}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <SelectField label={t("register.fields.country")} value={form.country} onChange={handleChange("country")}>
                <option value="pl">{t("register.countries.poland")}</option>
                <option value="de">{t("register.countries.germany")}</option>
                <option value="cz">{t("register.countries.czechia")}</option>
                <option value="sk">{t("register.countries.slovakia")}</option>
                <option value="ch">{t("register.countries.switzerland")}</option>
              </SelectField>
              <Field
                label={t("register.fields.postalCode")}
                required
                value={form.postalCode}
                onChange={handleChange("postalCode")}
                placeholder={t("register.placeholders.postalCode")}
              />
              <Field label={t("register.fields.city")} required value={form.city} onChange={handleChange("city")} />
            </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t("register.fields.street")} required value={form.street} onChange={handleChange("street")} />
            <Field label={t("register.fields.houseNumber")} required value={form.houseNumber} onChange={handleChange("houseNumber")} />
            <Field label={t("register.fields.apartmentNumber")} value={form.apartmentNumber} onChange={handleChange("apartmentNumber")} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t("register.fields.birthDate")} type="date" required value={form.birthDate} onChange={handleChange("birthDate")} />
            <Field label={t("register.fields.taxId")} value={form.taxId} onChange={handleChange("taxId")} placeholder={t("register.placeholders.taxId")} />
            <Field label={t("register.fields.pesel")} value={form.pesel} onChange={handleChange("pesel")} placeholder={t("register.placeholders.pesel")} />
          </div>
        </div>

          <label className="flex gap-3 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={form.acceptRules}
              onChange={handleChange("acceptRules")}
              required
              className="mt-1 h-5 w-5 rounded border-neutral-300 text-red-600 focus:ring-red-500"
            />
            <span>
              {t("register.consent.prefix")}
              <a
                href="/terms"
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-red-600 underline underline-offset-4 hover:text-red-500"
              >
                {t("register.consent.terms")}
              </a>
              {t("register.consent.conjunction")}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-red-600 underline underline-offset-4 hover:text-red-500"
              >
                {t("register.consent.privacy")}
              </a>
              {t("register.consent.suffix")}
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-400"
          >
            {submitting ? t("register.submitting") : t("register.submit")}
          </button>

          {errorKey && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{t(errorKey)}</p>
          )}

          {submitted && (
            <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {t("register.success")}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

function Field({ label, value, onChange, type = "text", required, placeholder }: FieldProps) {
  return (
    <label className="space-y-1 text-sm font-medium text-neutral-600">
      {label}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-normal text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
      />
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}

function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  return (
    <label className="space-y-1 text-sm font-medium text-neutral-600">
      {label}
      <select
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
      >
        {children}
      </select>
    </label>
  );
}
