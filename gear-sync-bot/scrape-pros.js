const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env.local' });

const ProSchema = new mongoose.Schema({
  name: String,
  team: String,
  game: { type: String, default: 'CS2' },
  country: String,
  imageUrl: String,
  profileUrl: String,
  gear: {
    mouse: String,
    keyboard: String,
    headset: String,
    mousepad: String,
    monitor: String,
  },
  settings: {
    dpi: String,
    sensitivity: String,
    eDPI: String,
    resolution: String,
    aspect: String,
  },
}, { timestamps: true });

const Pro = mongoose.models.Pro || mongoose.model('Pro', ProSchema);

async function scrapeProPage(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const gear = {};
    const settings = {};

    $('.cta-box').each((i, box) => {
      const tag = $(box).find('.cta-box__tag').text().trim();
      const name = $(box).find('h4 a').first().text().trim();
      if (!tag || !name) return;

      const tagLower = tag.toLowerCase();
      if (tagLower === 'mouse') gear.mouse = name;
      else if (tagLower === 'keyboard') gear.keyboard = name;
      else if (tagLower === 'headset') gear.headset = name;
      else if (tagLower === 'mousepad') gear.mousepad = name;
      else if (tagLower === 'monitor') gear.monitor = name;
    });

    $('tr[data-field]').each((i, row) => {
      const field = $(row).attr('data-field');
      const value = $(row).find('td').text().trim();
      if (!field || !value) return;

      if (field === 'dpi') settings.dpi = value;
      else if (field === 'sensitivity') settings.sensitivity = value;
      else if (field === 'edpi') settings.eDPI = value;
      else if (field === 'resolution') settings.resolution = value;
      else if (field === 'aspect_ratio') settings.aspect = value;
    });

    console.log('  Mouse:', gear.mouse || '—');
    console.log('  DPI:', settings.dpi || '—');
    console.log('  Sensitivity:', settings.sensitivity || '—');

    return { gear, settings };
  } catch (error) {
    console.error(`  Failed: ${error.message}`);
    return { gear: {}, settings: {} };
  }
}

async function scrapeProsListing() {
  try {
    const { data } = await axios.get('https://prosettings.net/lists/cs2/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const pros = [];

    $('a[href*="/players/"]').each((i, el) => {
      const href = $(el).attr('href');
      const name = $(el).text().trim();

      if (
        !name ||
        !href ||
        name === 'Players' ||
        name.length <= 1 ||
        href === 'https://prosettings.net/players/' ||
        href === '/players/'
      ) return;

      if (!pros.find(p => p.url === href)) {
        pros.push({
          name,
          url: href.startsWith('http') ? href : `https://prosettings.net${href}`,
        });
      }
    });

    return pros;
  } catch (error) {
    console.error('Failed to scrape listing:', error.message);
    return [];
  }
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected!');

  console.log('Scraping CS2 pros list...');
  const prosList = await scrapeProsListing();
  console.log(`Found ${prosList.length} pros`);

  await Pro.deleteMany({ game: 'CS2' });
  console.log('Cleared old data');

  let saved = 0;

  for (const pro of prosList.slice(0, 30)) {
    console.log(`Scraping ${pro.name}...`);
    const { gear, settings } = await scrapeProPage(pro.url);

    await Pro.create({
      name: pro.name,
      game: 'CS2',
      profileUrl: pro.url,
      gear,
      settings,
    });

    saved++;
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`✅ Done! Saved ${saved} pros.`);
  await mongoose.disconnect();
  process.exit(0);
}

main();