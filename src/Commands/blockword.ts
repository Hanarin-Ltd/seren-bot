import { ChatInputCommandInteraction, CacheType, Message, EmbedBuilder, GuildMember } from "discord.js"
import { compareTwoStrings } from "string-similarity"
import { BOT_COLOR, FILTERING_MESSAGE_TYPE } from "../lib"
import { checkIsBlockword, addBlockword, removeBlockword, getBlockwordList } from "../utils/blockWord"
import { noPermissionMessage } from "../utils/default"
import { getThisGuild, updateMemberCache, isGuildModerator } from "../utils/discord"
import { getGuildData } from "../utils/guildData"
import { getGuildOption } from "../utils/guildOption"
import { giveWarning } from "../utils/warning"

export default async function blockword(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply()
    
    const args = interaction.options
    const thisGuild = await getThisGuild(interaction)
    const guildId = thisGuild.id
    const word = args.getString('금지어')!

    await updateMemberCache(thisGuild)

    if (!await isGuildModerator(thisGuild, interaction.member! as GuildMember)) {
        await interaction.editReply({ embeds: [noPermissionMessage()] })
        return
    }

    if (args.getString('설정') === 'add') {
        if (await checkIsBlockword(guildId, word)) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 이미 등록된 금지어입니다.' }] })
            return
        }
        
        await addBlockword(guildId, word)
    }
    else if (args.getString('설정') === 'remove') {
        if (!await checkIsBlockword(guildId, word)) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 등록된 금지어가 아닙니다.' }] })
            return
        }

        await removeBlockword(guildId, word)
    }

    await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':white_check_mark: 성공적으로 처리되었습니다.' }] })
}

const youUsedBlockword = (word: string[]) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':no_entry: 금지어를 사용하셨습니다.')
        .setDescription('경고가 추가됐습니다. 경고 10번시 서버에서 차단됩니다.')
        .addFields(
            { name: '사용한 금지어', 'value': word.join(', ') }
        )
}

export const scanMessage = async (message: Message) => {
    if (!FILTERING_MESSAGE_TYPE.includes(message.type)) return
    if (message.content.length < 1) return
    if (!message.channelId || !message.guildId) return

    const option = (await getGuildOption(message.guildId))!
    if (!option.checkModsMessage) {
        if (await isGuildModerator(message.guild!, message.author as unknown as GuildMember)) return
    }

    const data = await getGuildData(message.guildId)
    if (!data) return
    if (!data.isCommunityGuild) return

    const guild = message.guild!
    const guildId = guild.id
    const blockwordList = await getBlockwordList(guildId)
    const catchedWordList: string[] = []

    blockwordList.forEach(blockword => {
        if (message.content.toLowerCase().includes(blockword.toLowerCase())) {
            catchedWordList.push(blockword)
            return
        }

        message.content.toLowerCase().split(' ').forEach(word => {
            if (compareTwoStrings(word, blockword) > 0.8) {
                catchedWordList.push(blockword)
                return
            }
        })
    })

    if (catchedWordList.length > 0) {
        await message.delete()
        await message.author.send({ embeds: [youUsedBlockword(catchedWordList)] })
        await giveWarning(guildId, message.member!)
    }
}
