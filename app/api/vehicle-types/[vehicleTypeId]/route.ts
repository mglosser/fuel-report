import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

function parseVehicleTypeId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) ? id : null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ vehicleTypeId: string }> },
) {
  const { vehicleTypeId: rawId } = await context.params;
  const id = parseVehicleTypeId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid vehicleTypeId" }, { status: 400 });
  }
  const { name } = await request.json();
  const vehicleType = await prisma.vehicleType.create({
    data: {
      id,
      name,
    },
  });
  return NextResponse.json(vehicleType);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ vehicleTypeId: string }> },
) {
  const { vehicleTypeId: rawId } = await context.params;
  const id = parseVehicleTypeId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid vehicleTypeId" }, { status: 400 });
  }
  const vehicleType = await prisma.vehicleType.delete({
    where: {
      id,
    },
  });
  return NextResponse.json(vehicleType);
}