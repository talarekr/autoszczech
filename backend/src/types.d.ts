declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
    PORT?: string;
    RENDER_EXTERNAL_URL?: string;
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
  }
}
