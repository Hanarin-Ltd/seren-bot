import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import { client as botClient, env } from './index'
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

const API_PORT = env.NODE_ENV === 'production' ? 7321 : 5868 as const

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
            const modRoleList = (await getGuildModRole(guild)).map(r => r.id)
            target?.roles.cache.forEach(async role => {
                if (modRoleList.includes(role.id)) await target?.roles.remove(role)
            })
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
    app.listen(API_PORT, () => console.log(`Dashboard API Server is Opened`))
}
