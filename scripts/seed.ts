import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { seedContent } from '../shared/seedContent';
import { collectionNames, ensureIndexes } from '../api/_lib/content';
import { env } from '../api/_lib/env';

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

  const adminCount = await db.collection('adminUsers').countDocuments();
  if (adminCount === 0 && env.adminEmail && env.adminPasswordHash) {
    await db.collection('adminUsers').insertOne({
      email: env.adminEmail.toLowerCase(),
      passwordHash: env.adminPasswordHash,
      createdAt: now,
    });
    console.log('✓ Bootstrapped admin user');
  } else if (adminCount === 0) {
    console.log('• No admin user created. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH, then rerun npm run seed.');
  } else {
    console.log(`• adminUsers has ${adminCount} doc(s); skipped`);
  }

  console.log('Done. Arabic content is stored as draft and can be approved in the admin CMS.');
} finally {
  await client.close();
}
