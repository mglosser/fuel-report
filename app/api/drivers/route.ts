import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST (request: Request) {
    const { name, id } = await request.json();
    const driver = await prisma.driver.create({
        data: {
            name,
            id,
        },
    });
    return NextResponse.json(driver);
}