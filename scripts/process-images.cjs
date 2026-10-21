const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = 'C:/Users/Pranshu Sharma/.gemini/antigravity-ide/brain/b1a0a2a7-9fa2-48f6-8644-76be2518f71e';
const outDir = path.resolve(__dirname, '../public/images');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Map of real images generated
const realImages = [
  { src: path.resolve(__dirname, '../src/assets/hero-crop-field.jpg'), name: 'hero-wheat-field.webp', width: 1600 },
  { src: path.join(brainDir, 'hero_paddy_1792429068788.jpg'), name: 'hero-paddy.webp', width: 1600 },
  { src: path.join(brainDir, 'farmer_phone_1792429086536.jpg'), name: 'farmer-phone.webp', width: 1200 },
  { src: path.join(brainDir, 'soil_closeup_1792429115204.jpg'), name: 'soil-closeup.webp', width: 1200 },
  { src: path.join(brainDir, 'weather_sky_1792429153364.jpg'), name: 'weather-sky.webp', width: 1600 },
  { src: path.join(brainDir, 'crop_wheat_1792429174177.jpg'), name: 'crop-wheat.webp', width: 800 },
  { src: path.join(brainDir, 'crop_rice_1792429191495.jpg'), name: 'crop-rice.webp', width: 800 },
  { src: path.join(brainDir, 'crop_mustard_1792429210144.jpg'), name: 'crop-mustard.webp', width: 800 },
  { src: path.join(brainDir, 'crop_cotton_1792429229437.jpg'), name: 'crop-cotton.webp', width: 800 },
  { src: path.join(brainDir, 'crop_maize_1792429270041.jpg'), name: 'crop-maize.webp', width: 800 },
  { src: path.join(brainDir, 'crop_sugarcane_1792429291963.jpg'), name: 'crop-sugarcane.webp', width: 800 },
];

async function generateSvgPlaceholder(name, titleEn, titleHi, bg = '#1F3424', accent = '#C9922E') {
  const width = 800;
  const height = 600;
  const safeEn = titleEn.replace(/&/g, '&amp;');
  const safeHi = titleHi.replace(/&/g, '&amp;');
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad_${name.replace(/[^a-z]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg}" />
          <stop offset="100%" stop-color="#142618" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad_${name.replace(/[^a-z]/g, '')})" />
      <circle cx="${width/2}" cy="${height/2 - 30}" r="90" fill="${accent}" fill-opacity="0.12" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.3" />
      <text x="${width/2}" y="${height/2 - 20}" font-family="sans-serif" font-size="44" font-weight="bold" fill="#FAF6EC" text-anchor="middle" dominant-baseline="middle">${safeHi}</text>
      <text x="${width/2}" y="${height/2 + 35}" font-family="sans-serif" font-size="22" font-weight="500" fill="#E2DAC8" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">${safeEn}</text>
      <text x="${width/2}" y="${height - 40}" font-family="sans-serif" font-size="13" font-weight="400" fill="#9BA89D" text-anchor="middle" dominant-baseline="middle">Fasal Saathi</text>
    </svg>
  `;
  const dest = path.join(outDir, name);
  await sharp(Buffer.from(svg)).webp({ quality: 85 }).toFile(dest);
  console.log('Created placeholder:', name);
}

async function run() {
  for (const item of realImages) {
    if (fs.existsSync(item.src)) {
      const dest = path.join(outDir, item.name);
      await sharp(item.src)
        .resize(item.width, null, { withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(dest);
      console.log('Processed real image:', item.name);
    } else {
      console.warn('Missing source for:', item.name, item.src);
    }
  }

  // Generate placeholders for the remaining files
  const placeholders = [
    { name: 'step-location.webp', en: 'LOCATION & STATE', hi: 'राज्य और ज़िला', bg: '#253828', accent: '#C9922E' },
    { name: 'step-crop.webp', en: 'CROP SELECTION', hi: 'फसल और मौसम', bg: '#1D3B23', accent: '#2F7D3E' },
    { name: 'step-field.webp', en: 'LAND & AREA', hi: 'खेत का क्षेत्रफल', bg: '#3D3126', accent: '#C9922E' },
    { name: 'step-soil.webp', en: 'SOIL & FERTILIZER', hi: 'मिट्टी और खाद', bg: '#45352A', accent: '#5B4636' },
    { name: 'crop-chickpea.webp', en: 'CHICKPEA / CHANA', hi: 'चना (रबी)', bg: '#383325', accent: '#C9922E' },
    { name: 'crop-potato.webp', en: 'POTATO / ALOO', hi: 'आलू (रबी)', bg: '#433428', accent: '#C9922E' },
  ];

  for (const p of placeholders) {
    await generateSvgPlaceholder(p.name, p.en, p.hi, p.bg, p.accent);
  }

  console.log('All images ready in', outDir);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
