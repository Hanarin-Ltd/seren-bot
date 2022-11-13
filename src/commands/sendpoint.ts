import { ActionRowBuilder, blockQuote, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, User } from "discord.js"
import { BOT_COLOR } from "../lib"
import { errorMessage } from "../utils/default"
import { sendDM } from "../utils/discord"
import { addUserPoint, getUserData, removeUserPoint } from "../utils/userData"

const theTradeHasBeenCanceled = (author: User, cause?: string) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':x: 거래가 취소되었습니다.')
    .setDescription(cause || '오류가 발생했습니다. 안전하게 취소되었습니다.')
    .setAuthor({
        name: author.tag,
        iconURL: author.displayAvatarURL()
    })
    .setTimestamp(new Date())

const areYouSure = (author: User, targetTag: string, amount: number, tax: number) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':warning: 정말 진행하시겠습니까?')
    .setDescription('거래는 취소할 수 없습니다. 진행하시려면 `예`를 눌러주세요.')
    .addFields(
        { name: '보내는 사람', value: blockQuote(author.tag), inline: true },
        { name: '받는 사람', value: blockQuote(`**${targetTag}**`), inline: true },
        { name: '거래 금액', value: blockQuote(`${amount}포인트`), inline: true },
        { name: '수수료', value: blockQuote(`**10% (${tax}포인트)**`), inline: true },
        { name: '실 수료 금액', value: blockQuote(`${amount - tax}포인트`), inline: true }
    )

const pleaseWait = (author: User) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':hourglass: 잠시만 기다려주세요...')
    .setDescription('거래를 진행중입니다. 잠시만 기다려주세요.')
    .setAuthor({
        name: author.tag,
        iconURL: author.displayAvatarURL()
    })
    .setTimestamp(new Date())

const tradeSuccess = (author: User, targetTag: string, amount: number, point: number, tax: number, time: Date) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':white_check_mark: 거래가 완료되었습니다.')
    .addFields(
        { name: '보낸 사람', value: blockQuote(author.tag), inline: true },
        { name: '받은 사람', value: blockQuote(`**${targetTag}**`), inline: true },
        { name: '거래 금액', value: blockQuote(`${amount}포인트`), inline: true },
        { name: '수수료', value: blockQuote(`**10% (${tax}포인트)**`), inline: true },
        { name: '실 수료 금액', value: blockQuote(`${amount - amount * (1 / 10)}포인트`), inline: true },
        { name: '남은 포인트', value: blockQuote(`**${point - amount}포인트**`), inline: true }
    )
    .setAuthor({
        name: author.tag,
        iconURL: author.displayAvatarURL()
    })
    .setTimestamp(time)

const youGotCoin = (author: User, targetTag: string, amount: number, point: number, time: Date) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':envelope_with_arrow: 포인트가 도착했습니다!')
    .addFields(
        { name: '보낸 사람', value: blockQuote(author.tag), inline: true },
        { name: '받은 사람', value: blockQuote(`**${targetTag}**`), inline: true },
        { name: '수료 금액', value: blockQuote(`${amount}포인트`), inline: true },
        { name: '현재 포인트', value: blockQuote(`**${point + amount}포인트**`), inline: true }
    )
    .setAuthor({
        name: author.tag,
        iconURL: author.displayAvatarURL()
    })
    .setTimestamp(time)

const tradeQuestion = () => new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setLabel('예')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('yes'),
        new ButtonBuilder()
            .setLabel('취소')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('no')
    )

export default async function sendPoint(interaction: ChatInputCommandInteraction) {
    const args = interaction.options
    const target = await getUserData(args.getString('아이디', true))
    const amount = args.getNumber('수량', true)

    const userData = await getUserData(interaction.user.id)

    if (!interaction.channel) return interaction.editReply({ embeds: [errorMessage('채널 정보를 불러올 수 없습니다.')] })
    if (!target) {
        return await interaction.editReply({ embeds: [theTradeHasBeenCanceled(interaction.user, '유효하지 않은 아이디이거나 Seren 사용자가 아닙니다.')] })
    } else if (target.id === interaction.user.id) {
        return await interaction.editReply({ embeds: [theTradeHasBeenCanceled(interaction.user, '자기 자신에게는 보낼 수 없습니다.')] })
    } else if (!userData) {
        return await interaction.editReply({ embeds: [theTradeHasBeenCanceled(interaction.user, 'Seren 사용자가 아닙니다.')] })
    } else if (userData.point < amount) {
        return await interaction.editReply({ embeds: [theTradeHasBeenCanceled(interaction.user, '보유하고 있는 포인트가 부족합니다.')] })
    } else if (amount < 10) {
        return await interaction.editReply({ embeds: [theTradeHasBeenCanceled(interaction.user, '최소 10포인트 이상부터 전송 가능합니다.')] })
    }

    const tax = Math.round(amount * (1 / 10))
    const collector = interaction.channel.createMessageComponentCollector<ComponentType.Button>({
        max: 1,
        filter: i => i.user.id === interaction.user.id,
    })
    collector.on('collect', async i => {
        interaction.editReply({ embeds: [pleaseWait(i.user)], components: [] })
        if (i.customId === 'yes') {
            const tradeTime = new Date()
            try {
                await removeUserPoint(interaction.user.id, amount)
                await addUserPoint(target.id, amount - tax)
                await sendDM(target.id, { embeds: [youGotCoin(interaction.user, target.tag, amount - tax, target.point, tradeTime)] })
                interaction.editReply({ embeds: [tradeSuccess(i.user, target.tag, amount, userData.point, tax, tradeTime)] })
            } catch {
                interaction.editReply({ embeds: [theTradeHasBeenCanceled(i.user)] })
            }
        }
        else if (i.customId === 'no') {
            interaction.editReply({ embeds: [theTradeHasBeenCanceled(interaction.user, '거래가 취소되었습니다.')] })
        }
    })
    await interaction.editReply({ embeds: [areYouSure(interaction.user, target.tag, amount, tax)], components: [tradeQuestion()] })
}
