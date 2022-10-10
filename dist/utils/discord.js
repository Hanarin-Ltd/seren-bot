"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCommunity = exports.isGuildMember = exports.getChannel = exports.sendDM = exports.getMember = exports.getUser = exports.getGuildOwner = exports.getThisGuild = exports.isGuildModerator = exports.isGuildOwner = exports.updateGuildCache = exports.updateRoleCache = exports.updateChannelCache = exports.updateMemberCache = void 0;
const discord_js_1 = require("discord.js");
const mod_1 = require("./mod");
const updateMemberCache = async (guild) => {
    await guild.members.fetch().catch(err => {
        console.log(err);
    });
};
exports.updateMemberCache = updateMemberCache;
const updateChannelCache = async (guild) => {
    await guild.channels.fetch().catch(err => {
        console.log(err);
    });
};
exports.updateChannelCache = updateChannelCache;
const updateRoleCache = async (guild) => {
    await guild.roles.fetch().catch(err => {
        console.log(err);
    });
};
exports.updateRoleCache = updateRoleCache;
const updateGuildCache = async (guild) => {
    await guild.fetch().catch(err => {
        console.log(err);
    });
};
exports.updateGuildCache = updateGuildCache;
const isGuildOwner = async (guild, member) => {
    return (await guild.fetchOwner()).id === member.id;
};
exports.isGuildOwner = isGuildOwner;
const isGuildModerator = async (guild, member) => {
    return (await (0, mod_1.getModList)(guild.id)).filter(mod => mod.userId === member.id).length > 0;
};
exports.isGuildModerator = isGuildModerator;
const getThisGuild = async (interaction) => {
    return interaction.client.guilds.cache.get(interaction.guildId);
};
exports.getThisGuild = getThisGuild;
const getGuildOwner = async (guild) => {
    return await guild.fetchOwner();
};
exports.getGuildOwner = getGuildOwner;
const getUser = async (interaction, id) => {
    const data = await interaction.client.rest.get(discord_js_1.Routes.user(id));
    return data;
};
exports.getUser = getUser;
const getMember = async (guild, id) => {
    await (0, exports.updateMemberCache)(guild);
    return guild.members.cache.get(id);
};
exports.getMember = getMember;
const sendDM = async (interaction, message) => {
    var _a;
    await ((_a = interaction.client.users.cache.get(interaction.user.id)) === null || _a === void 0 ? void 0 : _a.send(message));
};
exports.sendDM = sendDM;
const getChannel = async (guild, channelId) => {
    return guild.channels.cache.get(channelId);
};
exports.getChannel = getChannel;
const isGuildMember = async (guild, user) => {
    return guild.members.cache.has(user.id);
};
exports.isGuildMember = isGuildMember;
const isCommunity = (guild) => {
    var _a;
    return (_a = guild.features) === null || _a === void 0 ? void 0 : _a.includes('COMMUNITY');
};
exports.isCommunity = isCommunity;
