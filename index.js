const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

const TOKENS = [
  process.env.TOKEN_1, process.env.TOKEN_2, process.env.TOKEN_3,
  process.env.TOKEN_4, process.env.TOKEN_5, process.env.TOKEN_6,
  process.env.TOKEN_7
].filter(Boolean); // Filter out undefined tokens

const GUILD_ID = "1289988589052104846";
const CHANNEL_ID = "1343599197856727061";

TOKENS.forEach((token, index) => {
  const client = new Client({ checkUpdate: false });

  client.on('ready', async () => {
    console.log(`Account ${index + 1} (${client.user.tag}) is online!`);
    joinVC(client, index);
  });

  client.on('disconnect', () => {
    console.log(`Account ${index + 1} disconnected, will reconnect...`);
  });

  client.login(token).catch(err => {
    console.error(`Account ${index + 1} failed login:`, err.message);
  });
});

function joinVC(client, index) {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error(`Account ${index + 1}: Guild not found`);
      return;
    }

    const connection = joinVoiceChannel({
      channelId: CHANNEL_ID,
      guildId: GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: true,
      selfDeaf: true
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(`Account ${index + 1} joined voice channel`);
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.log(`Account ${index + 1} disconnected from VC, reconnecting...`);
      setTimeout(() => joinVC(client, index), 5000);
    });

    connection.on('error', (err) => {
      console.error(`Account ${index + 1} voice error:`, err.message);
    });

  } catch (error) {
    console.error(`Account ${index + 1} failed to join voice:`, error.message);
  }
}
