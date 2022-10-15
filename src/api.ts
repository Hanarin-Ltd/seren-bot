import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import { client as botClient } from './index'
import prisma from './prisma'
import { GuildAllData } from './types/api'
import { getBanListFromSQL, updateBanListCache } from './utils/ban'
import { getMember, updateMemberCache } from './utils/discord'
import { getModList, updateGuildMod } from './utils/mod'
import { getGuildModRole } from './utils/role'

type DashboardResponce = {
    guildId: string,
    data: GuildAllData
}

const app = express()
app.use(bodyParser.json())

app.post('/guild', async (req: Request, res: Response) => {
    const { guildId, data }: DashboardResponce = req.body
    // client에서 직접 차단 리스트를 가져와서 data하고 비교

    const modList = await getModList(guildId)
    const banList = await getBanListFromSQL(guildId)

    if (data.mod.length !== modList.length) {
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

    if (banList.length !== data.ban.length) {
        const newBanList = data.ban.map((b: { userId: string }) => b.userId)
        const guild = (botClient.guilds.cache.get(guildId))!
        await updateBanListCache(guild)

        const oldBanList = guild.bans.cache.map(b => b.user.id)

        oldBanList.forEach(async id => {
            if (newBanList.includes(id)) return
            await guild.members.unban(id)
        })
    }

    res.send({ success: true })
})

export default function openAPIServer() {
    app.listen(7321, () => console.log(`Dashboard API Server is Opened`))
}
