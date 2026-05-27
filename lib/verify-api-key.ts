import { prisma } from "./prisma";
import * as crypto from 'crypto';

export const verifyApiKey = async (apiKey: string): Promise<boolean> => {

    if (!apiKey) {
        return false;
    }

    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const record = await prisma.apiKeys.findUnique({
        where: {
            id: hash,
            active: true,
        },
        select: {
            id: true,
            expires: true,
        }
    });

    if (!record) {
        return false;
    }
    return record.expires > new Date().getTime();
}