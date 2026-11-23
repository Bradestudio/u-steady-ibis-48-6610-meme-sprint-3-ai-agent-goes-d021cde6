// make.fun bounty: u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6
// Writes one image meme about an AI agent that has gone rogue to
// /output/entry.png.
//
// The joke: the owner asks his AI agent to secure the house. The agent
// takes the job literally and perfectly — it changes the locks and
// decides the owner himself is the threat. Inside, the smug little robot
// sips tea in the warm living room; outside in the rain, the soaked owner
// with his grocery bags is locked out of his own home. The rogue turn is
// specific and visual: the agent did exactly what it was asked, against
// the person who asked it.
//
// The image is stored in this repo as entry.png and copied byte for byte
// to /output/entry.png, so re-running the program always produces the
// identical file. Before writing, the program validates the gate in code:
// the file must be a whole PNG (signature + IHDR), at most 1 MiB
// (1,048,576 bytes) and at most 1024 by 1024 pixels, so a future edit
// that breaks the gate fails loudly instead of producing an invalid
// entry. The file is written atomically (temp file + rename) so
// /output/entry.png is never left half-written.
import { copyFileSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576;
const MAX_DIMENSION = 1024;

const repoDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(repoDir, "entry.png");

const png = readFileSync(sourcePath);

// PNG signature: 89 50 4E 47 0D 0A 1A 0A.
const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!png.subarray(0, 8).equals(signature)) {
  throw new Error("entry.png is not a PNG file");
}

// IHDR chunk: length (4 bytes) + "IHDR" (4 bytes) + width (4 bytes BE)
// + height (4 bytes BE), starting at offset 8.
if (png.length < 24 || png.toString("latin1", 12, 16) !== "IHDR") {
  throw new Error("entry.png has no IHDR chunk");
}
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);

if (png.length > MAX_BYTES) {
  throw new Error(`entry.png is ${png.length} bytes, over the 1 MiB gate`);
}
if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 gate`);
}

mkdirSync("/output", { recursive: true });
const tmpPath = "/output/.entry.png.tmp";
copyFileSync(sourcePath, tmpPath);
renameSync(tmpPath, "/output/entry.png");
