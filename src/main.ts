import express from 'express'
import cors from 'cors'

import {PrismaClient} from "@prisma/client";
import {getBankIdFromResoniteUserId} from "./auth";
const prisma = new PrismaClient()

const app = express()
app.use(cors())

app.get('/user/furo/:resoniteUserId', async (req, res) => {
    const resoniteUserId = req.params.resoniteUserId
    const userId = await getBankIdFromResoniteUserId(resoniteUserId)
    const furoData = await prisma.furo.findMany({
        where: {
            userId: userId
        }
    })
    res.json(furoData)
})


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})