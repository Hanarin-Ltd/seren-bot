import { UserData } from "@prisma/client"
import { client } from ".."
import prisma from "../prisma"
import { getBannedGuildList } from "./ban"

export const getUserData = async (userId: string): Promise<UserData> => {
    const result = await prisma.userData.findUnique({ where: { id: userId } })
    if (!result) await addUserData(userId)
    return result ? result : await getUserData(userId)
}

export const addUserData = async (userId: string) => {
    const user = await client.users.fetch(userId)
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
            createdAt: user.createdAt
        }
    })
}

export const addUserPoint = async (userId: string, point: number) => {
    const userData = await getUserData(userId)
    await prisma.userData.update({
        where: { id: userId },
        data: { point: userData.point + point }
    })
}

export const removeUserPoint = async (userId: string, point: number) => {
    const userData = await getUserData(userId)
    await prisma.userData.update({
        where: { id: userId },
        data: { point: userData.point - point }
    })
}

export const getOwnedGuildList = async (userId: string) => {
    const result = await prisma.guildData.findMany({ where: { ownerId: userId } })
    return result
}
