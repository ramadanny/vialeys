"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { Mutex } = require("async-mutex");
const { proto } = require("../../WAProto");
const { initAuthCreds } = require("./auth-utils");
const { BufferJSON } = require("./generics");

// Graceful module loading for better-sqlite3 and Bun SQLite
let Database;
let isBun = false;

// Check if running on Bun runtime
if (typeof process !== "undefined" && process.versions && process.versions.bun) {
    isBun = true;
}

// Try to load appropriate SQLite implementation
function loadDatabase() {
    if (isBun) {
        try {
            // Bun has native SQLite support
            const { Database: BunDatabase } = require("bun:sqlite");
            return BunDatabase;
        } catch (error) {
            // Fallback to better-sqlite3 if bun:sqlite is not available
        }
    }
    
    try {
        // Try to load better-sqlite3 for Node.js
        return require("better-sqlite3");
    } catch (error) {
        throw new Error(
            "better-sqlite3 is required for useSQLiteAuthState when running on Node.js. " +
            "Install it with: npm install better-sqlite3\n" +
            "Alternatively, run your application using Bun runtime which has native SQLite support."
        );
    }
}

const useSQLiteAuthState = async (dbPath) => {
    // Load database module only when function is called
    const DatabaseImpl = loadDatabase();
    
    const db = new DatabaseImpl(dbPath);
    
    // Create tables if they don't exist
    db.exec(`
        CREATE TABLE IF NOT EXISTS creds (
            id TEXT PRIMARY KEY,
            data TEXT
        );
        
        CREATE TABLE IF NOT EXISTS keys (
            category TEXT,
            id TEXT,
            data TEXT,
            PRIMARY KEY (category, id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_keys_category ON keys(category);
        CREATE INDEX IF NOT EXISTS idx_keys_id ON keys(id);
    `);

    const mutex = new Mutex();

    const writeCreds = async (data) => {
        const release = await mutex.acquire();
        try {
            const stmt = db.prepare(`
                INSERT OR REPLACE INTO creds (id, data) VALUES (?, ?)
            `);
            stmt.run("main", JSON.stringify(data, BufferJSON.replacer));
        } finally {
            release();
        }
    };

    const readCreds = async () => {
        const release = await mutex.acquire();
        try {
            const stmt = db.prepare("SELECT data FROM creds WHERE id = ?");
            const row = stmt.get("main");
            if (!row) return null;
            return JSON.parse(row.data, BufferJSON.reviver);
        } finally {
            release();
        }
    };

    const writeKey = async (category, id, data) => {
        const release = await mutex.acquire();
        try {
            const stmt = db.prepare(`
                INSERT OR REPLACE INTO keys (category, id, data) VALUES (?, ?, ?)
            `);
            if (data) {
                stmt.run(category, id, JSON.stringify(data, BufferJSON.replacer));
            } else {
                const deleteStmt = db.prepare("DELETE FROM keys WHERE category = ? AND id = ?");
                deleteStmt.run(category, id);
            }
        } finally {
            release();
        }
    };

    const readKeys = async (category, ids) => {
        const release = await mutex.acquire();
        try {
            const data = {};
            const stmt = db.prepare("SELECT id, data FROM keys WHERE category = ? AND id = ?");
            
            for (const id of ids) {
                const row = stmt.get(category, id);
                let value = row ? JSON.parse(row.data, BufferJSON.reviver) : null;
                
                if (category === "app-state-sync-key" && value) {
                    value = proto.Message.AppStateSyncKeyData.fromObject(value);
                }
                
                data[id] = value;
            }
            
            return data;
        } finally {
            release();
        }
    };

    const writeKeys = async (data) => {
        const release = await mutex.acquire();
        try {
            const insertStmt = db.prepare(`
                INSERT OR REPLACE INTO keys (category, id, data) VALUES (?, ?, ?)
            `);
            const deleteStmt = db.prepare("DELETE FROM keys WHERE category = ? AND id = ?");
            
            const tasks = [];
            for (const category in data) {
                for (const id in data[category]) {
                    const value = data[category][id];
                    if (value) {
                        insertStmt.run(category, id, JSON.stringify(value, BufferJSON.replacer));
                    } else {
                        deleteStmt.run(category, id);
                    }
                }
            }
        } finally {
            release();
        }
    };

    // Load existing creds or initialize new ones
    let creds = await readCreds();
    if (!creds) {
        creds = initAuthCreds();
        await writeCreds(creds);
    }

    return {
        state: {
            creds: creds,
            keys: {
                get: async (type, ids) => {
                    return await readKeys(type, ids);
                },
                set: async (data) => {
                    await writeKeys(data);
                },
            },
        },
        saveCreds: async () => {
            await writeCreds(creds);
        },
        close: () => {
            db.close();
        }
    };
};

/**
 * useSQLiteAuthState - SQLite-based authentication state management for vialeys
 * 
 * This function provides persistent storage for WhatsApp session credentials using SQLite.
 * It supports both Node.js (with better-sqlite3) and Bun runtime (with native bun:sqlite).
 * 
 * @param {string} dbPath - Path to the SQLite database file
 * @returns {Promise<{state: Object, saveCreds: Function, close: Function}>} Authentication state object
 * 
 * @example
 * // Node.js usage (requires better-sqlite3)
 * const { useSQLiteAuthState } = require('vialeys');
 * const auth = await useSQLiteAuthState('./session.db');
 * 
 * @example
 * // Bun runtime usage (no additional dependencies needed)
 * bun run bot.js
 * 
 * @note
 * - For Node.js: Install better-sqlite3 with `npm install better-sqlite3`
 * - For Bun: No additional installation required, uses native SQLite
 * - This feature is optional and only needed if you want persistent session storage
 */

module.exports = { useSQLiteAuthState };
