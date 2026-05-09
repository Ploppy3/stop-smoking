import sharp from "sharp";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(resolve(__dirname, "../public/icon.svg"));
const out = resolve(__dirname, "../public");

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable-512.png", size: 512, padding: true },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size, padding } of sizes) {
  let img = sharp(svg).resize(size, size);
  if (padding) {
    img = sharp({
      create: { width: size, height: size, channels: 4, background: "#FF9500" },
    }).composite([
      {
        input: await sharp(svg)
          .resize(Math.round(size * 0.7), Math.round(size * 0.7))
          .png()
          .toBuffer(),
        gravity: "center",
      },
    ]);
  }
  await img.png().toFile(resolve(out, name));
  console.log("wrote", name);
}
