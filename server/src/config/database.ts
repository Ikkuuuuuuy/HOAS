import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DATABASE_PATH || './data/portal.db';
const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');

// Ensure data directory exists
const dataDir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Open (or create) the SQLite database using Node.js built-in
const db = new DatabaseSync(path.resolve(DB_PATH));

// Apply schema (idempotent — uses IF NOT EXISTS)
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);

console.log(`📦 Database initialized at ${path.resolve(DB_PATH)}`);

export default db;
// Safe migrations for custom fields
try { db.exec("ALTER TABLE document_requests ADD COLUMN registered_owner_name TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE document_requests ADD COLUMN property_address TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE document_requests ADD COLUMN details TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN address TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN block TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN lot TEXT;"); } catch (e) {}

