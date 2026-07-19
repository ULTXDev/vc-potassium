const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

const TOKENS = [
  process.env.TOKEN_1, process.env.TOKEN_2, process.env.TOKEN_3,
  process.env.TOKEN_4, process.env.TOKEN_5, process.env.TOKEN_6,
  process.env.TOKEN_7
].filter(t => t && t.trim() !== ''); // Filter out empty tokens

const GUILD_ID = "1289988589052104846";
const CHANNEL_ID = "1343599197856727061";

const connections = new Map();

async function startAccount(token, index) {
  const client = new Client({ checkUpdate: false });

  client.on('ready', async () => {
    console.log(`[${index + 1}/7] ${client.user.tag} is online!`);
    
    // Wait between joins to avoid rate limits (3-5 seconds between each)
    await new Promise(r => setTimeout(r, index * 4000));
    await joinVC(client, index);
  });

  client.on('error', (err) => {
    console.error(`[${index + 1}] Client error:`, err.message);
  });

  try {
    await client.login(token);
  } catch (err) {
    console.error(`[${index + 1}] Login failed:`, err.message);
  }
}

async function joinVC(client, index) {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error(`[${index + 1}] Guild not found - is the account in the server?`);
      return;
    }

    const channel = guild.channels.cache.get(CHANNEL_ID);
    if (!channel) {
      console.error(`[${index + 1}] Voice channel not found`);
      return;
    }

    console.log(`[${index + 1}] Joining voice channel...`);

    const connection = joinVoiceChannel({
      channelId: CHANNEL_ID,
      guildId: GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: true,
      selfDeaf: true
    });

    // Wait for connection to be ready
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      console.log(`[${index + 1}] Successfully joined voice channel!`);
    } catch (err) {
      console.error(`[${index + 1}] Failed to connect:`, err.message);
      connection.destroy();
      return;
    }

    // Keep connection alive
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.log(`[${index + 1}] Disconnected, attempting reconnect...`);
      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      } catch {
        connection.destroy();
        // Rejoin after 5 seconds
        setTimeout(() => joinVC(client, index), 5000);
      }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.log(`[${index + 1}] Connection destroyed, will rejoin...`);
      setTimeout(() => joinVC(client, index), 5000);
    });

    connections.set(index, connection);

  } catch (error) {
    console.error(`[${index + 1}] Error joining voice:`, error.message);
    // Retry after 10 seconds
    setTimeout(() => joinVC(client, index), 10000);
  }
}

// Start all accounts with staggered delays
console.log(`Starting ${TOKENS.length} accounts...`);
TOKENS.forEach((token, index) => {
  // Stagger initial logins too
  setTimeout(() => startAccount(token, index), index * 2000);
});

// Keep script alive
setInterval(() => {}, 1000);
