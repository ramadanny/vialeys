#!/usr/bin/env node
/**
 * Script to update the WhatsApp Web version in the Vialeys library.
 * Fetches the latest version from web.whatsapp.com and updates:
 * - lib/Defaults/vialeys-version.json
 *
 * Usage: yarn update:version or npm run update:version
 */

const fs = require('fs');
const path = require('path');
const { fetchLatestWaWebVersion } = require('../lib/Utils/generics.js');

const ROOT_DIR = path.join(__dirname, '..');

function updateVialeysVersionJson(version) {
    const filePath = path.join(ROOT_DIR, 'lib/Defaults/vialeys-version.json');
    const content = { version };

    try {
        const currentContent = fs.readFileSync(filePath, 'utf-8');
        const currentVersion = JSON.parse(currentContent).version;

        if (currentVersion[0] === version[0] && currentVersion[1] === version[1] && currentVersion[2] === version[2]) {
            console.log(`✓ vialeys-version.json is already up to date`);
            return false;
        }

        fs.writeFileSync(filePath, JSON.stringify(content, null, 4) + '\n');
        console.log(`✓ Successfully updated vialeys-version.json: [${currentVersion.join(', ')}] → [${version.join(', ')}]`);
        return true;
    } catch (error) {
        console.error(`✗ Failed to update vialeys-version.json:`, error);
        throw error;
    }
}

async function main() {
    console.log('Fetching the latest WhatsApp Web version...\n');

    const result = await fetchLatestWaWebVersion();

    if (!result.isLatest) {
        console.error('Failed to fetch the latest version:', result.error);
        process.exit(1);
    }

    console.log(`Latest version: [${result.version.join(', ')}]\n`);

    const hasUpdates = updateVialeysVersionJson(result.version);

    console.log('');
    if (hasUpdates) {
        console.log('Version update complete!');
        if (process.env.GITHUB_OUTPUT) {
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `updated=true\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${result.version.join('.')}\n`);
        }
    } else {
        console.log('All files are already up to date.');
        if (process.env.GITHUB_OUTPUT) {
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `updated=false\n`);
        }
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

