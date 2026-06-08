import { NextResponse } from "next/server";
import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_TAKE = 200;
const MAX_TAKE = 2000;

/** Parse `YYYY-MM-DD` into YYYYMMDD as BigInt (matches fuel stop `date` storage). */
function parseInclusiveDateParam(value: string | null, label: string) {
  if (value == null || !value.trim()) {
    return { ok: false as const, error: `${label} is required (use YYYY-MM-DD).` };
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) {
    return {
      ok: false as const,
      error: `${label} must be YYYY-MM-DD.`,
    };
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (
    !Number.isFinite(y) ||
    mo < 1 ||
    mo > 12 ||
    d < 1 ||
    d > 31
  ) {
    return { ok: false as const, error: `${label} is not a valid calendar date.` };
  }
  const day = new Date(Date.UTC(y, mo - 1, d));
  if (
    day.getUTCFullYear() !== y ||
    day.getUTCMonth() !== mo - 1 ||
    day.getUTCDate() !== d
  ) {
    return { ok: false as const, error: `${label} is not a valid calendar date.` };
  }
  const packed = BigInt(y * 10000 + mo * 100 + d);
  return { ok: true as const, packed };
}

function serializeFuelStop(
  row: {
    id: string;
    vehicleId: number;
    driverId: number;
    costPerGallon: number | null;
    totalCost: number;
    gallons: number;
    date: bigint;
    time: bigint;
    imageUrl: string | null;
    vehicle: {
      id: number;
      unitNumber: string;
      plate: string;
      branch: string;
      active: boolean;
      isRental: boolean;
      vehicleType: { id: number; name: string };
    };
  },
) {
  return {
    id: row.id,
    vehicleId: row.vehicleId,
    driverId: row.driverId,
    costPerGallon: row.costPerGallon,
    totalCost: row.totalCost,
    gallons: row.gallons,
    date: row.date.toString(),
    time: row.time.toString(),
    imageUrl: row.imageUrl,
    vehicle: row.vehicle,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const startParsed = parseInclusiveDateParam(
    searchParams.get("startDate"),
    "startDate",
  );
  const endParsed = parseInclusiveDateParam(
    searchParams.get("endDate"),
    "endDate",
  );

  if (!startParsed.ok) {
    return NextResponse.json({ error: startParsed.error }, { status: 400 });
  }
  if (!endParsed.ok) {
    return NextResponse.json({ error: endParsed.error }, { status: 400 });
  }

  if (startParsed.packed > endParsed.packed) {
    return NextResponse.json(
      { error: "startDate must be on or before endDate." },
      { status: 400 },
    );
  }

  const take = Math.min(
    Math.max(Number(searchParams.get("take")) || DEFAULT_TAKE, 1),
    MAX_TAKE,
  );
  const skip = Math.max(Number(searchParams.get("skip")) || 0, 0);

  const vehicleBranch =
    searchParams.get("vehicleBranch")?.trim() ||
    searchParams.get("branch")?.trim();
  const driverIdRaw = searchParams.get("driverId")?.trim();
  const vehicleIdRaw = searchParams.get("vehicleId")?.trim();

  const driverId =
    driverIdRaw != null && driverIdRaw.length > 0
      ? Number(driverIdRaw)
      : undefined;
  const vehicleId =
    vehicleIdRaw != null && vehicleIdRaw.length > 0
      ? Number(vehicleIdRaw)
      : undefined;

  if (driverId !== undefined && (!Number.isInteger(driverId) || driverId < 1)) {
    return NextResponse.json(
      { error: "driverId must be a positive integer." },
      { status: 400 },
    );
  }
  if (
    vehicleId !== undefined &&
    (!Number.isInteger(vehicleId) || vehicleId < 1)
  ) {
    return NextResponse.json(
      { error: "vehicleId must be a positive integer." },
      { status: 400 },
    );
  }

  const meta = {
    startDate: searchParams.get("startDate")?.trim(),
    endDate: searchParams.get("endDate")?.trim(),
    vehicleBranch:
      vehicleBranch != null && vehicleBranch.length > 0
        ? vehicleBranch
        : undefined,
    driverId: driverId ?? undefined,
    vehicleId: vehicleId ?? undefined,
    take,
    skip,
  };

  try {
    const where: Prisma.FuelStopWhereInput = {
      date: {
        gte: startParsed.packed,
        lte: endParsed.packed,
      },
    };

    if (driverId !== undefined) {
      where.driverId = driverId;
    }

    if (vehicleId !== undefined) {
      where.vehicleId = vehicleId;
    }

    if (vehicleBranch != null && vehicleBranch.length > 0) {
      where.vehicle = { branch: vehicleBranch };
    }

    const [rows, total] = await Promise.all([
      prisma.fuelStop.findMany({
        where,
        include: {
          vehicle: { include: { vehicleType: true } },
        },
        orderBy: [{ date: "desc" }, { time: "desc" }, { id: "desc" }],
        take,
        skip,
      }),
      prisma.fuelStop.count({ where }),
    ]);

    return NextResponse.json({
      fuelStops: rows.map(serializeFuelStop),
      total,
      ...meta,
      hasMore: skip + rows.length < total,
    });
  } catch (err) {
    console.error("[GET /api/fuel-stops]", err);
    return NextResponse.json(
      { error: "Failed to load fuel stops" },
      { status: 500 },
    );
  }
}
