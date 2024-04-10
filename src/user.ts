import {PrismaClient, User} from "@prisma/client";
import {getBankIdFromResoniteUserId} from "./auth";


export async function getUserByResoniteUserId(prisma: PrismaClient, resoniteUserId: string): Promise<User & {furos: any[], sleeps: any[]}> {
    const userId = await getBankIdFromResoniteUserId(resoniteUserId)
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            furos: true,
            sleeps: true,
        }
    })
    if(user) {
        return user
    }

    // ユーザがいない時は、ユーザを作って返す
    return prisma.user.create({
        data: {
            id: userId
        },
        select: {
            furos: true,
            sleeps: true,
        }
    });
}