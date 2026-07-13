import { MongoClient, type Db } from 'mongodb';
import { env, requireEnv } from './env.js';

type GlobalMongo = typeof globalThis & {
  __salmaMongoClientPromise?: Promise<MongoClient>;
};

const globalMongo = globalThis as GlobalMongo;

export function getMongoClient(): Promise<MongoClient> {
  if (!globalMongo.__salmaMongoClientPromise) {
    globalMongo.__salmaMongoClientPromise = new MongoClient(requireEnv('mongodbUri'), {
      maxPoolSize: 10,
    }).connect();
  }
  return globalMongo.__salmaMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(parseDbName(env.mongodbUri) ?? 'Salma-Portfolio');
}

function parseDbName(uri?: string): string | undefined {
  if (!uri) return undefined;
  try {
    const url = new URL(uri);
    const name = url.pathname.replace(/^\//, '');
    return name || undefined;
  } catch {
    return undefined;
  }
}
