import './lib/chalk.js';
import './lib/markdown.js';
import fs from "fs/promises";
import { watch } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import readline from "readline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "database.json");
const PLUGIN_DIR = path.join(__dirname, "plugins");

// Database System
global.db = {
    data: { user: {}, settings: {}, owner: null },
    write: async () => await fs.writeFile(DB_PATH, JSON.stringify(global.db.data, null, 2)),
};

// Initial Database Load
try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    global.db.data = JSON.parse(raw);
} catch {
    await global.db.write();
}

// Auto-save every 10 seconds
setInterval(async () => {
    if (global.db.data) await global.db.write().catch(console.error);
}, 10 * 1000);

global.plugins = {};

/**
 * Hot Loader: Load or Reload single plugin
 */
const loadPlugin = async (filePath) => {
    try {
        const fileUrl = `${pathToFileURL(filePath).href}?update=${Date.now()}`;
        const module = await import(fileUrl);
        const name = path.basename(filePath);
        global.plugins[name] = module.default;
    } catch (e) {}
};

/**
 * Recursive Plugin Loader
 */
const loadPlugins = async (dir) => {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) await loadPlugins(fullPath);
            else if (entry.name.endsWith(".js")) await loadPlugin(fullPath);
        }
    } catch (e) {}
};

/**
 * Watcher: Monitor changes in plugins folder
 */
watch(PLUGIN_DIR, { recursive: true }, async (event, filename) => {
    if (filename?.endsWith(".js")) {
        const fullPath = path.join(PLUGIN_DIR, filename);
        if (await fs.stat(fullPath).catch(() => null)) await loadPlugin(fullPath);
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const getTime = () => new Date().toTimeString().split(" ")[0];

/**
 * Main Logic
 */
const LIORA = async () => {
    if (!global.db.data.user) global.db.data.user = {};

    // Registration for first-time use
    if (!global.db.data.owner) {
        const input = await new Promise((res) => rl.question("Registration - Enter Name: ", res));
        const username = input.trim() || "Admin";
        global.db.data.owner = username;

        // RPG Database Initialization
        if (!global.db.data.user[username]) {
            global.db.data.user[username] = {
                name: username,
                level: 1,
                exp: 0,
                rank: "Bronze",
                title: "Newbie",
                money: 1000,
                bank: 0,
                premium: false,
                hp: 100,
                max_hp: 100,
                stamina: 100,
                max_stamina: 100,
                energy: 100,
                max_energy: 100,
                strength: 1,
                agility: 1,
                intelligence: 1,
                luck: 1,
                defense: 1,
                kucing: 0,
                ayam: 0,
                sapi: 0,
                kambing: 0,
                anjing: 0,
                kelinci: 0,
                burung: 0,
                ikan_hias: 0,
                pickaxe: 0,
                kapak: 0,
                cangkul: 0,
                pancing: 0,
                pedang: 0,
                panah: 0,
                armor: 0,
                helm: 0,
                sepatu: 0,
                batu: 0,
                kayu: 0,
                besi: 0,
                emas: 0,
                diamond: 0,
                coal: 0,
                air: 0,
                susu: 0,
                kopi: 0,
                teh: 0,
                jus: 0,
                medkit: 0,
                bandage: 0,
                vitamin: 0,
                obat: 0,
                nasi: 0,
                roti: 0,
                daging: 0,
                ikan: 0,
                apel: 0,
                pisang: 0,
                sayur: 0,
                ikan_lele: 0,
                ikan_nila: 0,
                ikan_mas: 0,
                ikan_tuna: 0,
                ikan_salmon: 0,
                ikan_hiu: 0,
                bibit_padi: 0,
                bibit_jagung: 0,
                bibit_kentang: 0,
                hasil_panen: 0,
                hasil_mancing: 0,
                hasil_nambang: 0,
                quest_active: null,
                quest_done: [],
                quest_failed: 0,
                last_claim: 0,
                last_daily: 0,
                last_weekly: 0,
                last_monthly: 0,
                last_nebang: 0,
                last_mancing: 0,
                last_nambang: 0,
                last_farming: 0,
                last_hunt: 0,
                last_duel: 0,
                cooldown_hunt: 0,
                cooldown_work: 0,
                cooldown_adventure: 0,
                pet_level: 1,
                pet_exp: 0,
                pet_name: "My Pet",
                skill_point: 0,
                skill_attack: 0,
                skill_defense: 0,
                skill_farming: 0,
                skill_fishing: 0,
                skill_mining: 0,
                achievement: [],
                badge: [],
                reputation: 0,
                win: 0,
                lose: 0,
                draw: 0,
            };
        }
        await global.db.write();
    }

    const sender = global.db.data.owner;
    await loadPlugins(PLUGIN_DIR);

    const updatePrompt = () => {
        rl.setPrompt(`[${getTime()}] ${sender}: `);
        rl.prompt();
    };

    console.log(`Liora CLI Started. Welcome ${sender}.`);
    updatePrompt();

    rl.on("line", async (line) => {
        const input = line.trim();
        if (!input) return updatePrompt();

        const args = input.split(/\s+/);
        const command = args.shift().toLowerCase();
        const text = args.join(" ");

        const m = {
            text: input,
            sender: sender,
            reply: (txt) => console.log(`[${getTime()}] liora: ${txt}`),
        };

        let matched = false;
        for (const name in global.plugins) {
            const plugin = global.plugins[name];
            if (typeof plugin !== "function") continue;

            // Command Matching
            const isMatch =
                plugin.command instanceof RegExp
                    ? plugin.command.test(command)
                    : Array.isArray(plugin.command)
                      ? plugin.command.includes(command)
                      : plugin.command === command;

            if (isMatch) {
                matched = true;
                try {
                    await plugin.call(null, m, { args, text, command });
                } catch (e) {
                    console.error(`[${getTime()}] liora: Error - ${e.message}`);
                }
                break;
            }
        }

        if (!matched) console.log(`[${getTime()}] liora: Command "${command}" not found.`);
        updatePrompt();
    });
};

LIORA().catch(console.error);
