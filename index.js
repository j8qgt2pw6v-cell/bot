// VÆX Builder Bot — Split Commands: /addroles & /rebuildserver
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

// ------------------------------------
// Create the bot client
// ------------------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ------------------------------------
// Slash Commands
// ------------------------------------
const commands = [
  new SlashCommandBuilder()
    .setName("addroles")
    .setDescription("Add all VÆX roles, colors, and permissions"),

  new SlashCommandBuilder()
    .setName("rebuildserver")
    .setDescription("Create all VÆX channels & categories (safe)")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// Register commands globally
(async () => {
  try {
    console.log("Updating slash commands...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Registered /addroles & /rebuildserver");
  } catch (error) {
    console.error("Slash command error:", error);
  }
})();

// ------------------------------------
// Ready Event
// ------------------------------------
client.on("ready", () => {
  console.log(`🔥 VÆX Builder online as ${client.user.tag}`);
});

// ------------------------------------
// Auto-role when a member joins
// ------------------------------------
client.on("guildMemberAdd", async member => {
  const role = member.guild.roles.cache.find(r => r.name === "VÆX MEMBER");
  if (role) member.roles.add(role).catch(() => {});
});

// ------------------------------------
// Interaction Handler
// ------------------------------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const guild = interaction.guild;

  // ================================
  //        /addroles COMMAND
  // ================================
  if (interaction.commandName === "addroles") {
    await interaction.reply("⚙️ Creating VÆX roles and permissions...");

    const roleData = [
      ["OWNER", "#B00000", [PermissionFlagsBits.Administrator]],
      ["ADMIN", "#D12A00", [
        PermissionFlagsBits.ManageGuild,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.ModerateMembers,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.ManageWebhooks,
        PermissionFlagsBits.ViewAuditLog
      ]],
      ["MOD", "#E05A00", [
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.ModerateMembers,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.MoveMembers
      ]],
      ["ENFORCER", "#A84C00", [
        PermissionFlagsBits.ModerateMembers,
        PermissionFlagsBits.ManageMessages
      ]],
      ["SENTRY", "#734000", []],

      ["VÆX ELITE", "#7A00CC", []],
      ["OG", "#00B3B3", []],
      ["BOOSTER", "#CC5AD6", []],
      ["GAMER", "#00CC39", []],
      ["BOT", "#677BC4", []],

      ["VÆX MEMBER", "#E6E6E6", []],
      ["VISITOR", "#808080", []]
    ];

    const createdRoles = {};

    // Create or update roles
    for (const [name, color, perms] of roleData) {
      let role = guild.roles.cache.find(r => r.name === name);

      if (!role) {
        role = await guild.roles.create({
          name,
          color,
          permissions: perms
        });
        console.log(`Created role: ${name}`);
      } else {
        await role.edit({ color, permissions: perms }).catch(() => {});
        console.log(`Updated role: ${name}`);
      }

      createdRoles[name] = role;
    }

    // Sort roles
    try {
      const order = [
        "OWNER",
        "ADMIN",
        "MOD",
        "ENFORCER",
        "SENTRY",
        "VÆX ELITE",
        "OG",
        "BOOSTER",
        "GAMER",
        "BOT",
        "VÆX MEMBER",
        "VISITOR"
      ];

      let botMember = await guild.members.fetch(client.user.id);
      let pos = botMember.roles.highest.position - 1;

      for (const name of order) {
        const role = createdRoles[name];
        if (role) {
          await role.setPosition(pos).catch(() => {});
          pos--;
        }
      }
    } catch (e) {
      console.warn("Role sorting issue:", e.message);
    }

    return interaction.followUp("🔥 **VÆX roles added & sorted!**");
  }

  // ================================
  //       /rebuildserver COMMAND
  // ================================
  if (interaction.commandName === "rebuildserver") {
    await interaction.reply("🔧 Rebuilding VÆX channels and categories...");

    const channelLayout = {
      "📜 VÆX CORE": [
        "📢・announcements",
        "👋・welcome",
        "📜・rules",
        "📥・updates"
      ],
      "💬 COMMUNITY": [
        "💬・general-chat",
        "📸・media",
        "🎭・memes",
        "🎧・music",
        "❓・help"
      ],
      "🎮 GAMING": [
        "🎮・gaming-chat",
        "🕹・team-finder"
      ],
      "🤖 BOT ZONE": [
        "🤖・bot-commands",
        "📊・level-up"
      ],
      "🛡 STAFF": [
        "🛡・staff-chat",
        "🚨・mod-logs"
      ]
    };

    const categoryMap = {};

    // Create categories
    for (const catName of Object.keys(channelLayout)) {
      let category = guild.channels.cache.find(
        c => c.name === catName && c.type === ChannelType.GuildCategory
      );

      if (!category) {
        category = await guild.channels.create({
          name: catName,
          type: ChannelType.GuildCategory
        });
        console.log("Created category:", catName);
      }

      categoryMap[catName] = category;
    }

    // Create channels in each category
    for (const [catName, channels] of Object.entries(channelLayout)) {
      const category = categoryMap[catName];
      for (const chName of channels) {
        let existing = guild.channels.cache.find(c => c.name === chName);
        if (!existing) {
          await guild.channels.create({
            name: chName,
            type: ChannelType.GuildText,
            parent: category.id
          });
          console.log(`Created channel: ${chName}`);
        }
      }
    }

    return interaction.followUp("🔥 **VÆX channels rebuilt successfully!**");
  }
});

// ------------------------------------
// Login
// ------------------------------------
client.login(process.env.TOKEN);
