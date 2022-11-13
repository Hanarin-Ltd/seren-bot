import { blockQuote, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { BOT_COLOR } from "../lib"
import { addCoinComment, getCoinDataAsName } from "../utils/coin"
import { errorMessage } from "../utils/default"

const youCommentedCoin = (name: string, content: string) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':white_check_mark: 성공적으로 댓글을 달았습니다!')
    .setFields([
        { name: '코인 이름', value:  blockQuote(name) },
        { name: '댓글 내용', value: blockQuote(content) }
    ])

const coinNotFound = (name: string) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':grey_question: 코인을 찾을 수 없습니다!')
    .setDescription(`\`${name}\`라는 이름의 코인을 찾을 수 없습니다. 오타를 확인해주세요.`)

export default async function coincomment(interaction: ChatInputCommandInteraction) {
    const args = interaction.options
    const coinName = args.getString('이름')!
    const content = args.getString('댓글')!

    const coinData = (await getCoinDataAsName(coinName))!

    try {
        const result = await addCoinComment(coinData.id, interaction.user.id, content)
        if (result.error) return await interaction.editReply({ embeds: [errorMessage(result.error)] })
        if (result) return await interaction.editReply({ embeds: [youCommentedCoin(coinName, content)] })
        else return await interaction.editReply({ embeds: [coinNotFound(coinName)] })
    } catch (e) {
        console.log(e)
        await interaction.editReply({ embeds: [errorMessage()] })
    }
}
