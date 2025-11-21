// VÆX Builder Bot — Full Roles + Perms + AutoRole
require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

// ------------------------------------
// Create the Discord client
// ------------------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ------------------------------------
// Register slash command /buildserver
// ------------------------------------
const commands = [
  new SlashCommandBuilder()
    .setName("buildserver")
    .setDescription("Build your entire VÆX server automatically")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands
    });
    console.log("Slash commands registered.");
  } catch (e) {
    console.error("Slash command registration error:", e);
  }
})();

// ------------------------------------
// Ready event
// ------------------------------------
client.on("ready", () => {
  console.log(`VÆX Builder online as ${client.user.tag}`);
});

// ------------------------------------
// Auto-role system
// ------------------------------------
client.on("guildMemberAdd", async member => {
  const role = member.guild.roles.cache.find(r => r.name === "VÆX MEMBER");
  if (role) {
    member.roles.add(role).catch(() => {});
  }
});

// ------------------------------------
// Slash command handler
// ------------------------------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "buildserver") return;

  const guild = interaction.guild;

  await interaction.reply("⚙️ Building your VÆX server...");

  // ------------------------------------
  // ROLES + PERMISSIONS
  // ------------------------------------
  const roleData = [
    ["OWNER", "#ff0000", { Administrator: true }],
    [
      "ADMIN",
      "#ff3300",
      {
        ManageGuild: true,
        ManageRoles: true,
        ManageChannels: true,
        KickMembers: true,
        BanMembers: true,
        ModerateMembers: true,
        ManageMessages: true,
        ManageWebhooks: true
      }
    ],
    [
      "MOD",
      "#ff6600",
      {
        KickMembers: true,
        ModerateMembers: true,
        ManageMessages: true,
        MoveMembers: true
      }
    ],
    ["ENFORCER", "#cc6600", { ModerateMembers: true, ManageMessages: true }],
    ["SENTRY", "#996600", {}],

    ["VÆX ELITE", "#9900ff", {}],
    ["OG", "#00e6e6", {}],
    ["BOOSTER", "#ff73fa", {}],
    ["GAMER", "#00ff40", {}],
    ["BOT", "#7289da", {}],

    ["VÆX MEMBER", "#ffffff", {}],
    ["VISITOR", "#a0a0a0", {}]
  ];

  let createdRoles = {};

  for (const [name, color, perms] of roleData) {
    let role = guild.roles.cache.find(r => r.name === name);

    if (!role) {
      role = await guild.roles.create({
        name,
        color,
        permissions: Object.keys(perms).length ? perms : [],
        reason: "VÆX Builder role setup"
      });
    }

    createdRoles[name] = role;
  }

  // ------------------------------------
  // SORT ROLES (Hierarchy)
  // ------------------------------------
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

  let position = guild.roles.highest.position - 1;

  for (const name of order) {
    const role = createdRoles[name];
    if (role) {
      await role.setPosition(position);
      position--;
    }
  }

  // ------------------------------------
  // Done
  // ------------------------------------
  await interaction.followUp("🔥 **VÆX roles, perms, and auto-role setup complete!**");
});

// ------------------------------------
// Start bot
// ------------------------------------
client.login(process.env.TOKEN);
