import * as net from 'net'
import { client as botClient } from './index'
import prisma from './prisma'
import { updateBanListCache } from './utils/ban'
import { getMember } from './utils/discord'

type Responce = {
    guildId: string,
    changed: string[]
}

const server = net.createServer(client => {
    client.setDefaultEncoding('utf8')
    client.setEncoding('utf8')
    client.setNoDelay(true)
    client.setTimeout(10000)

    client.on('data', async (recv) => {
        const { guildId, changed }: Responce = JSON.parse(recv.toString())
        console.log(guildId, changed)

        if (changed.includes('mod')) {
            //const newModList = await prisma.memberData.findMany({ where: { guildId, mod: true } })
        }

        if (changed.includes('ban')) {
            console.log('ban included')
            // 이미 Prisma에는 차단 유저가 바뀌어 있음
            // client에서 직접 차단 리스트를 가져와서 Prisma에 있는 값하고 비교
            const newBanList = (await prisma.guildBan.findMany({ where: { guildId } })).map(b => b.userId)
            const guild = (botClient.guilds.cache.get(guildId))!
            console.log(newBanList, guild.name)
            await updateBanListCache(guild)

            const oldBanList = guild.bans.cache

            oldBanList.forEach(async b => {
                console.log(b.user.username)
                if (newBanList.includes(b.user.id)) return
                await prisma.guildBan.deleteMany({ where: { guildId, userId: b.user.id } })

                await guild.members.unban(b.user.id)
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
