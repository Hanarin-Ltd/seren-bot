import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { BOT_COLOR } from "../lib"
import { getBlockwordList, setDefaultBlockword } from "../utils/blockword"
import { addAllGuildChannel } from "../utils/channel"
import { deferReply } from "../utils/default"
import { addOrUpdateGuildData } from "../utils/guildData"
import { addAllGuildMemberData } from "../utils/memberData"
import { updateAllMod } from "../utils/mod"
import { addAllGuildRole } from "../utils/role"
import { addGuildAllUserData } from "../utils/userData"

const areYouSure = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':warning: 정말로 진행하시겠습니까?')
    .setDescription(`마이그레이션은 봇 업데이트후 문제 발생시 사용합니다. 평상시 사용하게 되면 데이터가 손실될 수 있습니다.
    진행하시려면 \`네\`를 눌러주세요. **이 작업은 되돌릴 수 없습니다!**`)

const migrationSuccess = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':white_check_mark: 마이그레이션이 완료되었습니다!')
    .setDescription('모든 데이터가 정상적으로 마이그레이션 되었습니다!')
    .setTimestamp()

const migrationFail = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':x: 마이그레이션에 실패했습니다!')
    .setDescription('데이터 마이그레이션에 실패했습니다. 다시 시도해주세요. **데이터가 일부 손실되었을 수 있습니다.**')
    .setTimestamp()

const migrationCancel = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':x: 마이그레이션이 취소되었습니다!')
    .setDescription('데이터 마이그레이션을 취소했습니다.')
    .setTimestamp()

const migrating = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':hourglass: 마이그레이션 중입니다...')
    .setDescription('데이터 마이그레이션을 진행중입니다. 잠시만 기다려주세요...')
    .setTimestamp()

const checkButtons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('yes')
            .setLabel('네')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('no')
            .setLabel('아니요')
            .setStyle(ButtonStyle.Primary)
    )

export default async function migration(interaction: ChatInputCommandInteraction) {
    await deferReply(interaction)

    const collector = interaction.channel?.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 10000,
        max: 1
    })
    collector?.on('collect', async i => {
        if (i.customId === 'yes') {
            await i.deferUpdate()
            await i.editReply({ embeds: [migrating], components: [] })
            try {
                if (!interaction.guild) throw new Error('서버를 감지할 수 없음')
                if (!interaction.guildId) throw new Error('서버 ID를 얻어올 수 없음')

                const formerBlockword = await getBlockwordList(interaction.guildId)
                
                await addOrUpdateGuildData(interaction.guild)
                await addAllGuildChannel(interaction.guild)
                await addAllGuildRole(interaction.guild)
                await addGuildAllUserData(interaction.guild)
                await addAllGuildMemberData(interaction.guild)
                await updateAllMod(interaction.guild)
                await setDefaultBlockword(interaction.guildId, formerBlockword)
                await i.editReply({ embeds: [migrationSuccess], components: [] })
            } catch (e) {
                console.log(e)
                await i.editReply({ embeds: [migrationFail], components: [] })
            }
        }
        else if (i.customId === 'no') {
            await i.deferUpdate()
            await i.editReply({ embeds: [migrationCancel], components: [] })
        }
    })

    await interaction.editReply({ embeds: [areYouSure], components: [checkButtons] })
}
