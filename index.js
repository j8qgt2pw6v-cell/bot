import { Client, GatewayIntentBits, Partials, REST, Routes, PermissionFlagsBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

client.once("ready", async () => {
  console.log(`🔥 Logged in as ${client.user.tag}`);

  const commands = [
    {
      name: "buildserver",
      description: "Build the full VÆX server automatically.",
      default_member_permissions: PermissionFlagsBits.Administrator.toString()
    }
  ];

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log("✅ Slash command /buildserver registered.");
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "buildserver") {
    await interaction.reply("⚡ Building **VÆX Server**... Please wait.");

    const guild = interaction.guild;
    guild.channels.cache.forEach(c => c.delete().catch(() => {}));

    const core = await guild.channels.create({ name: "📜 VÆX CORE", type: 4 });
    const community = await guild.channels.create({ name: "💬 COMMUNITY", type: 4 });
    const lounge = await guild.channels.create({ name: "🔥 VÆX LOUNGE", type: 4 });
    const gaming = await guild.channels.create({ name: "🎮 GAMING", type: 4 });
    const botzone = await guild.channels.create({ name: "🤖 BOT ZONE", type: 4 });
    const voicecat = await guild.channels.create({ name: "🎙 VOICE", type: 4 });
    const staff = await guild.channels.create({ name: "🛡 STAFF", type: 4 });

    const textChannels = [
      { cat: core, names: ["📢・announcements", "📥・updates", "👋・welcome", "📜・rules", "🎉・events"] },
      { cat: community, names: ["💬・general-chat", "📸・media", "🎭・memes", "🎧・music", "❓・help"] },
      { cat: lounge, names: ["💀・elite-chat", "⚡・clips", "🖤・aesthetic-drops", "🔥・highlights"] },
      { cat: gaming, names: ["🎮・gaming-chat", "🕹・team-finder", "🏆・rank-updates", "⚔️・fortnite", "💢・cod", "👽・valorant"] },
      { cat: botzone, names: ["🤖・bot-commands", "📊・level-up", "🎁・giveaways"] },
      { cat: staff, names: ["🛡・staff-chat", "🛠・staff-tools", "📄・reports", "🚨・mod-logs", "📚・archive"] }
    ];

    for (const group of textChannels) {
      for (const name of group.names) {
        await guild.channels.create({ name, type: 0, parent: group.cat.id });
      }
    }

    const voiceNames = [
      "🔊・Lobby",
      "🎮・Gaming Room 1",
      "🎮・Gaming Room 2",
      "🔥・Elite Voice",
      "🩸・AFK"
    ];

    for (const name of voiceNames) {
      await guild.channels.create({ name, type: 2, parent: voicecat.id });
    }

    const roleNames = [
      "OWNER","ADMIN","MOD","ENFORCER","SENTRY","VÆX ELITE",
      "VÆX MEMBER","GAMER","OG","BOOSTER","BOT","VISITOR"
    ];

    for (const r of roleNames) await guild.roles.create({ name: r });

    await staff.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: false });

    await interaction.followUp("🔥 **VÆX Server Build Complete!**");
  }
});

client.login(process.env.TOKEN);
