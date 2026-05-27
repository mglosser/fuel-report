import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const transaction = await prisma.$transaction(async (tx) => {
        await tx.vehicle.deleteMany();
        await tx.vehicleType.deleteMany();
        await tx.driver.deleteMany();
        await tx.fuelStop.deleteMany();
    });
    } catch (error) {
        return NextResponse.json({ error: "Failed to clear database: " + (error as Error).message }, { status: 500 });
    }

    return NextResponse.json({ message: "Database cleared successfully" }, { status: 200 });
}