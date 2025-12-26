const DEFAULT_JWT_SECRET = "dev-autoszczech-secret";

export const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

if (!process.env.JWT_SECRET) {
  console.warn("[auth] JWT_SECRET not set; using insecure default for local development.");
}
