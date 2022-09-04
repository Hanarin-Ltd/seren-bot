import { EmbedBuilder, Guild, spoiler } from "discord.js"
import { env } from '.'
import { BOT_COLOR } from "./lib"
import { setDefaultBlockword } from "./utils/blockWord"
import { addAllGuildChannel } from "./utils/channel"
import { getGuildOwner } from "./utils/discord"
import { addOrUpdateGuildData } from "./utils/guildData"
import { setDefaultGuildOption } from "./utils/guildOption"
import { addGuildLogSetting } from "./utils/log"
import { setDefaultGuildPermission } from "./utils/permission"
import { addAllGuildRole } from "./utils/role"

const thanksForUsing = (guildId: string) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':wave: Seren을 선택해주셔서 감사합니다!')
        .setURL(`${env.SITE}/dashboard/${guildId}`)
        .setDescription('**사용해주셔서 감사합니다!**\nSeren을 사용하기전 기본적인 설정이 필요합니다. 링크로 들어가 로그인 한뒤 설정을 해주세요.\n이 설정은 웹 대시보드에서 변경할 수 있습니다.')
}

export default async function guildSetting(guild: Guild) {
    const guildId = guild.id
    await addOrUpdateGuildData(guild)
    await setDefaultGuildOption(guildId)
    await setDefaultGuildPermission(guildId)
    await setDefaultBlockword(guildId)
    await addAllGuildChannel(guild)
    await addAllGuildRole(guild)
    await addGuildLogSetting(guild.id)

    await (await getGuildOwner(guild)).send({ embeds: [thanksForUsing(guildId)] })
}
