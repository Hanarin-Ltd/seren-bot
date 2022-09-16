import * as net from 'net'
import { client as botClient } from './index'
import prisma from './prisma'
import { updateBanListCache } from './utils/ban'
import { getMember, updateMemberCache } from './utils/discord'
import { removeMod, updateGuildMod } from './utils/mod'
import { getGuildModRole } from './utils/role'

type GuildAllData = {
    guildId: string
    name: string
    createdAt?: Date
    isCommunityGuild: boolean
    isSettingComplete: boolean

    owner: {
        username: string
        userId: string
    }

    permission: {
        collectBlockword: boolean
        collectBan: boolean
    }

    option: {
        banChannelId: string
        banMessageEnabled: boolean

        unbanChannelId: string
        unbanMessageEnabled: boolean

        welcomeChannelId: string
        welcomeMessage: string
        welcomeMessageEnabled: boolean

        goodbyeChannelId: string
        goodbyeMessage: string
        goodbyeMessageEnabled: boolean

        logChannelId: string
        logEnabled: boolean

        checkModsMessage: boolean
    }

    channel: {
        channelId: string
        channelName: string
        channelType: number
    }[]

    mod: GuildMemberData[]

    blockWord: string[]
    ban: GuildMemberData[]
    mentionBlock: GuildMemberData[]
    role: {
        id: string
        name: string
        type: string
    }[]

    changedData: string[]

    isLogin: boolean
    loadError: boolean
    isOwner: boolean

    [key: string]: any
}

type GuildMemberData = {
    userId: string
    username: string
    nickname: string
    tag: string
    profileImg: string
}

type Responce = {
    guildId: string,
    changed: string[],
    data: GuildAllData
}

const server = net.createServer(client => {
    client.setDefaultEncoding('utf8')
    client.setEncoding('utf8')
    client.setNoDelay(true)
    client.setTimeout(10000)

    client.on('data', async (recv) => {
        const { guildId, changed, data }: Responce = JSON.parse(recv.toString())

        // client에서 직접 차단 리스트를 가져와서 data하고 비교

        if (changed.includes('mod')) {
            const newModList = data.mod.map(m => m.userId)
            const guild = (botClient.guilds.cache.get(guildId))!
            await updateMemberCache(guild)

            const oldModList = (await prisma.memberData.findMany({ where: { guildId, mod: true } })).map(m => m.userId)

            oldModList.forEach(async id => {
                if (newModList.includes(id)) return
                const target = await getMember(guild, id)
                target!.roles.remove((await getGuildModRole(guild))!.id)
            })
            updateGuildMod(guildId, data)
        }

        if (changed.includes('ban')) {
            const newBanList = data.ban.map((b: { userId: string }) => b.userId)
            const guild = (botClient.guilds.cache.get(guildId))!
            await updateBanListCache(guild)

            const oldBanList = guild.bans.cache.map(b => b.user.id)

            oldBanList.forEach(async id => {
                if (newBanList.includes(id)) return
                await guild.members.unban(id)
            })
        }

        if (changed.includes('mentionBlock')) {
        }
    })

})

export default function openSocketServer() {
    server.listen(7321, () => {
        console.log(`Socket Server is Opened`)
    })
}
