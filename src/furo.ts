import {PrismaClient} from "@prisma/client";

export async function getFuroDataByUserId(prisma: PrismaClient, userId: string): Promise<Array<any>> {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if(!user) {
        console.log("No user found", userId)
        return []
    }

    const furoData = await prisma.furo.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            time: 'desc'
        }
    })
    return furoData
}