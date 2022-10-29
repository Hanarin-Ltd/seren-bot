import { ActionRowBuilder, blockQuote, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextBasedChannel, TextInputBuilder, TextInputStyle, User } from "discord.js"
import { BOT_COLOR } from "../lib"
import { chunkArray, completeSuccessfullyMessage, deferReply, errorMessage } from "../utils/default"
import { addVote, getVoter, makeVote, removeVote, updateVote } from "../utils/vote"

const makeVoteButton = (disabled: boolean = false) => new ActionRowBuilder<ButtonBuilder>()
.addComponents(
    new ButtonBuilder()
        .setEmoji('🗳️')
        .setLabel('투표 생성하기')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('makeVote')
        .setDisabled(disabled)
)

const voteModal = () => new ModalBuilder()
    .setTitle('투표 생성하기')
    .setCustomId('submitVote')

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
    .setPlaceholder('투표 항목을 입력해주세요. (최대 10개)')
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

const voteButton = (id: string, options: string[], idGenerator: (i: number) => string) => new ActionRowBuilder<ButtonBuilder>()
    .addComponents(options.map((option, i) => (
        new ButtonBuilder()
            .setLabel(option)
            .setStyle(ButtonStyle.Primary)
            .setCustomId(idGenerator(i))
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
    await deferReply(interaction)

    const args = interaction.options
    const mentionEveryone = args.getBoolean('everyone') || false
    const hideResult = args.getBoolean('투표현황비공개') || false
    const onlyAdmin = args.getBoolean('결과비공개') || false
    const allowChange = args.getBoolean('선택변경') === null ? true : args.getBoolean('선택변경')! // default true

    const collecter = interaction.channel?.createMessageComponentCollector<ComponentType.Button>({
        time: 100000,
        filter: i => i.user.id === interaction.user.id,
    })

    collecter?.on('collect', async i => {
        if (i.customId !== 'makeVote') return
        const modal = voteModal()
        const titleInput = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(voteTitleInput)
        const descriptionInput = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(voteDescriptionInput)
        const optionInput = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(voteOptionInput)
        modal.addComponents(titleInput, descriptionInput, optionInput)

        await i.showModal(modal)
        const isSubmit = await i.awaitModalSubmit({
            time: 60000,
            filter: i => i.user.id === i.user.id,
        })

        if (!isSubmit) return
        await generateVote(isSubmit, isSubmit.user, {
            mentionEveryone, hideResult, onlyAdmin, allowChange,
        }, isSubmit.channel)
        await interaction.editReply({ components: [makeVoteButton(true)] })
        collecter.stop()
    })

    return await interaction.editReply({ components: [makeVoteButton()] })
}

const generateVote = async (
    modalInteraction: ModalSubmitInteraction, author: User, setting: {
        mentionEveryone: boolean, hideResult: boolean, onlyAdmin: boolean, allowChange: boolean
    },
    channel: TextBasedChannel | null
    ) => {
    const title = modalInteraction.fields.getTextInputValue('voteTitle')
    const description = modalInteraction.fields.getTextInputValue('voteDescription')
    const voteOptions = modalInteraction.fields.getTextInputValue('voteOption').split('\n').filter(c => c !== '')
    const values = Array(voteOptions.length).fill(0)
    const { mentionEveryone, hideResult, onlyAdmin, allowChange } = setting

    if (voteOptions.length < 2) {
        return modalInteraction.reply({ embeds: [errorMessage('투표 항목은 최소 2개 이상이어야 합니다.')] })
    } else if (voteOptions.length > 10) {
        return modalInteraction.reply({ embeds: [errorMessage('투표 항목은 최대 10개까지만 가능합니다.')] })
    }
    await modalInteraction.reply({ embeds: [completeSuccessfullyMessage(modalInteraction.user, '투표가 생성되었습니다.')]})

    await makeVote(modalInteraction.id, author.id, title, description, voteOptions, setting)

    const collecter = channel?.createMessageComponentCollector<ComponentType.Button>({
        max: 1000000,
        time: 50000000,
    })

    const voteEmbedId = await channel?.send({
        content: mentionEveryone ? '@everyone' : '',
        embeds: [voteEmbed(author, title, description, voteOptions, hideResult ? true : onlyAdmin ? true: false)],
        components: voteOptions.length > 5 ?
            [...chunkArray(voteOptions, 2).map((option, index) => (voteButton(author.id, option, i => `${author.id}-${index === 0 ? i : i+5}`))), voteEndButton(author.id)] :
            [voteButton(author.id, voteOptions, i => `${author.id}-${i}`), voteEndButton(author.id)],
    })

    collecter?.on('collect', async i => {
        const targetId = i.customId.split('-')[0]
        const optionId = i.customId.split('-')[1]
        console.log(targetId, optionId, i.user.tag)

        if (optionId === 'end' && author.id === i.user.id) {
            ;(await channel?.messages?.fetch(voteEmbedId!.id))?.edit({
                embeds: [voteEmbed(author, title, description, voteOptions, onlyAdmin ? true : false, values, true)],
                components: [],
            })
            collecter?.stop()
            await removeVote(modalInteraction.id)
            onlyAdmin && await author.send({ embeds: [voteResultEmbed(title, description, voteOptions, values)] })
        }
        else {
            const voter = await getVoter(targetId, i.user.id)
            if (voter && !allowChange) {
                i.deferUpdate()
                return
            } else if (voter && allowChange) {
                await updateVote(targetId, i.user.id, optionId)
                values[parseInt(voter.value)]--
            }
            values[Number(optionId)] += 1
            await addVote(targetId, i.user.tag, i.user.id, optionId)
            ;(await channel?.messages?.fetch(voteEmbedId!.id))?.edit({
                embeds: [voteEmbed(author, title, description, voteOptions, hideResult ? true : onlyAdmin ? true: false, values)],
            })
            i.deferUpdate()
        }
    })
}

