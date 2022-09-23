import { UserData } from "@prisma/client"
import prisma from "../prisma"

export const getUserData = async (userId: string) => {
    const result = await prisma.userData.findUnique({ where: { id: userId } })
    return result ? result : {} as UserData
}

export const addUserPoint = async (userId: string, point: number) => {
    const userData = await getUserData(userId)
    return await prisma.userData.update({
        where: { id: userId },
        data: { point: userData.point + point }
    })
}

export const removeUserPoint = async (userId: string, point: number) => {
    const userData = await getUserData(userId)
    return await prisma.userData.update({
        where: { id: userId },
        data: { point: userData.point - point }
    })
}
