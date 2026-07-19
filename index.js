const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

const TOKENS = [
  process.env.TOKEN_1, process.env.TOKEN_2, process.env.TOKEN_3,
  process.env.TOKEN_4, process.env.TOKEN_5, process.env.TOKEN_6,
  process.env.TOKEN_7
].filter(t => t && t.trim() !== '');

const GUILD_ID = "1289988589052104846";
const CHANNEL_ID = "1343599197856727061";

// Track active connections to avoid destroying already-destroyed ones
const activeConnections = new Map();

async function startAccount(token, index) {
  const client = new Client({ checkUpdate: false });

  client.on('ready', async () => {
    console.log(`[${index + 1}/7] ${client.user.tag} logged in`);
    
    // MUCH longer delay between joins (45 seconds apart)
    const delay = index * 45000;
    console.log(`[${index + 1}] Waiting ${delay/1000}s before joining VC...`);
    await new Promise(r => setTimeout(r, delay));
    
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

async function joinVC(client, index, attempt = 1) {
  const maxAttempts = 5;
  
  if (attempt > maxAttempts) {
    console.error(`[${index + 1}] Max retries reached, giving up`);
    return;
  }

  // Clean up any existing connection for this account
  if (activeConnections.has(index)) {
    const oldConn = activeConnections.get(index);
    try {
      if (oldConn.state !== VoiceConnectionStatus.Destroyed) {
        oldConn.destroy();
      }
    } catch (e) {}
    activeConnections.delete(index);
  }

  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error(`[${index + 1}] Not in guild`);
      return;
    }

    console.log(`[${index + 1}] Attempt ${attempt}: Joining voice channel...`);

    const connection = joinVoiceChannel({
      channelId: CHANNEL_ID,
      guildId: GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: true,
      selfDeaf: true
    });

    activeConnections.set(index, connection);

    // Wait longer for connection (90 seconds)
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 90000);
      console.log(`[${index + 1}] ✅ SUCCESSFULLY JOINED VC`);
    } catch (err) {
      console.error(`[${index + 1}] Connection timeout: ${err.message}`);
      
      // Only destroy if not already destroyed
      if (connection.state !== VoiceConnectionStatus.Destroyed) {
        connection.destroy();
      }
      activeConnections.delete(index);
      
      // Retry with exponential backoff
      const retryDelay = Math.min(30000 * attempt, 120000);
      console.log(`[${index + 1}] Retrying in ${retryDelay/1000}s...`);
      setTimeout(() => joinVC(client, index, attempt + 1), retryDelay);
      return;
    }

    // Handle disconnects
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.log(`[${index + 1}] Disconnected from VC`);
      
      try {
        // Try to reconnect gracefully
        await entersState(connection, VoiceConnectionStatus.Ready, 60000);
        console.log(`[${index + 1}] Reconnected`);
      } catch {
        console.log(`[${index + 1}] Reconnect failed, rejoining...`);
        if (connection.state !== VoiceConnectionStatus.Destroyed) {
          connection.destroy();
        }
        activeConnections.delete(index);
        setTimeout(() => joinVC(client, index), 30000);
      }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.log(`[${index + 1}] Connection destroyed, will rejoin...`);
      activeConnections.delete(index);
      setTimeout(() => joinVC(client, index), 30000);
    });

  } catch (error) {
    console.error(`[${index + 1}] Error: ${error.message}`);
    activeConnections.delete(index);
    setTimeout(() => joinVC(client, index, attempt + 1), 30000);
  }
}

// Start all accounts
console.log(`Starting ${TOKENS.length} accounts...`);
TOKENS.forEach((token, index) => {
  setTimeout(() => startAccount(token, index), index * 3000);
});

// Keep alive
setInterval(() => {}, 1000);
