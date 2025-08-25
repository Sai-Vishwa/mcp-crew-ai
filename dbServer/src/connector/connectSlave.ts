// db.ts

import mysql, { type Connection } from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

let connectionSlave: Connection;

async function connectSlave() {
  try {

    if (connectionSlave) {
      return connectionSlave;
    }

    connectionSlave = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      socketPath: process.env.SOCKETPATH_SLAVE,
      port: 3308,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // console.log('✅ Connected to MySQL master with thread ID:', connectionMaster.threadId);

    // const [rows] = await connectionMaster.query('SELECT NOW()');
    // console.log('🕒 Current time:', rows);

    return connectionSlave;

  } catch (err) {
    console.error('❌ Error connecting to MySQL:', err);
    process.exit(1);
  }
}

export { connectSlave };
