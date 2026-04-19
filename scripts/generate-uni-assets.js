const https = require("https");
const http  = require("http");
const fs    = require("fs");
const path  = require("path");

const OUTPUT_DIR = path.join(__dirname, "../public/uni");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const BASE =
  "cute chibi cartoon owl, teal blue-green feathers, large warm amber eyes, " +
  "soft white cream belly, cozy white knitted scarf, 3D Pixar-style render, " +
  "clean white background, centered, no text, single character";

const POSES = {
  core:       `${BASE}, standing upright confidently, holding glowing holographic heart-shaped shield with purple glow, gentle proud smile, wings slightly open`,
  focused:    `${BASE}, sitting, holding a glowing blue tablet/laptop showing charts, wearing small round glasses, leaning forward intently, focused serious expression`,
  calm:       `${BASE}, sitting in lotus meditation pose, eyes gently closed, soft blue glowing energy particles floating around, peaceful serene expression, slight smile`,
  joyful:     `${BASE}, jumping in the air with excitement, wings spread wide open, colorful confetti and golden stars surrounding, huge happy smile, eyes squinting with joy`,
  compassion: `${BASE}, standing gently, cradling a warm glowing golden heart in both wings, soft empathetic kind expression, warm amber glow around the heart`,
  sleeping:   `${BASE}, curled up into a small sleeping ball, wings tucked in, eyes closed peacefully, tiny white zzz letters floating above, very small and cute`,
};

const SEED = 42; // Fixed seed for character consistency

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file  = fs.createWriteStream(dest);

    proto.get(url, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function generate(pose, prompt) {
  const encoded = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&seed=${SEED}&model=flux`;
  const dest = path.join(OUTPUT_DIR, `${pose}.png`);

  process.stdout.write(`  ⏳ ${pose.padEnd(12)} ...`);
  try {
    await download(url, dest);
    const kb = Math.round(fs.statSync(dest).size / 1024);
    console.log(` ✅  saved (${kb} KB)`);
  } catch (err) {
    console.log(` ❌  failed: ${err.message}`);
  }
}

async function main() {
  console.log("\n🦉  Uni Asset Generator — Pollinations.ai\n");
  for (const [pose, prompt] of Object.entries(POSES)) {
    await generate(pose, prompt);
    await new Promise((r) => setTimeout(r, 1200)); // polite delay
  }
  console.log("\n✨  Done! Images saved to public/uni/\n");
  console.log("   Restart the dev server to see the new characters.\n");
}

main().catch(console.error);
