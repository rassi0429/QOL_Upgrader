import {PrismaClient} from "@prisma/client";
import {getBankIdFromResoniteUserId} from "./lib/auth";
import {sendZouCoin} from "./lib/bank";
import {getUserByResoniteUserId} from "./user";

export async function getFuroDataByUserId(prisma: PrismaClient, userId: string): Promise<Array<any>> {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if (!user) {
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

export async function doFuro(prisma: PrismaClient, resoniteUserId: string): Promise<{result: Furo_Result, reward?: number, span?: number}> {
    const userId = await getBankIdFromResoniteUserId(resoniteUserId)
    if (!userId) {
        return {
            result: Furo_Result.UNKNOWN_ERROR,
            reward: 0
        }
    }
    const user = await getUserByResoniteUserId(prisma, resoniteUserId)
    const furoData = await prisma.furo.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            time: 'desc'
        }
    })

    const time = new Date()

    if (furoData.length === 0) {
        const createResult = await prisma.furo.create({
            data: {
                user:{
                    connect: {id: userId}
                },
                time: time
            }
        })
        const reward = 20
        const coinResult = await sendZouCoin(userId, reward, "お風呂に入った報酬", {furoId: createResult.id})
        return {
            result: Furo_Result.SUCCESS_FIRST_TIME,
            reward: reward
        }
    }


    const createResult = await prisma.furo.create({
        data: {
            userId: userId,
            time: time,
        }
    })
    const span = time.getTime() - furoData[0].time.getTime()
    const reward = calcZouCoin(span)
    if(reward !== 0) {
        const coinResult = await sendZouCoin(userId, reward, "お風呂に入った報酬", {furoId: createResult.id})
        return {
            result: Furo_Result.SUCCESS,
            reward: reward,
            span: span
        }
    } else {
        return {
            result: Furo_Result.SUCCESS,
            reward: 0,
            span: span
        }
    
    }
}

export function calcZouCoin(time: number): number {
    const hour = Math.ceil(time / (1000 * 60 * 60))
    if (0 <= hour && hour < 6) {
        return 0
    } else if (6 <= hour && hour < 18) {
        return 75
    } else if (18 <= hour && hour < 36) {
        return 100
    } else {
        return 25
    }
}

export enum Furo_Result {
    SUCCESS,
    SUCCESS_FIRST_TIME,
    UNKNOWN_ERROR
}
