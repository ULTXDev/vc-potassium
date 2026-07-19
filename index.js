const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');

// Railway will securely inject these variables later
const TOKENS = [
  process.env.TOKEN_1, process.env.TOKEN_2, process.env.TOKEN_3,
  process.env.TOKEN_4, process.env.TOKEN_5, process.env.TOKEN_6,
  process.env.TOKEN_7
];
const GUILD_ID = "1289988589052104846";
const CHANNEL_ID = "1343599197856727061";

TOKENS.forEach((token, index) => {
  if (!token) {
    console.log(`Skipping slot ${index + 1}: No token provided in environment variables.`);
    return;
  }

  const client = new Client({ checkUpdate: false });

  client.on('ready', async () => {
    console.log(`Account ${index + 1} (${client.user.tag}) is online!`);
    
    try {
      const guild = await client.guilds.fetch(GUILD_ID);
      joinVoiceChannel({
        channelId: CHANNEL_ID,
        guildId: GUILD_ID,
        adapterCreator: guild.voiceAdapterCreator,
        selfMute: true,  // Keeps your mic muted
        selfDeaf: true   // Deafens you to save Railway bandwidth
      });
      console.log(`Account ${index + 1} successfully joined the voice channel.`);
    } catch (error) {
      console.error(`Account ${index + 1} failed to join voice:`, error.message);
    }
  });

  client.login(token).catch(err => {
    console.error(`Account ${index + 1} failed login: Status code or token might be flagged.`);
  });
});