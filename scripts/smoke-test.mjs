import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
for (const name of ['generic-after.docx','generic-before.docx','kcl-after.docx','kcl-before.docx']) {
  const bytes = await readFile(path.join(root,'artifacts','validation-docx',name));
  if (bytes.length < 5000 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw new Error(`${name} is not a valid DOCX archive.`);
  console.log(`verified ${name} (${bytes.length} bytes)`);
}
