"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type SubmitFuelStopInput = {
  driverId: number;
  vehicleId: number;
  costPerGallon?: number | null;
  totalCost: number;
  gallons: number;
  date: number;
  time: number;
  imageUrl?: string | null;
};

export async function SubmitFuelStop({
  driverId,
  vehicleId,
  costPerGallon,
  totalCost,
  gallons,
  date,
  time,
  imageUrl,
}: SubmitFuelStopInput) {
  if (!Number.isFinite(driverId) || driverId < 1) {
    throw new Error("Invalid driver.");
  }
  if (!Number.isFinite(vehicleId) || vehicleId < 1) {
    throw new Error("Invalid vehicle.");
  }
  if (!Number.isFinite(date) || !Number.isFinite(time)) {
    throw new Error("Invalid date or time.");
  }
  if (!Number.isFinite(gallons) || gallons <= 0) {
    throw new Error("Gallons must be greater than zero.");
  }
  if (!Number.isFinite(totalCost) || totalCost <= 0) {
    throw new Error("Total cost must be greater than zero.");
  }
  if (costPerGallon != null && !Number.isFinite(costPerGallon)) {
    throw new Error("Invalid cost per gallon.");
  }

  const fuelStop = await prisma.fuelStop.create({
    data: {
      id: randomUUID(),
      driverId,
      vehicleId,
      costPerGallon: costPerGallon ?? null,
      totalCost,
      gallons,
      date: BigInt(date),
      time: BigInt(time),
      imageUrl: imageUrl?.trim() || null,
    },
  });

  return fuelStop;
}
