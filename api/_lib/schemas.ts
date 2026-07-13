import { z } from 'zod';

const localizedString = z
  .object({
    en: z.string().trim().min(1).max(5000),
    ar: z.string().trim().max(5000).default(''),
  })
  .strict();

const optionalLocalizedString = z
  .object({
    en: z.string().trim().max(5000).default(''),
    ar: z.string().trim().max(5000).default(''),
  })
  .strict();

const localizedStringArray = z
  .object({
    en: z.array(z.string().trim().min(1).max(800)).max(12),
    ar: z.array(z.string().trim().max(800)).max(12).default([]),
  })
  .strict();

const localeStatus = z.object({ ar: z.enum(['draft', 'approved']).default('draft') }).strict();

const base = {
  order: z.coerce.number().int().min(0).max(10000).default(0),
  visible: z.boolean().default(true),
  localeStatus: localeStatus.default({ ar: 'draft' }),
};

const url = z.string().trim().url().max(2048).refine((value) => value.startsWith('https://'), 'Use HTTPS URLs only');
const assetUrl = z.union([url, z.string().trim().regex(/^\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+$/, 'Use a HTTPS URL or a root-relative asset path').max(2048)]);
const optionalUrl = z.union([url, z.literal(''), z.undefined()]).transform((value) => (value ? value : undefined));

export const siteSettingsSchema = z
  .object({
    hero: z
      .object({
        title: localizedString,
        subtitle: localizedString,
        eyebrow: localizedString,
        ctaLabel: localizedString,
        secondaryCtaLabel: localizedString,
      })
      .strict(),
    about: z.object({ heading: localizedString, body: localizedString }).strict(),
    contact: z
      .object({
        email: z.string().trim().email().max(254),
        phones: z.array(z.string().trim().min(4).max(30)).max(4),
        location: localizedString,
        githubUrl: url,
      })
      .strict(),
    seo: z
      .object({
        title: localizedString,
        description: localizedString,
        ogImageUrl: optionalUrl,
      })
      .strict(),
    sections: z.record(z.string(), z.object({ visible: z.boolean(), order: z.number().int() })),
    socialLinks: z
      .array(z.object({ label: z.string().trim().min(1).max(60), url, visible: z.boolean(), order: z.number().int() }).strict())
      .max(10),
    localeStatus,
  })
  .strict();

export const siteSettingsPatchSchema = siteSettingsSchema.partial().strict();

export const experienceSchema = z
  .object({
    title: localizedString,
    organization: localizedString,
    location: optionalLocalizedString.optional(),
    startDate: z.string().trim().regex(/^\d{4}-\d{2}$/),
    endDate: z.union([z.string().trim().regex(/^\d{4}-\d{2}$/), z.literal('present')]),
    periodLabel: z.string().trim().min(3).max(80),
    bullets: localizedStringArray,
    ...base,
  })
  .strict();

export const educationSchema = z
  .object({
    institution: localizedString,
    degree: localizedString,
    details: optionalLocalizedString.optional(),
    graduationDate: z.string().trim().regex(/^\d{4}-\d{2}$/),
    gpa: z.string().trim().max(20).optional(),
    ...base,
  })
  .strict();

export const certificationSchema = z
  .object({
    name: localizedString,
    issuer: optionalLocalizedString.optional(),
    details: optionalLocalizedString.optional(),
    dateLabel: z.string().trim().min(2).max(120),
    score: z.string().trim().max(40).optional(),
    ...base,
  })
  .strict();

export const skillSchema = z
  .object({
    name: localizedString,
    categoryKey: z.enum([
      'programming-languages',
      'frameworks-libraries',
      'mobile-development',
      'web-development',
      'ai-machine-learning',
      'embedded-systems',
      'databases',
      'testing-quality',
      'devops-tools',
      'architecture',
    ]),
    iconId: z.string().trim().max(80).optional(),
    ...base,
  })
  .strict();

export const projectImageSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    blobUrl: assetUrl,
    pathname: z.string().trim().min(1).max(500),
    alt: localizedString,
    caption: optionalLocalizedString.optional(),
    order: z.number().int().min(0).max(1000),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    mimeType: z.string().trim().max(80).optional(),
  })
  .strict();

export const projectSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: localizedString,
    shortDescription: localizedString,
    detailedDescription: localizedString,
    highlights: localizedStringArray,
    technologies: z.array(z.string().trim().min(1).max(80)).min(1).max(24),
    repoUrl: optionalUrl,
    liveUrl: optionalUrl,
    periodLabel: z.string().trim().min(3).max(120),
    featured: z.boolean().default(false),
    published: z.boolean().default(false),
    coverImage: projectImageSchema.optional(),
    gallery: z.array(projectImageSchema).max(12).default([]),
    ...base,
  })
  .strict();

export const entitySchemas = {
  experiences: experienceSchema,
  education: educationSchema,
  certifications: certificationSchema,
  skills: skillSchema,
  projects: projectSchema,
} as const;

export const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    subject: z.string().trim().min(3).max(150),
    message: z.string().trim().min(10).max(3000),
    _website: z.string().max(0).optional().or(z.literal('')),
    honeypot: z.string().max(0).optional().or(z.literal('')),
  })
  .strict();

export const loginSchema = z
  .object({
    username: z.string().trim().min(3).max(254),
    password: z.string().min(8).max(200),
  })
  .strict();

export const reorderSchema = z.object({ orderedIds: z.array(z.string().min(1)).min(1).max(100) }).strict();
export const approveSchema = z
  .object({ entity: z.enum(['siteSettings', 'experiences', 'education', 'certifications', 'skills', 'projects']), id: z.string().optional(), locale: z.literal('ar') })
  .strict();
