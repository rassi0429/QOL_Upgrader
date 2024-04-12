
export async function sendZouCoin(receiverId: string, amount: number, memo?: string) {
    const result = await fetch(
        "https://zoubank.resonite.love/api/transaction",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.ZOUBANK_API_TOKEN
            },
            body: JSON.stringify({
                recipientId: receiverId,
                amount: amount,
                memo: memo ?? ""
            })
        }
    )
    return await result.json()
}