import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { seedContent } from '../shared/seedContent.js';
import { collectionNames, ensureIndexes } from '../api/_lib/content.js';
import { env } from '../api/_lib/env.js';

const force = process.argv.includes('--force');

if (!env.mongodbUri) {
  console.error('Missing MONGODB_URI. Add it to .env or your shell environment.');
  process.exit(1);
}

const client = new MongoClient(env.mongodbUri);

try {
  await client.connect();
  const db = client.db('Salma-Portfolio');
  await ensureIndexes(db);
  const now = new Date();

  const existingSettings = await db.collection<Record<string, unknown> & { _id: string }>('siteSettings').findOne({ _id: 'main' });
  if (!existingSettings || force) {
    await db.collection<Record<string, unknown> & { _id: string }>('siteSettings').updateOne(
      { _id: 'main' },
      { $set: { ...seedContent.siteSettings, createdAt: existingSettings?.createdAt ?? now, updatedAt: now, updatedBy: 'seed' } },
      { upsert: true },
    );
    console.log('✓ Seeded siteSettings');
  } else {
    console.log('• siteSettings exists; skipped');
  }

  for (const name of collectionNames) {
    const collection = db.collection(name);
    const count = await collection.countDocuments();
    if (count > 0 && !force) {
      console.log(`• ${name} has ${count} docs; skipped`);
      continue;
    }
    if (force) await collection.deleteMany({});
    const docs = seedContent[name].map((doc) => ({ ...doc, createdAt: now, updatedAt: now, updatedBy: 'seed' }));
    if (docs.length) await collection.insertMany(docs as never[]);
    console.log(`✓ Seeded ${name} (${docs.length})`);
  }


  let updatedProjectAssets = 0;
  for (const project of seedContent.projects) {
    if (!project.coverImage && project.gallery.length === 0) continue;
    const result = await db.collection('projects').updateOne(
      { slug: project.slug, $or: [{ coverImage: { $exists: false } }, { gallery: { $size: 0 } }] },
      { $set: { coverImage: project.coverImage, gallery: project.gallery, updatedAt: now, updatedBy: 'asset-backfill' } },
    );
    updatedProjectAssets += result.modifiedCount;
  }
  console.log(updatedProjectAssets ? `✓ Added project visuals to ${updatedProjectAssets} project(s)` : '• Project visuals already present; skipped');

  const adminUsername = env.adminUsername?.toLowerCase();
  const adminPasswordHash = env.adminPasswordHash;
  if (adminUsername && adminPasswordHash) {
    await db.collection('adminUsers').updateOne(
      { username: adminUsername },
      {
        $set: {
          username: adminUsername,
          email: env.adminEmail?.toLowerCase(),
          passwordHash: adminPasswordHash,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    console.log(`✓ Bootstrapped admin user: ${adminUsername}`);
  } else {
    console.log('• No admin user created. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH, then rerun bun run seed.');
  }

  console.log('Done. Arabic content is stored as draft and can be approved in the admin CMS.');
} finally {
  await client.close();
}
