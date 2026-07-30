/**
 * Copies the photography reference library into the web app's public folder.
 *
 * `docs/photo-references/` is the source of truth — it is the photographer's
 * brief (IMPLEMENTATION_PLAN.md §6). The copy under `apps/web/public/ref/` is
 * generated, gitignored, and exists only so the site can render placeholders
 * before the real shoot.
 *
 * When the real photography lands, both this script and the reference library
 * are deleted. Nothing here ships.
 */
import { cp, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'docs', 'photo-references');
const target = join(root, 'apps', 'web', 'public', 'ref');

await mkdir(target, { recursive: true });

const files = (await readdir(source)).filter((f) => f.endsWith('.jpg'));
for (const file of files) {
  await cp(join(source, file), join(target, file));
}

console.log(`[refs] synced ${files.length} reference images → apps/web/public/ref`);
