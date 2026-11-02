/**
 * Automated Verification Script for Performance Optimizations
 * Checks:
 * 1. Font PumOutline elimination (file deleted, CSS rules removed, Watermark updated)
 * 2. WebP conversion & redundant JPEG removal (RIFF/WEBP magic bytes validation)
 * 3. HeroSection.astro LCP optimization (no animate-fade-in-scale, no delay-200, decoding="async")
 * 4. Asset size reduction measurement against baseline
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

const ROOT = process.cwd();

console.log("=== Running Optimization Verification Checks ===\n");

// ==========================================
// 1. Check PumOutline Font Elimination (R1)
// ==========================================
console.log("Checking R1: PumOutline Font Elimination...");

const fontFile = path.join(ROOT, "public/fonts/pum-outline.woff");
assert(!fs.existsSync(fontFile), `FAIL: ${fontFile} must not exist.`);
console.log("  ✔ public/fonts/pum-outline.woff does not exist");

const cssFile = path.join(ROOT, "src/styles/global.css");
const cssContent = fs.readFileSync(cssFile, "utf-8");
assert(!cssContent.includes("PumOutline"), "FAIL: global.css still mentions 'PumOutline'");
assert(!cssContent.includes("pum-outline.woff"), "FAIL: global.css still references 'pum-outline.woff'");
assert(!cssContent.includes("--font-outline"), "FAIL: global.css still defines '--font-outline'");
console.log("  ✔ src/styles/global.css has no PumOutline, pum-outline.woff, or --font-outline");

const watermarkFile = path.join(ROOT, "src/components/Watermark.astro");
const watermarkContent = fs.readFileSync(watermarkFile, "utf-8");
assert(!watermarkContent.includes("font-outline"), "FAIL: Watermark.astro still uses 'font-outline' class");
assert(
  watermarkContent.includes("-webkit-text-stroke") || watermarkContent.includes("text-stroke"),
  "FAIL: Watermark.astro does not use CSS text-stroke effect"
);
console.log("  ✔ src/components/Watermark.astro uses CSS text-stroke and not font-outline");

// ==========================================
// 2. Check WebP Conversion & Redundant JPEGs (R2)
// ==========================================
console.log("\nChecking R2: WebP Conversion & Redundant JPEG Removal...");

const convertedWebpFiles = [
  "public/images/banner-manos-a-la-obra.webp",
  "public/images/banner-mision-effeta.webp",
  "public/images/hero-collage.webp",
  "public/images/areas/banner-creativa.webp",
  "public/images/areas/banner-ingenio.webp",
  "public/images/areas/banner-jovenes-profesionales.webp",
  "public/images/areas/banner-psico-educacion.webp",
  "public/images/areas/banner-salud.webp",
  "public/images/areas/banner-sociales.webp",
];

const redundantJpegFiles = [
  "public/images/banner-manos-a-la-obra.jpeg",
  "public/images/banner-mision-effeta.jpeg",
  "public/images/areas/banner-creativa.jpeg",
  "public/images/areas/banner-ingenio.jpeg",
  "public/images/areas/banner-jovenes-profesionales.jpeg",
  "public/images/areas/banner-psico-educacion.jpeg",
  "public/images/areas/banner-salud.jpeg",
  "public/images/areas/banner-sociales.jpeg",
];

// Check all WebP files exist and have valid WebP magic bytes (RIFF .... WEBP)
for (const relPath of convertedWebpFiles) {
  const fullPath = path.join(ROOT, relPath);
  assert(fs.existsSync(fullPath), `FAIL: WebP file missing: ${relPath}`);
  const buf = fs.readFileSync(fullPath);
  assert(buf.length >= 12, `FAIL: WebP file too small: ${relPath}`);
  const riff = buf.subarray(0, 4).toString("ascii");
  const webp = buf.subarray(8, 12).toString("ascii");
  assert(riff === "RIFF" && webp === "WEBP", `FAIL: ${relPath} is not a valid WebP container (RIFF/WEBP signature missing)`);
  console.log(`  ✔ Valid WebP: ${relPath} (${(buf.length / 1024).toFixed(1)} KB)`);
}

// Check redundant JPEGs have been deleted
for (const relPath of redundantJpegFiles) {
  const fullPath = path.join(ROOT, relPath);
  assert(!fs.existsSync(fullPath), `FAIL: Redundant JPEG still exists: ${relPath}`);
}
console.log("  ✔ All redundant JPEGs have been deleted");

// Check code references to JPEGs were removed
const codeFilesToCheck = [
  "src/data/areas.ts",
  "src/pages/manos-a-la-obra.astro",
  "src/pages/mision-effeta.astro",
];
for (const relPath of codeFilesToCheck) {
  const fullPath = path.join(ROOT, relPath);
  const content = fs.readFileSync(fullPath, "utf-8");
  assert(!content.includes(".jpeg"), `FAIL: ${relPath} still contains references to .jpeg`);
  console.log(`  ✔ ${relPath} has no .jpeg references`);
}

// ==========================================
// 3. Check HeroSection.astro LCP (R3)
// ==========================================
console.log("\nChecking R3: HeroSection LCP Optimization...");

const heroFile = path.join(ROOT, "src/components/home/HeroSection.astro");
const heroContent = fs.readFileSync(heroFile, "utf-8");

// Locate the collage img element
const collageImgMatch = heroContent.match(/<img[^>]*hero-collage\.webp[^>]*>/s);
assert(collageImgMatch, "FAIL: Could not find hero-collage.webp <img> tag in HeroSection.astro");
const collageTag = collageImgMatch[0];

assert(!collageTag.includes("animate-fade-in-scale"), "FAIL: hero-collage.webp <img> still has 'animate-fade-in-scale'");
assert(!collageTag.includes("delay-200"), "FAIL: hero-collage.webp <img> still has 'delay-200'");
assert(collageTag.includes('decoding="async"'), "FAIL: hero-collage.webp <img> is missing decoding=\"async\"");
assert(collageTag.includes('fetchpriority="high"'), "FAIL: hero-collage.webp <img> is missing fetchpriority=\"high\"");

console.log("  ✔ Hero collage <img> does not contain animate-fade-in-scale");
console.log("  ✔ Hero collage <img> does not contain delay-200");
console.log("  ✔ Hero collage <img> has decoding=\"async\"");
console.log("  ✔ Hero collage <img> has fetchpriority=\"high\"");

// Check built dist/index.html if dist exists
const distIndex = path.join(ROOT, "dist/index.html");
if (fs.existsSync(distIndex)) {
  const distContent = fs.readFileSync(distIndex, "utf-8");
  const distCollageMatch = distContent.match(/<img[^>]*hero-collage\.webp[^>]*>/s);
  if (distCollageMatch) {
    const distTag = distCollageMatch[0];
    assert(!distTag.includes("animate-fade-in-scale"), "FAIL: dist/index.html collage img still has animate-fade-in-scale");
    assert(!distTag.includes("delay-200"), "FAIL: dist/index.html collage img still has delay-200");
    assert(distTag.includes('decoding="async"'), "FAIL: dist/index.html collage img missing decoding=\"async\"");
    console.log("  ✔ dist/index.html confirms LCP optimizations are rendered in built output");
  }
}

// ==========================================
// 4. Asset Size Reduction Measurement
// ==========================================
console.log("\nMeasuring Asset Size Reduction...");

// Baseline asset sizes recorded before optimization (bytes)
const BASELINE_SIZES = {
  "public/fonts/pum-outline.woff": 148480,
  "public/images/banner-manos-a-la-obra.jpeg": 420535,
  "public/images/banner-mision-effeta.jpeg": 206750,
  "public/images/hero-collage.webp": 304128,
  "public/images/areas/banner-creativa.jpeg": 227909,
  "public/images/areas/banner-ingenio.jpeg": 243365,
  "public/images/areas/banner-jovenes-profesionales.jpeg": 226304,
  "public/images/areas/banner-psico-educacion.jpeg": 264192,
  "public/images/areas/banner-salud.jpeg": 176128,
  "public/images/areas/banner-sociales.jpeg": 431104,
};

const baselineTotalBytes = Object.values(BASELINE_SIZES).reduce((a, b) => a + b, 0);

let currentTotalBytes = 0;
// Note: pum-outline.woff and JPEGs are 0 bytes (deleted). Only current WebPs count.
for (const relPath of convertedWebpFiles) {
  const fullPath = path.join(ROOT, relPath);
  if (fs.existsSync(fullPath)) {
    currentTotalBytes += fs.statSync(fullPath).size;
  }
}

const savedBytes = baselineTotalBytes - currentTotalBytes;
const savedPercent = ((savedBytes / baselineTotalBytes) * 100).toFixed(1);

console.log(`  Baseline affected assets total: ${(baselineTotalBytes / 1024).toFixed(1)} KB (${(baselineTotalBytes / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`  Current affected assets total:  ${(currentTotalBytes / 1024).toFixed(1)} KB (${(currentTotalBytes / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`  Total savings:                 ${(savedBytes / 1024).toFixed(1)} KB (${(savedBytes / (1024 * 1024)).toFixed(2)} MB, -${savedPercent}%)`);

assert(savedBytes > 0, "FAIL: No asset reduction achieved");
console.log("\n🎉 ALL OPTIMIZATION VERIFICATIONS PASSED!");
