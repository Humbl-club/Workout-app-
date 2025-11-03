#!/usr/bin/env node
// Minimal Firestore connectivity check using Firebase Admin SDK (ESM)
// Looks for credentials via GOOGLE_APPLICATION_CREDENTIALS or ./serviceAccountKey.json

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.startsWith('--') ? a.slice(2).split('=') : [a, true];
    return [k, v ?? true];
  })
);

const limit = Number(args.get('limit') ?? 5);
const dump = Boolean(args.get('dump') ?? false);

function findLocalServiceAccount() {
  const localPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(localPath)) return localPath;
  return null;
}

function initAdmin() {
  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (gac && fs.existsSync(gac)) {
    initializeApp({ credential: applicationDefault() });
    return;
  }
  const local = findLocalServiceAccount();
  if (local) {
    const json = JSON.parse(fs.readFileSync(local, 'utf8'));
    initializeApp({ credential: cert(json) });
    return;
  }
  console.error('No credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or add ./serviceAccountKey.json');
  process.exit(1);
}

async function main() {
  if (!getApps().length) initAdmin();
  const db = getFirestore();

  console.log('Connected to Firestore (admin). Listing top-level collections...');
  const collections = await db.listCollections();
  if (!collections.length) {
    console.log('No top-level collections found.');
    return;
  }

  for (const col of collections) {
    const q = col.limit(Number.isFinite(limit) && limit > 0 ? limit : 5);
    const snap = await q.get();
    console.log(`- ${col.id}: ${snap.size} docs (showing up to ${limit})`);
    if (dump) {
      for (const doc of snap.docs) {
        console.log(`  • ${col.id}/${doc.id}`, JSON.stringify(doc.data()));
      }
    } else {
      for (const doc of snap.docs) {
        console.log(`  • ${col.id}/${doc.id}`);
      }
    }
  }
}

main().catch((err) => {
  console.error('Health check failed:', err?.message || err);
  process.exit(1);
});

