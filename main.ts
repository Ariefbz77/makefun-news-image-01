// make.fun news-image-01 entry (Node 22, standard library only).
//
// The entry image sits beside this file as entry.png. The program copies it
// to /output/entry.png, where the grader reads it and the judge sees it,
// then verifies the copy is a whole, valid image before it exits.
//
// The image is a newspaper front page for Friday 13 November 2026, summing
// up that day's world news in four stories reported that day: the NVIDIA
// CEO resignation, the worldwide Microsoft 365 outage, Europe joining the
// Ukraine talks, and a tanker attacked in the Strait of Hormuz. The text
// was drawn with real fonts so it stays legible.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The copy is byte-for-byte deterministic, so both grader runs write the
// same bytes. A JPEG or a PNG is accepted (told apart by its first bytes);
// the name stays entry.png either way.

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const MAX_BYTES = 1048576; // 1 MiB, the competition's size cap

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const src = new URL('./entry.png', import.meta.url);
const dest = join(outDir, 'entry.png');

mkdirSync(outDir, { recursive: true });
copyFileSync(src, dest);

// Verify the copy: a whole image within the size cap, PNG or JPEG by magic.
const bytes = readFileSync(dest);
const size = statSync(dest).size;
if (size > MAX_BYTES) {
  throw new Error(`entry.png is ${size} bytes, over the ${MAX_BYTES} byte cap`);
}
const isPng = bytes.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC);
const isJpeg = bytes.subarray(0, JPEG_MAGIC.length).equals(JPEG_MAGIC);
if (!isPng && !isJpeg) {
  throw new Error('entry.png is neither a PNG nor a JPEG by its first bytes');
}
// Whole image, not a truncated one: a PNG must end with its IEND chunk,
// a JPEG with its end marker (FF D9), per the competition's gate rules.
if (isPng && !bytes.subarray(bytes.length - 12).includes(Buffer.from('IEND'))) {
  throw new Error('entry.png is a truncated PNG: no IEND chunk at the end');
}
if (isJpeg && !(bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9)) {
  throw new Error('entry.png is a truncated JPEG: no end marker (FF D9)');
}
