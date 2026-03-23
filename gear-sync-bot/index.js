const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// --------------------------------
// 1. DEFINE SLASH COMMANDS
// --------------------------------
const commands = [
  new SlashCommandBuilder()
    .setName('whichmouse')
    .setDescription('Check what mouse someone is maining')
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),

  new SlashCommandBuilder()
    .setName('whichkeyboard')
    .setDescription('Check what keyboard someone is maining')
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),

  new SlashCommandBuilder()
    .setName('whichheadset')
    .setDescription('Check what headset someone is maining')
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),

  new SlashCommandBuilder()
    .setName('whichmousepad')
    .setDescription('Check what mousepad someone is maining')
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),

  new SlashCommandBuilder()
    .setName('whichmonitor')
    .setDescription('Check what monitor someone is maining')
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),

  new SlashCommandBuilder()
    .setName('whichaudio')
    .setDescription('Check what audio gear someone is maining')
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),

  new SlashCommandBuilder()
    .setName('whichcontroller')
    .setDescription('Check what controller someone is maining')
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),

  new SlashCommandBuilder()
    .setName('setup')
    .setDescription("Check someone's full gear setup")
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),
];

// --------------------------------
// 2. REGISTER COMMANDS WITH DISCORD
// --------------------------------
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

async function registerCommands(clientId) {
  try {
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationCommands(clientId), { body: commands.map(c => c.toJSON()) });
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
}

// --------------------------------
// 3. HELPER: FETCH GEAR FROM YOUR API
// --------------------------------
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

// --------------------------------
// 4. HELPER: BUILD GEAR EMBED
// --------------------------------
function buildGearEmbed(username, avatarUrl, gearItem, category) {
  const categoryEmojis = {
    Mouse: '🖱️',
    Keyboard: '⌨️',
    Headset: '🎧',
    Mousepad: '🟫',
    Monitor: '🖥️',
    Audio: '🔊',
    Controller: '🎮',
  };

  const emoji = categoryEmojis[category] || '🎮';

  return {
    embeds: [{
      color: 0x22c55e,
      author: {
        name: username,
        icon_url: avatarUrl,
      },
      title: `${emoji} ${category}`,
      description: `**${gearItem.name}**`,
      footer: {
        text: gearItem.isMain ? '★ Currently Maining' : 'Backup',
      },
      timestamp: new Date().toISOString(),
    }]
  };
}

function buildFullSetupEmbed(username, avatarUrl, allGear) {
  const categoryEmojis = {
    Mouse: '🖱️',
    Keyboard: '⌨️',
    Headset: '🎧',
    Mousepad: '🟫',
    Monitor: '🖥️',
    Audio: '🔊',
    Controller: '🎮',
  };

  const grouped = {};
  allGear.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = item;
    if (item.isMain) grouped[item.category] = item;
  });

  const fields = Object.entries(grouped).map(([category, item]) => ({
    name: `${categoryEmojis[category] || '🎮'} ${category}`,
    value: `${item.name}${item.isMain ? ' ★' : ''}`,
    inline: true,
  }));

  if (fields.length === 0) {
    return {
      embeds: [{
        color: 0xff4444,
        description: `${username} hasn't set up their gear on GearSync yet!\nTell them to visit **gearsync.gg** to set it up.`,
      }]
    };
  }

  return {
    embeds: [{
      color: 0x22c55e,
      author: {
        name: `${username}'s Setup`,
        icon_url: avatarUrl,
      },
      fields,
      footer: { text: 'GearSync • gearsync.gg' },
      timestamp: new Date().toISOString(),
    }]
  };
}

// --------------------------------
// 5. BOT CLIENT
// --------------------------------
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  await registerCommands(client.user.id);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const targetUser = interaction.options.getUser('user');
  const discordId = targetUser.id;
  const username = targetUser.username;
  const avatarUrl = targetUser.displayAvatarURL();

  const commandCategoryMap = {
    whichmouse: 'Mouse',
    whichkeyboard: 'Keyboard',
    whichheadset: 'Headset',
    whichmousepad: 'Mousepad',
    whichmonitor: 'Monitor',
    whichaudio: 'Audio',
    whichcontroller: 'Controller',
  };

  await interaction.deferReply();

  if (commandName === 'setup') {
    const allGear = await fetchGear(discordId);

    if (!allGear || allGear.length === 0) {
      return interaction.editReply({
        embeds: [{
          color: 0xff4444,
          description: `**${username}** hasn't linked their gear on GearSync yet!\nTell them to visit the website and connect their Discord.`,
        }]
      });
    }

    return interaction.editReply(buildFullSetupEmbed(username, avatarUrl, allGear));
  }

  const category = commandCategoryMap[commandName];
  if (!category) return;

  const gear = await fetchGear(discordId, category);

  if (!gear || gear.length === 0) {
    return interaction.editReply({
      embeds: [{
        color: 0xff4444,
        description: `**${username}** hasn't added any ${category} to GearSync yet!`,
        footer: { text: 'GearSync • gearsync.gg' }
      }]
    });
  }

  const mainGear = gear.find(g => g.isMain) || gear[0];
  return interaction.editReply(buildGearEmbed(username, avatarUrl, mainGear, category));
});

// --------------------------------
// 6. LOGIN
// --------------------------------
client.login(process.env.DISCORD_BOT_TOKEN);