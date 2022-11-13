import { Guild } from "discord.js"
import { client } from ".."
import prisma from "../prisma"
import { getBannedGuildList } from "./ban"
import { getGuildListThatUserMod } from "./mod"
import { updateTodayStatistics } from "./statistics"

export const getUserData = async (userId: string) => {
    return await prisma.userData.findUnique({ where: { id: userId } })
}

export const getUserDataPlanList = async (plan: SerenPlan) => {
    const data = await prisma.userData.findMany({ where: { currentPlan: plan } })
    return data.map(d => d.id)
}

export const getAllUserIdList = async () => {
    const data = await prisma.userData.findMany()
    return data.map(d => d.id)
}

export const addUserData = async (userId: string) => {
    const user = await client.users.fetch(userId)
    if (user.bot) return
    const exist = await prisma.userData.findUnique({ where: { id: user.id } })
    if (exist) return
    return await prisma.userData.create({
        data: {
            id: user.id,
            username: user.username,
            tag: user.tag,
            profileImg: user.displayAvatarURL(),
            bannedGuild: await getBannedGuildList(userId),
            ownedGuild: (await getOwnedGuildList(userId)).map(g => g.guildId),
            modGuild: await getGuildListThatUserMod(userId),
            createdAt: user.createdAt
        }
    })
}

export const addGuildAllUserData = async (guild: Guild) => {
    const users = await guild.members.fetch()
    for (const user of users.values()) {
        await addUserData(user.id)
    }
}

export const addUserModGuild = async (userId: string, guildId: string) => {
    const user = await getUserData(userId)
    if (!user) return
    return await prisma.userData.update({
        where: { id: userId },
        data: {
            modGuild: [...user.modGuild, guildId]
        }
    })
}

export const removeUserModGuild = async (userId: string, guildId: string) => {
    const user = await getUserData(userId)
    if (!user) return
    return await prisma.userData.update({
        where: { id: userId },
        data: {
            modGuild: user.modGuild.filter(g => g !== guildId)
        }
    })
}

export const addUserPoint = async (userId: string, point: number) => {
    const userData = await getUserData(userId)
    if (!userData) return
    await prisma.userData.update({
        where: { id: userId },
        data: { point: userData.point + point }
    })
    updateTodayStatistics('todayUsedPoint', prev => prev + point)
}

export const removeUserPoint = async (userId: string, point: number) => {
    const userData = await getUserData(userId)
    if (!userData) return
    await prisma.userData.update({
        where: { id: userId },
        data: { point: userData.point - point }
    })
    updateTodayStatistics('todayUsedPoint', prev => prev + point)
}

export const getOwnedGuildList = async (userId: string) => {
    const result = await prisma.guildData.findMany({ where: { ownerId: userId } })
    return result
}

export const setUserGambleCount = async (userId: string, count: number) => {
    const userData = await getUserData(userId)
    if (!userData) return
    await prisma.userData.update({
        where: { id: userId },
        data: { gambleCount: count }
    })
}
