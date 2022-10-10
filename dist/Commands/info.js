"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const default_1 = require("../utils/default");
const discord_1 = require("../utils/discord");
const message = ({ name, memberCount, botCount, ownerName, boostCount, premiumTier, createdAt }) => {
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(':information_source: 서버 정보')
        .setDescription(`**:classical_building: 이름 : ${name} ｜ :crown: 소유자 : ${ownerName}**`)
        .addFields({ name: ':busts_in_silhouette: 인원 수', value: `${memberCount}명`, inline: true }, { name: ':robot: 봇 갯수', value: `${botCount}개`, inline: true })
        .addFields({ name: ':gem: 서버 부스트', value: `Level ${premiumTier} (부스트 ${boostCount}개)` }, { name: ':birthday: 서버 생성일', value: `${(0, default_1.getCurrentDate)(createdAt)} (D+${Math.round((new Date().getTime() - createdAt.getTime()) / 86400000)})` });
};
async function info(interaction) {
    await interaction.deferReply();
    await (0, discord_1.updateMemberCache)(interaction.guild);
    const owner = await interaction.guild.fetchOwner();
    const thisGuild = interaction.client.guilds.cache.get(interaction.guildId);
    interaction.editReply({ embeds: [message({
                name: interaction.guild.name,
                memberCount: thisGuild.members.cache.filter(member => !member.user.bot).size,
                botCount: thisGuild.members.cache.filter(member => member.user.bot).size,
                ownerName: owner.nickname ? owner.nickname : owner.user.username,
                boostCount: thisGuild.premiumSubscriptionCount,
                premiumTier: thisGuild.premiumTier,
                createdAt: thisGuild.createdAt
            })] });
}
exports.default = info;
