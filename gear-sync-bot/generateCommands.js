const fs = require("fs");
const path = require("path");

const categories = [
  { cmd: "whichmouse", cat: "Mouse" },
  { cmd: "whichkeyboard", cat: "Keyboard" },
  { cmd: "whichheadset", cat: "Headset" },
  { cmd: "whichmousepad", cat: "Mousepad" },
  { cmd: "whichmonitor", cat: "Monitor" },
  { cmd: "whichaudio", cat: "Audio" },
  { cmd: "whichcontroller", cat: "Controller" },
];

const template = (cmdName, categoryName) => `const { SlashCommandBuilder } = require('discord.js');
const { fetchGear } = require('../utils/api');
const { buildGearEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('${cmdName}')
    .setDescription('Check what ${categoryName.toLowerCase()} someone is maining')
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const discordId = targetUser.id;
    const username = targetUser.username;
    const avatarUrl = targetUser.displayAvatarURL();
    const category = '${categoryName}';

    await interaction.deferReply();

    const gear = await fetchGear(discordId, category);

    if (!gear || gear.length === 0) {
      return interaction.editReply({
        embeds: [{
          color: 0xff4444,
          description: \`**\${username}** hasn't added any \${category} to GearSync yet!\`,
          footer: { text: 'GearSync • gearsync.gg' }
        }]
      });
    }

    const mainGear = gear.find(g => g.isMain) || gear[0];
    return interaction.editReply(buildGearEmbed(username, avatarUrl, mainGear, category));
  },
};
`;

for (const { cmd, cat } of categories) {
  const filePath = path.join("gear-sync-bot/commands", `${cmd}.js`);
  fs.writeFileSync(filePath, template(cmd, cat));
  console.log("Created", filePath);
}
