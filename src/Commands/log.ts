import { ChatInputCommandInteraction, EmbedBuilder, Guild } from "discord.js"
import { BOT_COLOR } from "../lib"
import { completeSuccessfullyMessage, deferReply } from "../utils/default"
import { getThisGuild } from "../utils/discord"
import { getGuildLogSetting, modifyGuildLogSetting } from "../utils/log"

const setToOff = async (type: string, logSetting: any, guildId: string) => {
    const data = logSetting[type]
    if (!data) return false
    logSetting[type] = false
    await modifyGuildLogSetting(guildId, logSetting)

    return true
}
const setToOn = async (type: string, logSetting: any, guildId: string) => {
    const data = logSetting[type]
    if (data) return false
    logSetting[type] = true
    await modifyGuildLogSetting(guildId, logSetting)
    
    return true
}

const sameValue = (on: boolean) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(`:warning: 이미 ${on ? '활성화' : '비활성화'}된 로그 종류입니다.`)
}

export default async function log(interaction: ChatInputCommandInteraction) {
    await deferReply(interaction)

    const args = interaction.options
    const thisGuild = await getThisGuild(interaction)
    const guildId = thisGuild.id
    const setting = args.getString('설정')!
    const type = args.getString('종류')!

    const logSetting = (await getGuildLogSetting(guildId))!
    let result: boolean = true

    if (setting === 'on') {
        if (type !== 'all') result = await setToOn(type, logSetting, guildId)
        else result = true
    }
    else {
        if (type !== 'all') result = await setToOff(type, logSetting, guildId)
        else result = true
    }
    return result ?
        await interaction.editReply({ embeds: [completeSuccessfullyMessage()] }) :
        await interaction.editReply({ embeds: [sameValue(setting === 'on')] })
}
