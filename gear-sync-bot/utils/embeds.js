const buildGearEmbed = (username, avatarUrl, gearItem, category) => {
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
};

const buildFullSetupEmbed = (username, avatarUrl, allGear) => {
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
};

module.exports = { buildGearEmbed, buildFullSetupEmbed };
