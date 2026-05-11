import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST (request: Request) {
    const { name, branch, id } = await request.json();
    const driver = await prisma.driver.create({
        data: {
            name,
            branch,
            id,
        },
    });
    return NextResponse.json(driver);
}