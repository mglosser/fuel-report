import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function parseVehicleId(raw: string): number | null {
  const id = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** Placeholder until GET is implemented. */
export function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ vehicleId: string }> },
) {
  const { vehicleId: rawId } = await context.params;
  const id = parseVehicleId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid vehicleId" }, { status: 400 });
  }

  try {
    const vehicle = await prisma.vehicle.delete({
      where: { id },
    });
    return NextResponse.json(vehicle);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to delete vehicle: " + (err as Error).message },
      { status: 500 },
    );
  }
}

export async function PUT(
  _request: Request,
  context: { params: Promise<{ vehicleId: string }> },
) {
  const { vehicleId: rawId } = await context.params;
  const id = parseVehicleId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid vehicleId" }, { status: 400 });
  }

  const body = await _request.json();
  const { unitNumber, plate, isRental, branch, active } = body;

  try {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { plate, unitNumber, isRental, branch, active },
    });
    return NextResponse.json(vehicle);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to update vehicle: " + (err as Error).message },
      { status: 500 },
    );
  }
}
