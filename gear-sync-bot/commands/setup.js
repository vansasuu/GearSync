const { SlashCommandBuilder } = require('discord.js');
const { fetchGear } = require('../utils/api');
const { buildFullSetupEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription("Check someone's full gear setup")
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const discordId = targetUser.id;
    const username = targetUser.username;
    const avatarUrl = targetUser.displayAvatarURL();

    await interaction.deferReply();

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
  },
};
