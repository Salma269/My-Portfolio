export type Locale = 'en' | 'ar';
export type ArabicStatus = 'draft' | 'approved';

export type LocalizedString = {
  en: string;
  ar: string;
};

export type LocalizedStringArray = {
  en: string[];
  ar: string[];
};

export type LocaleStatus = {
  ar: ArabicStatus;
};

export type SectionKey = 'experience' | 'skills' | 'projects' | 'education' | 'certifications' | 'contact';

export type AuditFields = {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  updatedBy?: string;
};

export type SectionConfig = Record<SectionKey, { visible: boolean; order: number }>;

export type SocialLink = {
  label: string;
  url: string;
  visible: boolean;
  order: number;
};

export type SiteSettings = AuditFields & {
  _id?: 'main';
  hero: {
    title: LocalizedString;
    subtitle: LocalizedString;
    eyebrow: LocalizedString;
    ctaLabel: LocalizedString;
    secondaryCtaLabel: LocalizedString;
  };
  about: {
    heading: LocalizedString;
    body: LocalizedString;
  };
  contact: {
    email: string;
    phones: string[];
    location: LocalizedString;
    githubUrl: string;
  };
  seo: {
    title: LocalizedString;
    description: LocalizedString;
    ogImageUrl?: string;
  };
  sections: SectionConfig;
  socialLinks: SocialLink[];
  localeStatus: LocaleStatus;
};

export type EntityBase = AuditFields & {
  _id?: string;
  id?: string;
  order: number;
  visible: boolean;
  localeStatus: LocaleStatus;
};

export type Experience = EntityBase & {
  title: LocalizedString;
  organization: LocalizedString;
  location?: LocalizedString;
  startDate: string;
  endDate: string;
  periodLabel: string;
  bullets: LocalizedStringArray;
};

export type Education = EntityBase & {
  institution: LocalizedString;
  degree: LocalizedString;
  details?: LocalizedString;
  graduationDate: string;
  gpa?: string;
};

export type Certification = EntityBase & {
  name: LocalizedString;
  issuer?: LocalizedString;
  details?: LocalizedString;
  dateLabel: string;
  score?: string;
};

export type SkillCategoryKey =
  | 'programming-languages'
  | 'frameworks-libraries'
  | 'mobile-development'
  | 'web-development'
  | 'ai-machine-learning'
  | 'embedded-systems'
  | 'databases'
  | 'testing-quality'
  | 'devops-tools'
  | 'architecture';

export type Skill = EntityBase & {
  name: LocalizedString;
  categoryKey: SkillCategoryKey;
  iconId?: string;
};

export type ProjectImage = {
  id: string;
  blobUrl: string;
  pathname: string;
  alt: LocalizedString;
  caption?: LocalizedString;
  order: number;
  width?: number;
  height?: number;
  mimeType?: string;
};

export type Project = EntityBase & {
  slug: string;
  title: LocalizedString;
  shortDescription: LocalizedString;
  detailedDescription: LocalizedString;
  highlights: LocalizedStringArray;
  technologies: string[];
  repoUrl?: string;
  liveUrl?: string;
  periodLabel: string;
  featured: boolean;
  published: boolean;
  coverImage?: ProjectImage;
  gallery: ProjectImage[];
};

export type ContactMessage = {
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ipHash: string;
  userAgent?: string;
  status: 'received' | 'emailed' | 'failed';
  createdAt: Date | string;
};

export type AdminUser = {
  _id?: string;
  email: string;
  passwordHash: string;
  createdAt: Date | string;
  lastLoginAt?: Date | string;
};

export type PortfolioContent = {
  siteSettings: SiteSettings;
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  skills: Skill[];
  projects: Project[];
};

export type CollectionName = 'experiences' | 'education' | 'certifications' | 'skills' | 'projects';
