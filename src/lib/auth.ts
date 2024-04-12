

export async function getBankIdFromResoniteUserId(userId: string): Promise<string> {
    const result = await fetch(`https://zoubank.resonite.love/api/user/${userId}`)
    const data = await result.json()
    return data.id as string
}