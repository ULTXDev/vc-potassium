// --- DISCORD API BREAKING CHANGE HOTFIX ---
try {
  const ClientUserSettingManager = require('discord.js-selfbot-v13/src/managers/ClientUserSettingManager');
  const originalPatch = ClientUserSettingManager.prototype._patch;
  ClientUserSettingManager.prototype._patch = function (data) {
    if (data && !data.friend_source_flags) {
      data.friend_source_flags = { all: false, mutual_friends: false, mutual_guilds: false };
    }
    return originalPatch.call(this, data);
  };
} catch (err) {
  console.log("Hotfix injection skipped or unneeded.");
}
// ------------------------------------------

const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');

const TOKENS = [
  process.env.TOKEN_1, process.env.TOKEN_2, process.env.TOKEN_3,
  process.env.TOKEN_4, process.env.TOKEN_5, process.env.TOKEN_6,
  process.env.TOKEN_7
];
const GUILD_ID = "1289988589052104846";
const CHANNEL_ID = "1343599197856727061";

TOKENS.forEach((token, index) => {
  if (!token) return;

  const client = new Client({ checkUpdate: false });

  client.on('ready', async () => {
    console.log(`Account ${index + 1} (${client.user.tag}) is online!`);
    
    try {
      const guild = await client.guilds.fetch(GUILD_ID);
      joinVoiceChannel({
        channelId: CHANNEL_ID,
        guildId: GUILD_ID,
        adapterCreator: guild.voiceAdapterCreator,
        selfMute: true,
        selfDeaf: true
      });
      console.log(`Account ${index + 1} successfully joined the voice channel.`);
    } catch (error) {
      console.error(`Account ${index + 1} failed to join voice:`, error.message);
    }
  });

  client.login(token).catch(err => {
    console.error(`Account ${index + 1} failed login: Token might be invalid or flagged.`);
  });
});
