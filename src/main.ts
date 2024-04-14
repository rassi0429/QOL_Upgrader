import express from 'express'
import cors from 'cors'

import {PrismaClient} from "@prisma/client";
import {getBankIdFromResoniteUserId} from "./lib/auth";
import {calcZouCoin, doFuro, Furo_Result} from "./furo";
import {getUserByResoniteUserId} from "./user";

const prisma = new PrismaClient()

const app = express()
app.use(cors())

app.get('/user/furo/:resoniteUserId', async (req, res) => {
    const resoniteUserId = req.params.resoniteUserId
    const userId = await getBankIdFromResoniteUserId(resoniteUserId)
    if(!userId) {
        res.status(404).json({error: "User not found"})
        return
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

    res.json({
        ...user,
        currentReward: furoData.length === 0 ? 200 : calcZouCoin(new Date().getTime() - furoData[0].time.getTime()),
        furoData: furoData
    })

})

app.post('/user/furo/:resoniteUserId', async (req, res) => {
    const result = await doFuro(prisma, req.params.resoniteUserId)
    if(result.result === Furo_Result.SUCCESS_FIRST_TIME) {
        res.json({message: "First time furo", reward: result.reward})
    }
    else if(result.result === Furo_Result.SUCCESS) {
        res.json({message: "Furo", reward: result.reward, span: result.span})
    } else {
        res.status(500).json({error: "Unknown error"})
    }
})


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})