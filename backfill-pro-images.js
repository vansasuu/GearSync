// backfill-pro-images.js  (v2 — scrapes photos directly from prosettings.net)
// Run once: node backfill-pro-images.js
const mongoose = require('mongoose');
const axios = require('axios').default;
const cheerio = require('cheerio');
require('dotenv').config({ path: './.env.local' });

const ProSchema = new mongoose.Schema({
  name: String, team: String, game: String, imageUrl: String, profileUrl: String,
  gear: { mouse: String, keyboard: String, headset: String, mousepad: String, monitor: String },
  settings: { dpi: String, sensitivity: String, eDPI: String, resolution: String, aspect: String },
}, { timestamps: true });

const Pro = mongoose.models.Pro || mongoose.model('Pro', ProSchema);

async function scrapePlayerPhoto(profileUrl) {
  try {
    const { data } = await axios.get(profileUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
      timeout: 10000,
    });
    const $ = cheerio.load(data);

    // Try selectors in priority order
    const selectors = [
      'img.wp-post-image',
      'img.avatar',
      '.player-image img',
      '.post-thumbnail img',
      'article img[src*="uploads"]',
    ];

    for (const sel of selectors) {
      const el = $(sel).first();
      const src = el.attr('src') || el.attr('data-src');
      if (src && src.includes('uploads') && !src.includes('logo') && !src.includes('flag')) {
        return src;
      }
    }

    // Fallback: first uploads img that isn't a logo/flag/banner
    let found = null;
    $('img').each((i, el) => {
      if (found) return;
      const src = $(el).attr('src') || '';
      if (
        src.includes('uploads') &&
        !src.includes('logo') &&
        !src.includes('flag') &&
        !src.includes('banner') &&
        !src.includes('sponsor') &&
        !src.includes('cs2-icon')
      ) {
        found = src;
      }
    });
    return found;
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected!\n');

  // Reset all image URLs so we re-fetch everything with quality sources
  await Pro.updateMany({ game: 'CS2' }, { $unset: { imageUrl: '' } });
  const pros = await Pro.find({ game: 'CS2', profileUrl: { $exists: true, $ne: null } });
  console.log(`Re-fetching photos for ${pros.length} pros from prosettings.net\n`);

  let updated = 0;

  for (const pro of pros) {
    if (!pro.profileUrl) {
      console.log(`  ⏭  ${pro.name} — no profileUrl, skipping`);
      continue;
    }

    console.log(`Scraping ${pro.name} (${pro.profileUrl})...`);
    const imageUrl = await scrapePlayerPhoto(pro.profileUrl);

    if (imageUrl) {
      await Pro.findByIdAndUpdate(pro._id, { imageUrl });
      console.log(`  ✅ ${imageUrl.substring(0, 80)}`);
      updated++;
    } else {
      console.log(`  ⚠️  No photo found`);
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n✅ Done! Updated ${updated}/${pros.length} pros.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(console.error);
