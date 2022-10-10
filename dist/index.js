"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.env = void 0;
require("dotenv/config");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: __dirname + '../.env' });
exports.env = process.env;
const discord_js_1 = require("discord.js");
const commands_1 = require("./commands");
const blockword_1 = require("./Commands/blockword");
const guildSetting_1 = __importDefault(require("./guildSetting"));
const welcome_1 = require("./welcome");
const socket_1 = __importDefault(require("./socket"));
const lib_1 = require("./lib");
const channel_1 = require("./utils/channel");
const default_1 = require("./utils/default");
const discord_1 = require("./utils/discord");
const guildData_1 = require("./utils/guildData");
const memberData_1 = require("./utils/memberData");
const mod_1 = require("./utils/mod");
const ban_1 = require("./utils/ban");
const guildOption_1 = require("./utils/guildOption");
const ban_2 = require("./Commands/ban");
const role_1 = require("./utils/role");
const log_1 = require("./utils/log");
const level_1 = require("./utils/level");
const coin_1 = require("./utils/coin");
const coin_2 = __importDefault(require("./coin/coin"));
const userData_1 = require("./utils/userData");
exports.client = new discord_js_1.Client({ intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildPresences,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.DirectMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildBans,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.GuildMessageTyping,
        discord_js_1.GatewayIntentBits.DirectMessageTyping
    ] });
exports.client.on('ready', async () => {
    var _a;
    console.log(`Logged in as ${(_a = exports.client.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
    console.log(`Version: ${exports.env.VERSION} / Build: ${exports.env.BUILD_DATE}`);
    (0, socket_1.default)();
    (0, coin_2.default)();
    exports.client.user.setActivity('/안녕 , /도움말');
    await (0, default_1.addSlashCommands)();
});
exports.client.on('messageCreate', async (message) => {
    try {
        if (!message.guild)
            return;
        if (!message.member)
            return;
        if (message.author.bot)
            return;
        if (!message.channel || message.channel.type !== discord_js_1.ChannelType.GuildText)
            return;
        (0, blockword_1.scanMessage)(message);
        await (0, level_1.addMemberExp)(message.member, 10);
        await (0, level_1.checkLevelUp)(message.member, message.channel);
        const exist = await (0, userData_1.getUserData)(message.author.id);
        if (!exist)
            await (0, userData_1.addUserData)(message.author.id);
    }
    catch {
        return;
    }
});
exports.client.on('interactionCreate', async (interaction) => {
    if (interaction.isAutocomplete()) {
        switch (interaction.commandName) {
            case '코인가격': {
                (0, coin_1.coinNameAutoComplete)(interaction);
                break;
            }
            case '코인구매': {
                (0, coin_1.coinNameAutoComplete)(interaction);
                break;
            }
            case '코인판매': {
                (0, coin_1.ownedCoinAutoComplete)(interaction);
                break;
            }
            case '코인댓글': {
                (0, coin_1.coinNameAutoComplete)(interaction);
                break;
            }
        }
    }
    else if (interaction.isChatInputCommand()) {
        if (commands_1.usableInDM.includes(interaction.commandName) && !interaction.channel) {
            try {
                return (0, commands_1.getCommandFunction)()[interaction.commandName](interaction);
            }
            catch (error) {
                console.log(error);
                return interaction.reply({ embeds: [(0, default_1.errorMessage)()] });
            }
        }
        else {
            if (!(await (0, guildData_1.getGuildData)(interaction.guild.id)).isSettingComplete) {
                await interaction.reply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':warning: 설정이 완료되지 않았습니다!', description: '기본 설정을 완료한뒤 봇을 사용할 수 있습니다.' }] });
                return;
            }
            const logSetting = await (0, log_1.getGuildLogSetting)(interaction.guild.id);
            try {
                (0, commands_1.getCommandFunction)()[interaction.commandName](interaction);
                (logSetting === null || logSetting === void 0 ? void 0 : logSetting.useCommand) && (0, log_1.log)({
                    content: `명령어 사용 : ${interaction.member.user.username} / 사용한 명령어 : ${interaction.commandName}`,
                    rawContent: `명령어 사용 : ${interaction.member} / 사용한 명령어 : ${interaction.commandName}`,
                    guild: interaction.guild,
                    type: 'useCommand'
                });
                await (0, level_1.addMemberExp)(interaction.member, 5);
                if (interaction.channel.isDMBased())
                    return;
                if (interaction.channel.type !== discord_js_1.ChannelType.GuildText)
                    return;
                await (0, level_1.checkLevelUp)(interaction.member, interaction.channel);
            }
            catch (error) {
                console.log(error);
                interaction.reply({ embeds: [(0, default_1.errorMessage)()] });
            }
        }
    }
});
exports.client.on('guildCreate', async (guild) => {
    await (0, guildData_1.removeGuildData)(guild.id);
    await (0, mod_1.addMod)(guild, await (0, discord_1.getGuildOwner)(guild));
    (0, guildSetting_1.default)(guild);
    guild.roles.everyone.permissions.remove('MentionEveryone');
});
exports.client.on('guildDelete', async (guild) => {
    try {
        (0, guildData_1.removeGuildData)(guild.id);
    }
    catch (error) {
        console.log(error);
    }
});
exports.client.on('guildMemberAdd', async (member) => {
    await (0, memberData_1.addMemberData)(member);
    await (0, welcome_1.welcome)(member);
});
exports.client.on('guildMemberRemove', async (member) => {
    var _a;
    if (member.id === ((_a = exports.client.user) === null || _a === void 0 ? void 0 : _a.id))
        return;
    await (0, memberData_1.removeMemberData)(member);
    await (0, ban_1.updateBanListCache)(member.guild);
    const banList = (await (0, ban_1.getBanListFromAPI)(member.guild)).map(m => m.user.id);
    if (banList.includes(member.id)) {
        try {
            const option = (await (0, guildOption_1.getGuildOption)(member.guild.id));
            const channel = (await (0, discord_1.getChannel)(member.guild, option.banChannelId));
            const logSetting = await (0, log_1.getGuildLogSetting)(member.guild.id);
            await (0, ban_1.addBan)(member.guild.id, member, '알 수 없음');
            if (!channel || !channel.isTextBased())
                return;
            option.banMessageEnabled && channel.send({ embeds: [(0, ban_2.someoneHasBan)(member.user.username, '알 수 없음')] });
            (logSetting === null || logSetting === void 0 ? void 0 : logSetting.addBan) && (0, log_1.log)({
                content: `차단 추가됨 : ${member.user.username}`,
                rawContent: `차단 추가됨 : ${(0, discord_js_1.userMention)(member.user.id)}`,
                guild: member.guild,
                type: 'addBan'
            });
        }
        catch (e) {
            console.log(e);
        }
        return;
    }
    await (0, welcome_1.goodbye)(member);
});
exports.client.on('channelCreate', async (channel) => {
    if (channel.isDMBased())
        return;
    await (0, channel_1.addGuildChannel)(channel);
});
exports.client.on('channelDelete', async (channel) => {
    if (channel.isDMBased())
        return;
    await (0, channel_1.removeGuildChannel)(channel);
});
exports.client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (oldChannel.isDMBased() || newChannel.isDMBased())
        return;
    await (0, channel_1.modifyGuildChannel)(oldChannel, newChannel);
});
exports.client.on('guildBanAdd', async (banMember) => {
    var _a;
    if (banMember.user.id === ((_a = exports.client.user) === null || _a === void 0 ? void 0 : _a.id))
        return;
    try {
        const thisGuild = banMember.guild;
        const option = (await (0, guildOption_1.getGuildOption)(thisGuild.id));
        const logSetting = await (0, log_1.getGuildLogSetting)(thisGuild.id);
        const channel = await (0, discord_1.getChannel)(thisGuild, option.banChannelId);
        (logSetting === null || logSetting === void 0 ? void 0 : logSetting.addBan) && (0, log_1.log)({
            content: `차단 추가됨 : ${banMember.user.username}`,
            rawContent: `차단 추가됨 : ${(0, discord_js_1.userMention)(banMember.user.id)}`,
            guild: thisGuild,
            type: 'addBan'
        });
        if (!channel || !channel.isTextBased())
            return;
        option.banMessageEnabled && channel.send({ embeds: [(0, ban_2.someoneHasBan)(banMember.user.username, banMember.reason || '공개되지 않음')] });
    }
    catch (e) {
        console.log(e);
    }
});
exports.client.on('guildBanRemove', async (banMember) => {
    try {
        const thisGuild = banMember.guild;
        const option = (await (0, guildOption_1.getGuildOption)(thisGuild.id));
        const logSetting = await (0, log_1.getGuildLogSetting)(thisGuild.id);
        const channel = await (0, discord_1.getChannel)(thisGuild, option.banChannelId);
        await (0, ban_1.removeBan)(thisGuild.id, banMember.user.id);
        (logSetting === null || logSetting === void 0 ? void 0 : logSetting.removeBan) && (0, log_1.log)({
            content: `차단 해제됨 : ${banMember.user.username}`,
            rawContent: `차단 해제됨 : ${(0, discord_js_1.userMention)(banMember.user.id)}`,
            guild: thisGuild,
            type: 'removeBan'
        });
        if (!channel || !channel.isTextBased())
            return;
        option.unbanMessageEnabled && channel.send({ embeds: [(0, ban_2.someoneHasUnban)(banMember.user.username, banMember.reason || '공개되지 않음')] });
    }
    catch (e) {
        console.log(e);
    }
});
exports.client.on('guildMemberUpdate', async (oldMember, newMember) => {
    var _a;
    if (oldMember.user.id === ((_a = exports.client.user) === null || _a === void 0 ? void 0 : _a.id))
        return;
    console.log('updated');
    await (0, memberData_1.updateMemberData)(newMember);
    try {
        const modRoleId = (await (0, role_1.getGuildModRole)(newMember.guild)).id;
        const thisGuild = oldMember.guild;
        if (newMember.roles.cache.has(modRoleId)) {
            await (0, mod_1.addMod)(thisGuild, newMember);
        }
        else if (!newMember.roles.cache.has(modRoleId)) {
            await (0, mod_1.removeMod)(thisGuild, newMember);
        }
        const logSetting = (await (0, log_1.getGuildLogSetting)(newMember.guild.id));
        const oldRoles = oldMember.roles.cache.map(r => r.id);
        const newRoles = newMember.roles.cache.map(r => r.id);
        const deletedRole = oldRoles.filter(r => !newRoles.includes(r));
        const addedRole = newRoles.filter(r => !oldRoles.includes(r));
        deletedRole.forEach(async (id) => {
            const role = (await (0, role_1.getGuildRole)(thisGuild, id));
            (logSetting === null || logSetting === void 0 ? void 0 : logSetting.removeRoleToMember) && (0, log_1.log)({
                content: `역할 제거됨 : ${newMember.user.username} / 제거된 역할 : ${role.name}`,
                rawContent: `역할 제거됨 : ${(0, discord_js_1.userMention)(newMember.id)} / 제거된 역할 : ${role.name}`,
                guild: thisGuild,
                type: 'removeRoleToMember'
            });
        });
        addedRole.forEach(async (id) => {
            const role = (await (0, role_1.getGuildRole)(thisGuild, id));
            (logSetting === null || logSetting === void 0 ? void 0 : logSetting.addRoleToMember) && (0, log_1.log)({
                content: `역할 추가됨 : ${newMember.user.username} / 추가된 역할 : ${role.name}`,
                rawContent: `역할 추가됨 : ${(0, discord_js_1.userMention)(newMember.id)} / 추가된 역할 : ${role.name}`,
                guild: thisGuild,
                type: 'addRoleToMember'
            });
        });
    }
    catch {
        return;
    }
});
exports.client.on('guildUpdate', async (oldGuild, newGuild) => {
    await (0, guildData_1.addOrUpdateGuildData)(newGuild);
});
exports.client.on('messageDelete', async (message) => {
    try {
        if (!message.guild)
            return;
        const logSetting = await (0, log_1.getGuildLogSetting)(message.guildId);
        (logSetting === null || logSetting === void 0 ? void 0 : logSetting.removeMessage) && (0, log_1.log)({
            content: `메세지 삭제됨 / 메세지 작성자 : ${message.member.user.username} / 내용 : ${message.content || '알 수 없음 (null)'}`,
            rawContent: `메세지 삭제됨 / 메세지 작성자 : ${(0, discord_js_1.userMention)(message.member.id)} / 내용 : ${message.content || '알 수 없음 (null)'}`,
            guild: message.guild,
            type: 'removeMessage'
        });
    }
    catch {
        return;
    }
});
exports.client.login(exports.env.BOT_TOKEN);
/*
userCreate : O
userDelete : O
addMod : O
removeMod : O
useCommand : O
useBlockword : O
addBlockword : O
removeBlockword : O
removeMessage : O
levelUp : O
addRoleToMember : O
removeRoleToMember : O
addBan : X
removeBan : X
getWarning : O
removeWarning : O
*/
