import prisma from "../prisma"

export const getUserData = async (userId: string) => {
    const result = await prisma.userData.findUnique({ where: { id: userId } })
    return result ? result : {}
}
