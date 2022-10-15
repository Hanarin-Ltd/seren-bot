import { ActionRowBuilder, blockQuote, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, User } from "discord.js"
import { BOT_COLOR } from "../lib"
import { completeSuccessfullyMessage } from "../utils/default"
import { addVote, getVoter, makeVote, updateVote } from "../utils/vote"

const voteModal = () => new ModalBuilder()
    .setTitle('투표 생성하기')
    .setCustomId('makeVote')

const voteTitleInput = new TextInputBuilder()
    .setLabel('투표 제목')
    .setPlaceholder('투표 제목을 입력해주세요.')
    .setMaxLength(50)
    .setMinLength(1)
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('1~50자')
    .setCustomId('voteTitle')

const voteDescriptionInput = new TextInputBuilder()
    .setLabel('투표 설명')
    .setPlaceholder('투표 설명을 입력해주세요.')
    .setMaxLength(300)
    .setMinLength(1)
    .setRequired(false)
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('1~300자')
    .setCustomId('voteDescription')

const voteOptionInput = new TextInputBuilder()
    .setLabel('투표 항목')
    .setPlaceholder('투표 항목을 입력해주세요.')
    .setMaxLength(1000)
    .setMinLength(1)
    .setRequired(true)
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('엔터로 항목을 구분합니다.')
    .setCustomId('voteOption')

const voteEmbed = (
    author: User, title: string, desc: string, options: string[], hideResult: boolean,
    value: number[] = Array(options.length).fill(0), isEnded: boolean = false
) => (
    new EmbedBuilder()
        .setColor(isEnded ? 'Red' : BOT_COLOR)
        .setTitle(title)
        .setDescription(desc.length > 0 ? desc : '설명이 없습니다.')
        .addFields(options.map((option, i) => (
            { name: `${i + 1}. **${option}**`, value: blockQuote(hideResult ? '???' : `${value[i]}표`), inline: true }
            )))
        .setTimestamp(new Date())
        .setAuthor({ iconURL: author.displayAvatarURL(), name: author.tag })
)

const voteButton = (id: string, options: string[]) => new ActionRowBuilder<ButtonBuilder>()
    .addComponents(options.map((option, i) => (
        new ButtonBuilder()
            .setLabel(option)
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`${id}-${i}`)
    )))

const voteEndButton = (id: string) => new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setLabel('투표 종료')
            .setStyle(ButtonStyle.Danger)
            .setCustomId(`${id}-end`)
    )

const voteResultEmbed = (title: string, desc: string, options: string[], value: number[]) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(`:ballot_box: ${title} 결과`)
    .setDescription(desc.length > 0 ? `투표 설명 : ${desc}` : '투표에 대한 설명이 없습니다.')
    .addFields(options.map((option, i) => (
        { name: `${i + 1}. **${option}**`, value: blockQuote(`${value[i]}표`), inline: true }
    )))

export default async function vote(interaction: ChatInputCommandInteraction) {
    const args = interaction.options
    const mentionEveryone = args.getBoolean('everyone')
    const hideResult = args.getBoolean('투표현황비공개')
    const onlyAdmin = args.getBoolean('결과비공개')
    const allowChange = args.getBoolean('선택변경') || true

    const modal = voteModal()
    const titleInput = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(voteTitleInput)
    const descriptionInput = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(voteDescriptionInput)
    const optionInput = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(voteOptionInput)
    modal.addComponents(titleInput, descriptionInput, optionInput)

    await interaction.showModal(modal)
    const isSubmit = await interaction.awaitModalSubmit({
        time: 60000,
        filter: i => i.user.id === interaction.user.id,
    })

    if (isSubmit) {
        isSubmit.reply({ embeds: [completeSuccessfullyMessage(isSubmit.user, '투표가 생성되었습니다')], ephemeral: true })
        const title = isSubmit.fields.getTextInputValue('voteTitle')
        const description = isSubmit.fields.getTextInputValue('voteDescription')
        const options = isSubmit.fields.getTextInputValue('voteOption').split('\n').filter(c => c !== '')
        const values = Array(options.length).fill(0)

        await makeVote(interaction.id, interaction.user.id, title, description, options, {
            mentionEveryone,
            hideResult,
            onlyAdmin,
            allowChange,
        })

        const collecter = interaction.channel?.createMessageComponentCollector({
            max: 1000000,
            time: 50000000,
        })

        const voteEmbedId = await interaction.channel?.send({
            content: mentionEveryone ? '@everyone' : '',
            embeds: [voteEmbed(interaction.user, title, description, options, hideResult ? true : onlyAdmin ? true: false)],
            components: [voteButton(interaction.id, options), voteEndButton(interaction.id)],
        })

        collecter?.on('collect', async i => {
            const targetId = i.customId.split('-')[0]
            const optionId = i.customId.split('-')[1]
            console.log(targetId, optionId, i.user.tag)

            if (optionId === 'end' && interaction.user.id === i.user.id) {
                ;(await interaction.channel?.messages?.fetch(voteEmbedId!.id))?.edit({
                    embeds: [voteEmbed(interaction.user, title, description, options, onlyAdmin ? true : false, values, true)],
                    components: [],
                })
                collecter?.stop()
                onlyAdmin && await interaction.user.send({ embeds: [voteResultEmbed(title, description, options, values)] })
            }
            else {
                const voter = await getVoter(targetId, i.user.id)
                if (voter && !allowChange) {
                    i.deferUpdate()
                    return
                } else if (voter) {
                    await updateVote(targetId, i.user.id, optionId)
                    values[parseInt(voter.value)]--
                }
                values[Number(optionId)] += 1
                await addVote(targetId, i.user.tag, i.user.id, optionId)
                ;(await interaction.channel?.messages?.fetch(voteEmbedId!.id))?.edit({
                    embeds: [voteEmbed(interaction.user, title, description, options, hideResult ? true : onlyAdmin ? true: false, values)],
                })
                i.deferUpdate()
            }
        })
    }
}
