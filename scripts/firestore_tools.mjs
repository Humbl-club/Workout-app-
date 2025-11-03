#!/usr/bin/env node
// Firestore admin utilities: scan, dump, list, get
// Auth via GOOGLE_APPLICATION_CREDENTIALS or ./serviceAccountKey.json

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function parseArgs(argv) {
  const out = { _: [] };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--')) {
      const [k, vRaw] = a.slice(2).split('=');
      const v = vRaw === undefined ? true : vRaw;
      out[k] = v;
    } else {
      out._.push(a);
    }
  }
  return out;
}

function ensureAdminInitialized() {
  if (getApps().length) return;
  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (gac && fs.existsSync(gac)) {
    initializeApp({ credential: applicationDefault() });
    return;
  }
  const local = path.resolve(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(local)) {
    const json = JSON.parse(fs.readFileSync(local, 'utf8'));
    initializeApp({ credential: cert(json) });
    return;
  }
  console.error('No credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or add ./serviceAccountKey.json');
  process.exit(1);
}

async function listCollection(colRef, { limitPerCollection }) {
  const q = Number.isFinite(+limitPerCollection) && +limitPerCollection > 0 ? colRef.limit(+limitPerCollection) : colRef;
  const snap = await q.get();
  return snap.docs;
}

async function traverseAll({ depth = 3, limitPerCollection = 100, includeData = false, maxDocs = 5000, only = '' } = {}) {
  ensureAdminInitialized();
  const db = getFirestore();
  const result = [];
  let count = 0;
  const filter = new Set(
    String(only || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );

  async function scanCollection(colRef, level) {
    if (count >= maxDocs) return;
    const docs = await listCollection(colRef, { limitPerCollection });
    for (const d of docs) {
      if (count >= maxDocs) break;
      count++;
      const entry = { path: d.ref.path };
      if (includeData) entry.data = d.data();
      result.push(entry);
      if (level < depth) {
        const subcols = await d.ref.listCollections();
        for (const sc of subcols) {
          await scanCollection(sc, level + 1);
          if (count >= maxDocs) break;
        }
      }
    }
  }

  const top = await db.listCollections();
  for (const col of top) {
    if (filter.size && !filter.has(col.id)) continue;
    await scanCollection(col, 0);
    if (count >= maxDocs) break;
  }
  return result;
}

async function cmdScan(args) {
  const depth = Number(args.depth ?? 2);
  const limitPerCollection = Number(args.limit ?? 25);
  const includeData = Boolean(args.data ?? false);
  const maxDocs = Number(args.maxDocs ?? 2000);
  const only = args.only ?? '';

  const items = await traverseAll({ depth, limitPerCollection, includeData, maxDocs, only });
  for (const it of items) {
    if (includeData) {
      console.log(`${it.path} ${JSON.stringify(it.data)}`);
    } else {
      console.log(it.path);
    }
  }
  console.error(`\nScanned ${items.length} documents.`);
}

async function cmdDump(args) {
  const out = args.out || path.resolve(process.cwd(), '.data', 'firestore_dump.jsonl');
  const dir = path.dirname(out);
  fs.mkdirSync(dir, { recursive: true });

  const depth = Number(args.depth ?? 10);
  const limitPerCollection = Number(args.limit ?? 1000);
  const maxDocs = Number(args.maxDocs ?? 200000);
  const only = args.only ?? '';

  const items = await traverseAll({ depth, limitPerCollection, includeData: true, maxDocs, only });
  const fd = fs.openSync(out, 'w');
  try {
    for (const it of items) {
      fs.writeSync(fd, JSON.stringify(it) + '\n');
    }
  } finally {
    fs.closeSync(fd);
  }
  console.log(`Dumped ${items.length} docs to ${out}`);
}

async function cmdList(args) {
  ensureAdminInitialized();
  const db = getFirestore();
  const colPath = args._[1];
  if (!colPath) {
    console.error('Usage: list <collectionPath> [--limit=100]');
    process.exit(1);
  }
  const limitPerCollection = Number(args.limit ?? 100);
  const colRef = db.collection(colPath);
  const docs = await listCollection(colRef, { limitPerCollection });
  for (const d of docs) console.log(`${d.ref.path}`);
  console.error(`\nListed ${docs.length} docs in ${colPath}`);
}

async function cmdGet(args) {
  ensureAdminInitialized();
  const db = getFirestore();
  const docPath = args._[1];
  if (!docPath) {
    console.error('Usage: get <documentPath>');
    process.exit(1);
  }
  const snap = await db.doc(docPath).get();
  if (!snap.exists) {
    console.error('Not found:', docPath);
    process.exit(2);
  }
  console.log(JSON.stringify({ path: docPath, data: snap.data() }));
}

  async function main() {
  const args = parseArgs(process.argv);
  const cmd = args._[0];
  switch (cmd) {
    case 'scan':
      await cmdScan(args);
      break;
    case 'dump':
      await cmdDump(args);
      break;
    case 'list':
      await cmdList(args);
      break;
    case 'get':
      await cmdGet(args);
      break;
    case 'counts': {
      ensureAdminInitialized();
      const db = getFirestore();
      const only = (args.only || '').split(',').map((s) => s.trim()).filter(Boolean);
      const cols = await db.listCollections();
      for (const c of cols) {
        if (only.length && !only.includes(c.id)) continue;
        const agg = await c.count().get();
        const n = agg.data().count;
        console.log(`${c.id}: ${n}`);
      }
      break;
    }
    case 'findid': {
      const target = args._[1];
      if (!target) {
        console.error('Usage: findid <documentId> [--only=colA,colB] [--depth=10] [--limit=1000] [--maxDocs=200000]');
        process.exit(1);
      }
      const depth = Number(args.depth ?? 10);
      const limitPerCollection = Number(args.limit ?? 1000);
      const maxDocs = Number(args.maxDocs ?? 200000);
      const only = args.only ?? '';
      const items = await traverseAll({ depth, limitPerCollection, includeData: false, maxDocs, only });
      let hits = 0;
      for (const it of items) {
        const parts = it.path.split('/');
        const id = parts[parts.length - 1];
        if (id === target) {
          console.log(it.path);
          hits++;
        }
      }
      console.error(`\nFound ${hits} matches for id '${target}'.`);
      break;
    }
    default:
      console.log(`Usage:
  scan [--depth=2] [--limit=25] [--maxDocs=2000] [--only=colA,colB] [--data]
  dump [--out=./.data/firestore_dump.jsonl] [--depth=10] [--limit=1000] [--maxDocs=200000] [--only=col]
  list <collectionPath> [--limit=100]
  get <documentPath>
  findid <documentId> [--only=colA,colB]

Auth: set GOOGLE_APPLICATION_CREDENTIALS or place ./serviceAccountKey.json`);
  }
}

main().catch((e) => {
  console.error('Error:', e?.message || e);
  process.exit(1);
});
