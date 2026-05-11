import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export async function DriverSelectGrid() {
  const drivers = await prisma.driver.findMany({
    orderBy: { name: "asc" },
  });

  if (drivers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No drivers in the database yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-3">
      {drivers.map((d) => (
        <div
          key={d.id}
          className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3"
        >
          <Link
            href={`/fuel-stop?driverId=${d.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-auto min-h-10 w-full justify-center py-3 whitespace-normal text-center",
            )}
          >
            {d.name}
          </Link>
        </div>
      ))}
    </div>
  );
}