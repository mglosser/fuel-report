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

    console.log('\n\n\n\n', 'Record', record, '\n\n\n\n');

    if (!record) {
        return false;
    }
    return record.expires > new Date().getTime();
}