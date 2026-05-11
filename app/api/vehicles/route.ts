import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_TAKE = 50;
const MAX_TAKE = 500;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const take = Math.min(
    Math.max(Number(searchParams.get("take")) || DEFAULT_TAKE, 1),
    MAX_TAKE,
  );
  const skip = Math.max(Number(searchParams.get("skip")) || 0, 0);

  const where =
    search && search.length > 0
      ? {
          OR: [
            { unitNumber: { contains: search, mode: "insensitive" as const } },
            { plate: { contains: search, mode: "insensitive" as const } },
            { branch: { contains: search, mode: "insensitive" as const } },
            {
              vehicleType: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {};

  try {
    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: { vehicleType: true },
        orderBy: [{ unitNumber: "asc" }],
        take,
        skip,
      }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({
      vehicles,
      total,
      take,
      skip,
      hasMore: skip + vehicles.length < total,
    });
  } catch (err) {
    console.error("[GET /api/vehicles]", err);
    return NextResponse.json(
      { error: "Failed to load vehicles" },
      { status: 500 },
    );
  }
}

export type Vehicle = {
  id: number;
  vehicleTypeId: number;
  isActive: boolean;
  branch: string;
  isRental: boolean;
  plateNum: string;
  unitNum: string;
}

export const POST = async (request: Request) => {
  const { id, vehicleTypeId, isActive, branch, isRental, plateNum, unitNum } = await request.json() as Vehicle;
  

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        id,
        vehicleTypeId,
        active: isActive,
        branch,
        isRental,
        plate: plateNum,
        unitNumber: unitNum,
      },
    });

    return NextResponse.json({ vehicle }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create vehicle: ' + (e as Error).message }, { status: 500 });
  }
};