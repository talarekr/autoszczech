export type RegistrationStatus = "PENDING" | "APPROVED";

export interface AdminUser {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  registrationStatus?: RegistrationStatus | null;
  createdAt: string;
  registrationForm?: Record<string, unknown> | null;
}
