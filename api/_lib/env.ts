export const env = {
  mongodbUri: process.env.MONGODB_URI,
  smtpHost: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: String(process.env.SMTP_SECURE ?? 'false') === 'true',
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  authSecret: process.env.AUTH_SECRET,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  allowedOrigin: process.env.ALLOWED_ORIGIN,
  blobToken: process.env.BLOB_READ_WRITE_TOKEN ?? process.env.MEDIA_STORAGE_TOKEN,
  nodeEnv: process.env.NODE_ENV ?? 'development',
};

export function requireEnv(name: keyof typeof env): string {
  const value = env[name];
  if (!value || typeof value !== 'string') {
    throw new Error(`Missing required environment variable: ${String(name)}`);
  }
  return value;
}
