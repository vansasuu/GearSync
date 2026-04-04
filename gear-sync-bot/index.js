const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsArray = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON());
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Register commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commandsArray.length} application (/) commands.`);

    // Wait for the client to be ready and get its ID or provide it via process.env.DISCORD_CLIENT_ID
    // To simplify since Discord doesn't give clientId locally implicitly without .env, we can use the env var
    // Assuming DISCORD_CLIENT_ID is in .env 
    if (process.env.DISCORD_CLIENT_ID) {
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        { body: commandsArray },
      );
      console.log('✅ Successfully reloaded application (/) commands.');
    } else {
      console.log('⚠️ DISCORD_CLIENT_ID not found in .env. Skipping command registration via script. Commands will be registered on ready event if implemented or manually.');
    }

  } catch (error) {
    console.error(error);
  }
})();

client.login(process.env.DISCORD_BOT_TOKEN);