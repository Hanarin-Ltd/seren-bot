import { ChatInputCommandInteraction, CacheType, userMention, bold, GuildMember } from "discord.js"
import { BOT_COLOR } from "../lib"
import { getBanListFromSQL } from "../utils/ban"
import { getBlockwordList } from "../utils/blockword"
import { deferReply, getCurrentDate } from "../utils/default"
import { updateMemberCache, getThisGuild, isGuildModerator, sendDM } from "../utils/discord"
import { getModList } from "../utils/mod"
import { getWarningList } from "../utils/warning"

export default async function list(interaction: ChatInputCommandInteraction<CacheType>) {
    await deferReply(interaction)
    
    await updateMemberCache(interaction.guild!)

    const args = interaction.options
    const thisGuild = await getThisGuild(interaction)
    const content = args.getString('내용')!

    let dataList: any[] = []
    let dataListString: string = ''
    let dataName: string = ''
    let isDM: boolean = true
    let isModOnly: boolean = false

    if (content === 'mod') {
        dataName = '관리자'
        dataList = await getModList(thisGuild.id)
        dataListString = dataList.map(mod => {
            return userMention(mod.userId)
        }).join('\n-----\n')
        isDM = false
    }
    else if (content === 'blockword') {
        dataList = await getBlockwordList(thisGuild.id)
        if (dataList.length === 0) {
            dataListString = ':no_entry_sign: 금지어가 없습니다.'
        } else {
            dataListString = dataList.map(word => {
                return bold(word)
            }).join('\n-----\n')
        }
    } else if (content === 'warning') {
        dataName = '경고'
        const data = await getWarningList(thisGuild.id)
        if (data.length === 0) {
            dataListString = ':no_entry_sign: 경고를 받은 사용자가 없습니다'
        } else {
            dataListString = data.map(m => (`**${m.username} (${m.tag}) : ${m.warning}번**`)).join('\n')
        }
    } else if (content === 'ban') {
        dataName = '차단'
        const data = await getBanListFromSQL(thisGuild.id)
        if (data.length === 0) {
            dataListString = ':no_entry_sign: 차단당한 사용자가 없습니다'
        } else {
            dataListString = data.map(m => (`**${m.username} (${m.tag}) : ${getCurrentDate(m.createdAt)}**`)).join('\n')
        }
        isDM = true
    }

    if (isModOnly &&!isGuildModerator(thisGuild, interaction.member! as GuildMember)) {
        return await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 권한이 없습니다!' }] })
    }
    if (!isDM) return await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: `:scroll: ${dataName} 목록`, description: dataListString }] })

    try {
        await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':incoming_envelope: DM으로 리스트가 전송되었습니다!', description: 'DM을 확인해주세요.' }] })
        await sendDM(interaction.user.id, { embeds: [{ color: BOT_COLOR, title: `:scroll: ${dataName} 목록`, description: dataListString }] })
    } catch {
        await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: DM을 전송할 수 없습니다!' }] })
    }
}
