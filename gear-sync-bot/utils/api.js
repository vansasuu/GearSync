const axios = require('axios');
require('dotenv').config();

async function fetchGear(discordId, category = null) {
  try {
    let url = `${process.env.GEARSYNC_API_URL}/api/bot/gear?discordId=${discordId}`;
    if (category) url += `&category=${category}`;

    const response = await axios.get(url, {
      headers: { 'x-api-key': process.env.BOT_API_KEY }
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    return null;
  }
}

module.exports = { fetchGear };
