import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = process.argv[2];
const outDir = path.join(__dirname, "../public/brand");

if (!src) {
  console.error("Usage: node scripts/process-logo.mjs <input.jpg>");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

async function toTransparentPng(inputPath, outputPath, extra = {}) {
  const image = sharp(inputPath);
  const meta = await image.metadata();
  let pipeline = sharp(inputPath);
  if (extra.extract) pipeline = pipeline.extract(extra.extract);
  if (extra.resize) pipeline = pipeline.resize(extra.resize);

  const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const threshold = 242;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);

  console.log(`Wrote ${outputPath} (${info.width}x${info.height})`);
  return meta;
}

const fullPath = path.join(outDir, "wunmzy-brand-card.png");
const logoPath = path.join(outDir, "wunmzy-logo.png");
const markPath = path.join(outDir, "wunmzy-mark.png");

const meta = await sharp(src).metadata();
const w = meta.width ?? 824;
const h = meta.height ?? 1024;

// Full brand card (transparent)
await toTransparentPng(src, fullPath);

// Header logo: icon + full "Wunmzy Co" wordmark + category line
await toTransparentPng(src, logoPath, {
  extract: {
    left: Math.round(w * 0.05),
    top: Math.round(h * 0.01),
    width: Math.round(w * 0.9),
    height: Math.round(h * 0.48),
  },
  resize: { width: 720 },
});

// Compact mark: suit/gown icon only
await toTransparentPng(src, markPath, {
  extract: {
    left: Math.round(w * 0.22),
    top: Math.round(h * 0.03),
    width: Math.round(w * 0.56),
    height: Math.round(h * 0.2),
  },
  resize: { width: 256 },
});
