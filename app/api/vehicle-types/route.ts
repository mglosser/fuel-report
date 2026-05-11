import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/verify-api-key";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function POST(request: Request) {
  const { id, name } = await request.json();


  try {

    if (!id || !name) {
      return NextResponse.json({ error: 'Missing ID or name.' }, { status: 400 });
    }

    const vehicleType = await prisma.vehicleType.create({
      data: {
        id: id,
        name,
      },
    });
    return NextResponse.json(vehicleType);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create the vehicle type' }, { status: 500 });
  }
}