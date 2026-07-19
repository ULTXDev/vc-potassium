const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

const TOKENS = [
  process.env.TOKEN_1, process.env.TOKEN_2, process.env.TOKEN_3,
  process.env.TOKEN_4, process.env.TOKEN_5, process.env.TOKEN_6,
  process.env.TOKEN_7
].filter(t => t && t.trim() !== '');

const GUILD_ID = "1289988589052104846";
const CHANNEL_ID = "1343599197856727061";

async function startAccount(token, index) {
  const client = new Client({ 
    checkUpdate: false,
    // Add proxy support if you have one
    // httpProxy: process.env.PROXY 
  });

  client.on('ready', async () => {
    console.log(`[${index + 1}/7] ${client.user.tag} logged in`);
    
    // MUCH longer delay for cloud hosting (15-30 seconds between joins)
    const delay = (index * 25000) + (Math.random() * 10000);
    console.log(`[${index + 1}] Waiting ${Math.round(delay/1000)}s before joining VC...`);
    await new Promise(r => setTimeout(r, delay));
    
    await joinVC(client, index);
  });

  client.on('error', (err) => {
    console.error(`[${index + 1}] Error:`, err.message);
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
      console.error(`[${index + 1}] Not in guild`);
      return;
    }

    const connection = joinVoiceChannel({
      channelId: CHANNEL_ID,
      guildId: GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: true,
      selfDeaf: true
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    console.log(`[${index + 1}] JOINED VC ✓`);

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.log(`[${index + 1}] Disconnected, reconnecting...`);
      setTimeout(() => joinVC(client, index), 10000);
    });

  } catch (error) {
    console.error(`[${index + 1}] Failed to join:`, error.message);
    // Retry with backoff
    setTimeout(() => joinVC(client, index), 30000);
  }
}

// Start with longer staggered delays
TOKENS.forEach((token, index) => {
  setTimeout(() => startAccount(token, index), index * 5000);
});
