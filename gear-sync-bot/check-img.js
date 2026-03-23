const axios = require('axios');
const cheerio = require('cheerio');

async function main() {
  const { data } = await axios.get('https://prosettings.net/players/s1mple/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
  });
  const $ = cheerio.load(data);

  // Only show images with uploads in src
  $('img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const cls = $(el).attr('class') || '';
    if (src.includes('uploads') && !src.includes('logo') && !src.includes('banner') && !src.includes('sponsor')) {
      console.log(`CLASS: ${cls}`);
      console.log(`SRC:   ${src}`);
      console.log('---');
    }
  });
}

main().catch(console.error);
