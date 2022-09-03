import * as net from 'net'
import { client as botClient } from './index'
import prisma from './prisma'
import { updateBanListCache } from './utils/ban'
import { getMember } from './utils/discord'

type Responce = {
    guildId: string,
    changed: string[],
    data: any
}

const server = net.createServer(client => {
    client.setDefaultEncoding('utf8')
    client.setEncoding('utf8')
    client.setNoDelay(true)
    client.setTimeout(10000)

    client.on('data', async (recv) => {
        const { guildId, changed, data }: Responce = JSON.parse(recv.toString())
        console.log(guildId, changed, data)

        if (changed.includes('mod')) {
            //const newModList = await prisma.memberData.findMany({ where: { guildId, mod: true } })
        }

        if (changed.includes('ban')) {
            // 이미 Prisma에는 차단 유저가 바뀌어 있음
            // client에서 직접 차단 리스트를 가져와서 Prisma에 있는 값하고 비교
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
