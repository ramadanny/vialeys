"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { Mutex } = require("async-mutex");
const { proto } = require("../../WAProto");
const { initAuthCreds } = require("./auth-utils");
const { BufferJSON } = require("./generics");

// Module loading for better-sqlite3 only (Bun support removed)
let Database;
let loadError = null;

// Try to load better-sqlite3 at module import time
try {
    Database = require("better-sqlite3");
} catch (error) {
    loadError = error;
}

const useSQLiteAuthState = async (dbPath) => {
    // Check if better-sqlite3 failed to load and throw specific error
    if (loadError) {
        throw new Error(
            `Gagal memuat better-sqlite3: ${loadError.message}\n\n` +
            `PENYEBAB MUNGKIN:\n` +
            `1. Library 'better-sqlite3' belum terinstal.\n` +
            `   Solusi: Jalankan 'npm install better-sqlite3' atau 'yarn add better-sqlite3'.\n\n` +
            `2. Gagal kompilasi native module (umum di VPS/Panel tanpa build tools).\n` +
            `   Solusi: Pastikan Python, Make, dan C++ Compiler (g++) sudah terinstal di server Anda.\n` +
            `   Untuk Ubuntu/Debian: sudo apt-get install python3 make g++\n` +
            `   Untuk CentOS/RHEL: sudo yum install python3 make gcc-c++\n\n` +
            `CATATAN PENTING:\n` +
            `- Fitur ini TIDAK mendukung Bun secara otomatis.\n` +
            `- Anda HARUS menggunakan Node.js dengan better-sqlite3 yang terkompilasi dengan benar.\n` +
            `- Jika Anda menggunakan Bun, fitur ini tidak akan berfungsi. Gunakan metode auth lain.`
        );
    }
    
    if (!Database) {
        throw new Error('Internal error: better-sqlite3 module is undefined despite no load error.');
    }
    
    const db = new Database(dbPath);
    
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
 * Requires better-sqlite3 library to be installed and properly compiled.
 * 
 * @param {string} dbPath - Path to the SQLite database file
 * @returns {Promise<{state: Object, saveCreds: Function, close: Function}>} Authentication state object
 * 
 * @example
 * // Node.js usage (requires better-sqlite3)
 * const { useSQLiteAuthState } = require('vialeys');
 * const auth = await useSQLiteAuthState('./session.db');
 * 
 * @note
 * - REQUIRES: Install better-sqlite3 with `npm install better-sqlite3`
 * - REQUIRES: Build tools (Python, Make, g++) must be installed on your server
 * - NOT SUPPORTED: Bun runtime (this feature only works with Node.js + better-sqlite3)
 * - This feature is optional and only needed if you want persistent session storage
 * 
 * @throws {Error} If better-sqlite3 is not installed or fails to compile
 */

module.exports = { useSQLiteAuthState };
