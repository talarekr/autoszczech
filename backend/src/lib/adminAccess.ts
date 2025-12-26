export const ADMIN_EMAILS = ["talarekr@gmail.com", "biuro@autoszczech.ch"] as const;

export const normalizeAdminEmail = (email?: string) => (typeof email === "string" ? email.trim().toLowerCase() : "");

export const isAllowedAdminEmail = (email?: string) => ADMIN_EMAILS.includes(normalizeAdminEmail(email) as typeof ADMIN_EMAILS[number]);
