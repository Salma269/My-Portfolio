import { ObjectId, type Collection, type Db } from 'mongodb';
import type { CollectionName, PortfolioContent } from '../../shared/types.js';
import { seedContent } from '../../shared/seedContent.js';

export const collectionNames: CollectionName[] = ['experiences', 'education', 'certifications', 'skills', 'projects'];

export function isCollectionName(value: string): value is CollectionName {
  return (collectionNames as string[]).includes(value);
}

export function asObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) throw new Error('Invalid ObjectId');
  return new ObjectId(id);
}

export function normalizeDoc<T>(doc: T): T {
  if (!doc || typeof doc !== 'object') return doc;
  const copy: Record<string, unknown> = { ...(doc as Record<string, unknown>) };
  if (copy._id && typeof copy._id === 'object' && 'toString' in copy._id) {
    copy.id = String(copy._id);
    copy._id = String(copy._id);
  }
  return copy as T;
}

export function normalizeDocs<T>(docs: unknown[]): T[] {
  return docs.map((doc) => normalizeDoc(doc)) as T[];
}

export async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection('projects').createIndex({ slug: 1 }, { unique: true }),
    db.collection('adminUsers').createIndex({ username: 1 }, { unique: true, sparse: true }),
    db.collection('adminUsers').createIndex({ email: 1 }, { unique: true }),
    db.collection('contactMessages').createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }),
    ...collectionNames.map((name) => db.collection(name).createIndex({ order: 1 })),
  ]);
}

export async function getPortfolioContent(db: Db, includeDrafts = false): Promise<PortfolioContent> {
  const siteSettings =
    (await db.collection<Record<string, unknown> & { _id: string }>('siteSettings').findOne({ _id: 'main' })) ?? seedContent.siteSettings;

  const [experiences, education, certifications, skills, projects] = await Promise.all([
    list(db.collection('experiences'), includeDrafts),
    list(db.collection('education'), includeDrafts),
    list(db.collection('certifications'), includeDrafts),
    list(db.collection('skills'), includeDrafts),
    list(db.collection('projects'), includeDrafts, { published: true }),
  ]);

  return {
    siteSettings: normalizeDoc(siteSettings) as PortfolioContent['siteSettings'],
    experiences: normalizeDocs(experiences) as PortfolioContent['experiences'],
    education: normalizeDocs(education) as PortfolioContent['education'],
    certifications: normalizeDocs(certifications) as PortfolioContent['certifications'],
    skills: normalizeDocs(skills) as PortfolioContent['skills'],
    projects: normalizeDocs(projects) as PortfolioContent['projects'],
  };
}

async function list(collection: Collection, includeDrafts: boolean, extraFilter: Record<string, unknown> = {}): Promise<unknown[]> {
  const filter = includeDrafts ? {} : { visible: true, ...extraFilter };
  if (includeDrafts) Object.assign(filter, extraFilter);
  const docs = await collection.find(filter).sort({ order: 1, createdAt: 1 }).toArray();
  if (docs.length > 0) return docs;

  const fallback = fallbackFor(collection.collectionName as CollectionName);
  return includeDrafts ? fallback : fallback.filter((item) => item.visible !== false && ('published' in item ? item.published !== false : true));
}

function fallbackFor(name: CollectionName) {
  return seedContent[name];
}

export function withAudit<T extends Record<string, unknown>>(doc: T, email = 'system'): T & { createdAt: Date; updatedAt: Date; updatedBy: string } {
  const now = new Date();
  return { ...doc, createdAt: now, updatedAt: now, updatedBy: email };
}

export function withUpdateAudit<T extends Record<string, unknown>>(doc: T, email = 'system'): T & { updatedAt: Date; updatedBy: string } {
  return { ...doc, updatedAt: new Date(), updatedBy: email };
}
