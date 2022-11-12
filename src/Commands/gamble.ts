import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, User } from 'discord.js'
import { BOT_COLOR } from '../lib'
import { errorMessage } from '../utils/default'
import { addUserPoint, getUserData, setUserGambleCount } from '../utils/userData'

let percentageSeed = 1.1

const gambleEmbed = (user: User, attempt: number, point: number, accumulate: number,) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':slot_machine: 포인트 도박')
    .setDescription('과연 얼마나 많은 포인트를 얻을 수 있을까요?')
    .addFields(
        { name: '도전 횟수', value: `> **${attempt.toString()}회**`, inline: true },
        { name: '성공 확률', value: `> **${(100 / (attempt + percentageSeed)).toFixed(2)}%**`, inline: true },
        { name: '현재 누적 포인트', value: `> **${accumulate.toString()}**`, inline: true },
        { name: '성공시 누적 포인트', value: `> **${((accumulate * attempt / 10) + point).toString()}**`, inline: true },
    )
    .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL()
    })
    .setTimestamp()

const notEnoughPointEmbed = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':slot_machine: 포인트 도박')
    .setDescription('**포인트가 부족합니다.**')
    .setTimestamp()

const gambleEndEmbed = (user: User, attempt: number, accumulate: number, point: number) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':slot_machine: 포인트 도박 결과')
    .setDescription('**도박을 포기하셨습니다.**')
    .addFields(
        { name: '도전 횟수', value: `> **${attempt.toString()}회**`, inline: true },
        { name: '얻은 포인트', value: `> **${accumulate.toString()}**`, inline: true },
        { name: '현재 포인트', value: `> **${point.toString()}**`, inline: true },
    )
    .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL()
    })
    .setTimestamp()

const gambleFailEmbed = (user: User, attempt: number, accumulate: number, point: number) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':slot_machine: 포인트 도박 결과')
    .setDescription('**도박에 실패하셨습니다.**')
    .addFields(
        { name: '도전 횟수', value: `> **${attempt.toString()}회**`, inline: true },
        { name: '얻은 포인트', value: `> **${accumulate.toString()}**`, inline: true },
        { name: '현재 포인트', value: `> **${point.toString()}**`, inline: true },
    )
    .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL()
    })
    .setTimestamp()

const gambleButtons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setLabel('도박하기')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('gamble'),
        new ButtonBuilder()
            .setLabel('포기하기')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('gambleEnd')
    )

export default async function gamble(interaction: ChatInputCommandInteraction) {
    const options = interaction.options
    const thrill = options.getNumber('짜릿함')
    const amount = thrill ? thrill * 1000 : 1000

    const user = interaction.user
    const userData = await getUserData(user.id)
    if (!userData) return interaction.editReply({ embeds: [errorMessage('데이터를 불러올 수 없습니다.')] })
    if (userData.gambleCount >= 5) return interaction.editReply({ embeds: [errorMessage('도박은 하루에 5번만 할 수 있습니다.')] })
    if (!interaction.channel) return interaction.editReply({ embeds: [errorMessage('채널 정보를 불러올 수 없습니다.')] })
    if (userData.point < amount) return interaction.editReply({ embeds: [notEnoughPointEmbed] })

    await setUserGambleCount(user.id, userData.gambleCount + 1)

    const data = {
        attempt: 1,
        point: amount,
        accumulate: amount,
    }

    const collector = interaction.channel.createMessageComponentCollector<ComponentType.Button>({
        filter: i => i.user.id === user.id,
        time: 10000000,
    })
    collector.on('collect', async (i): Promise<any> => {
        await i.deferUpdate()
        if (i.customId === 'gamble') {
            const isSuccess = Math.random() * 100 < (100 / (data.attempt + percentageSeed))
            if (isSuccess) {
                data.accumulate += data.accumulate * data.attempt / 10
                data.attempt += 1
                await interaction.editReply({ embeds: [gambleEmbed(user, data.attempt, data.point, data.accumulate)] })
            }
            else {
                collector.stop()
                if (data.attempt === 1) {
                    await addUserPoint(user.id, -data.point)
                    return await interaction.editReply({ embeds: [gambleFailEmbed(user, data.attempt, 0, userData.point - data.point)], components: [] })
                }
                await interaction.editReply({ embeds: [gambleFailEmbed(user, data.attempt, data.accumulate, userData.point + data.accumulate)], components: [] })
                await addUserPoint(user.id, data.accumulate)
            }
        }
        else if (i.customId === 'gambleEnd') {
            collector.stop()
            if (data.attempt === 1) {
                await addUserPoint(user.id, -data.point)
                return await interaction.editReply({ embeds: [gambleEndEmbed(user, data.attempt, 0, userData.point)], components: [] })
            }
            await interaction.editReply({ embeds: [gambleEndEmbed(user, data.attempt, data.accumulate, userData.point + data.accumulate)], components: [] })
            await addUserPoint(user.id, data.accumulate)
        }
    })

    await interaction.editReply({ embeds: [gambleEmbed(user, data.attempt, data.point, data.accumulate)], components: [gambleButtons] })
}
