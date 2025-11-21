// VÆX Builder Bot — Roles + Permissions + Auto-Role + /buildserver
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits
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
// Slash command: /buildserver
// ------------------------------------
const commands = [
  new SlashCommandBuilder()
    .setName("buildserver")
    .setDescription("Set up all VÆX roles, perms, and auto-role")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash command /buildserver registered.");
  } catch (e) {
    console.error("Slash command registration error:", e);
  }
})();

// ------------------------------------
// Ready event
// ------------------------------------
client.on("ready", () => {
  console.log(`🔥 VÆX Builder online as ${client.user.tag}`);
});

// ------------------------------------
// Auto-role: give VÆX MEMBER on join
// ------------------------------------
client.on("guildMemberAdd", async member => {
  const role = member.guild.roles.cache.find(r => r.name === "VÆX MEMBER");
  if (role) {
    member.roles.add(role).catch(() => {});
  }
});

// ------------------------------------
// Interaction handler
// ------------------------------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "buildserver") return;

  const guild = interaction.guild;

  await interaction.reply("⚙️ Setting up **VÆX** roles, permissions, and auto-role...");

  // ------------------------------------
  // ROLE DEFINITIONS (edgy VÆX palette)
  // ------------------------------------
  const roleData = [
    // name, color, permissions array
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

  // ------------------------------------
  // CREATE ROLES (or reuse existing)
  // ------------------------------------
  for (const [name, color, perms] of roleData) {
    let role = guild.roles.cache.find(r => r.name === name);

    if (!role) {
      role = await guild.roles.create({
        name,
        color,
        permissions: perms,
        reason: "VÆX Builder role creation"
      });
      console.log(`Created role: ${name}`);
    } else {
      // Optionally update color/perms if it already exists
      await role.edit({
        color,
        permissions: perms
      }).catch(() => {});
      console.log(`Updated role: ${name}`);
    }

    createdRoles[name] = role;
  }

  // ------------------------------------
  // SORT ROLES (best effort)
  // ------------------------------------
  try {
    const orderTopToBottom = [
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

    // Start just below the bot's highest role
    const botMember = await guild.members.fetch(client.user.id);
    const botHighest = botMember.roles.highest.position;
    let pos = botHighest - 1;

    for (const name of orderTopToBottom) {
      const role = createdRoles[name];
      if (!role) continue;
      await role.setPosition(pos).catch(() => {});
      pos--;
    }
  } catch (e) {
    console.warn("Could not sort roles (check bot role position):", e.message);
  }

  // ------------------------------------
  // DONE
  // ------------------------------------
  await interaction.followUp("🔥 **VÆX roles, colors, permissions, and auto-role are now set up!**\nMake sure the bot's role is high enough above these roles to manage them.");
});

// ------------------------------------
// Login
// ------------------------------------
client.login(process.env.TOKEN);
