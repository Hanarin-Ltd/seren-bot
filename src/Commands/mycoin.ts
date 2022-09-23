import { UserCoinData } from "@prisma/client"
import { blockQuote, bold, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { BOT_COLOR } from "../lib"
import { getUserCoinData } from "../utils/coin"
import { getUserData } from "../utils/userData"

const coinEmbed = async (data: UserCoinData[], point: number) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':money_mouth: 내 코인')
        .addFields([{ name: '보유 포인트', value: blockQuote(bold(point.toString())), inline: true }])
        .addFields(
            data.length === 0 ?
                [{ name: '보유한 코인이 없습니다', value: '코인을 구매해보세요!' }] :
                data.map(d => ({ name: d.name, value: blockQuote(`${d.amount}개`)}))
        )
}

export default async function coinbuy(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()

    const userCoinData = await getUserCoinData(interaction.user.id)
    const userData = await getUserData(interaction.user.id)

    await interaction.editReply({ embeds: [await coinEmbed(userCoinData, userData.point)] })
}
