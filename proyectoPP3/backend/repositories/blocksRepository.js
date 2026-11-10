import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = resolve(__dirname, '../data');

if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
}

export function readBlocks(resourceId) {
    const path = resolve(DATA_DIR, resourceId + '.json');
    if (!existsSync(path)) return [];

    try {
        const data = readFileSync(path, 'utf-8').trim();
        if (data === '') return [];
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Corrupted JSON in ' + resourceId + ': ' + error.message);
        return [];
    }
}

export function saveBlocks(resourceId, blocks) {
    const path = resolve(DATA_DIR, resourceId + '.json');
    writeFileSync(path, JSON.stringify(blocks, null, 4), 'utf-8');
    return blocks;
}

export function deleteBlocks(resourceId) {
    const path = resolve(DATA_DIR, resourceId + '.json');
    if (existsSync(path)) unlinkSync(path);
}
