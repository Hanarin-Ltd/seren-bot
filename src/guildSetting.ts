import { EmbedBuilder, Guild, spoiler } from "discord.js"
import { addOrUpdateGuildData, appendAccount, BOT_COLOR, getGuildOwner, makeRandomString, addAllGuildChannel, setDefaultBlockword, setDefaultGuildOption, setDefaultGuildPermission, addAllGuildRole } from "./lib"
import { env } from '.'
import { Account } from "@prisma/client"

const generateAccount = async (guild: Guild): Promise<Account> => {
    const owner = await getGuildOwner(guild)
    return {
        userId: owner.id,
        guildId: guild.id,
        password: makeRandomString(15),
        username: owner.user.username,
        tag: owner.user.tag
    }
}

const thanksForUsing = (account: Account) => {
    return new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':wave: Seren을 선택해주셔서 감사합니다!')
    .setURL(env.SITE+'/login')
    .setDescription('**사용해주셔서 감사합니다!**\nSeren을 사용하기전 기본적인 설정이 필요합니다. 링크로 들어가 로그인 한뒤 설정을 해주세요.\n이 설정은 웹 대시보드에서 변경할 수 있습니다.')
    .addFields(
        { name: '아이디', value: account.guildId, inline: true },
        { name: '비밀번호', value: spoiler(account.password), inline: true }
    )
}

export default async function guildSetting(guild: Guild) {
    const account = await generateAccount(guild)
    const guildId = guild.id
    await appendAccount(account)
    await addOrUpdateGuildData(guild)
    await setDefaultGuildOption(guildId)
    await setDefaultGuildPermission(guildId)
    await setDefaultBlockword(guildId)
    await addAllGuildChannel(guild)
    await addAllGuildRole(guild)

    await (await getGuildOwner(guild)).send({ embeds: [thanksForUsing(account)] })
}
