import { Guild, GuildMember } from "discord.js"
import prisma from "../prisma"
import { removeWarning, resetWarning } from "./warning"

export const updateBanListCache = async (guild: Guild) => {
    await guild.bans.fetch().catch(err => { return })
}

export const getBanListFromSQL = async (guildId: string) => {
    const result = await prisma.guildBan.findMany({ where: { guildId } })
    return result
}

export const getBanListFromAPI = async (guild: Guild) => {
    await updateBanListCache(guild)
    return guild.bans.cache
}

export const getBannedGuildList = async (userId: string) => {
    const result = await prisma.userData.findUnique({ where: { id: userId } })
    return result ? result.bannedGuild : []
}

export const addBan = async (guildId: string, member: GuildMember, reason?: string | null) => {
    const exist = await prisma.guildBan.findFirst({ where: { guildId, userId: member.user.id } })
    if (exist) return
    await prisma.guildBan.create({
        data: {
            userId: member.id,
            guildId,
            username: member.user.username,
            nickname: member.nickname ? member.nickname : member.user.username,
            tag: member.user.tag,
            profileImg: member.displayAvatarURL(),
            reason: reason || '공개하지 않음'
        }
    })

    const list =  [...await getBannedGuildList(member.user.id), guildId]
    await prisma.userData.upsert({
        where: { id: member.user.id },
        update: { bannedGuild: list },
        create: {
            id: member.id,
            username: member.user.username,
            tag: member.user.tag,
            profileImg: member.displayAvatarURL(),
            bannedGuild: list,
            createdAt: member.user.createdAt
        }
    })

    return await resetWarning(guildId, member.id)
}

export const removeBan = async (guildId: string, userId: string) => {
    await prisma.guildBan.deleteMany({ where: { guildId, userId } })

    const bannedGuild = await getBannedGuildList(userId)
    if (!bannedGuild.includes(guildId)) return
    bannedGuild.splice(bannedGuild.indexOf(guildId), 1)
    
    await prisma.userData.update({
        where: { id: userId },
        data: { bannedGuild: bannedGuild }
    })
    return await resetWarning(guildId, userId)
}
