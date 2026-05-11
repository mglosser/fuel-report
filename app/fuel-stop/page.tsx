import Link from "next/link";

import { FuelStopForm } from "@/components/fuel-stop/fuel-stop-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function FuelStopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = await searchParams;
  const raw = q.driverId;
  const parsed =
    typeof raw === "string"
      ? Number.parseInt(raw, 10)
      : Array.isArray(raw)
        ? Number.parseInt(raw[0] ?? "", 10)
        : NaN;

  const drivers = await prisma.driver.findMany({ orderBy: { name: "asc" } });

  if (drivers.length === 0) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">No drivers</CardTitle>
            <CardDescription>
              Add at least one driver in the database before logging fuel
              stops.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Back to home
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  const initialDriverId =
    Number.isFinite(parsed) && drivers.some((d) => d.id === parsed)
      ? parsed
      : undefined;

  return (
    <main className="mx-auto w-full max-w-lg p-6">
      <FuelStopForm drivers={drivers} initialDriverId={initialDriverId} />
    </main>
  );
}
