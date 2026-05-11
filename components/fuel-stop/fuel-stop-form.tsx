"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { SubmitFuelStop } from "@/app/actions/submit-fuel-stop";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { useServerAction } from "@/hooks/use-server-action";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Temporary: hide optional pump details until we bring them back */
const SHOW_COST_PER_GALLON_AND_RECEIPT_URL = false;

type DriverOption = { id: number; name: string };

type VehicleRow = {
  id: number;
  unitNumber: string;
  plate: string;
  branch: string;
  active: boolean;
  vehicleType: { id: number; name: string };
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDateYYYYMMDD(d: Date): number {
  return (
    d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  );
}

/** Local wall-clock HHMM as integer e.g. 14:05 → 1405 */
function formatTimeHHMM(d: Date): number {
  return d.getHours() * 100 + d.getMinutes();
}

export function FuelStopForm({
  drivers,
  initialDriverId,
}: {
  drivers: DriverOption[];
  initialDriverId?: number;
}) {
  const formId = useId();
  const { run, isPending, error, resetError } = useServerAction(SubmitFuelStop);

  const defaultDriverId = useMemo(() => {
    if (
      initialDriverId != null &&
      drivers.some((d) => d.id === initialDriverId)
    ) {
      return String(initialDriverId);
    }
    return drivers[0] ? String(drivers[0].id) : "";
  }, [drivers, initialDriverId]);

  const [driverId, setDriverId] = useState(defaultDriverId);
  const [vehicleId, setVehicleId] = useState("");
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  const now = useMemo(() => new Date(), []);
  const [dateStr, setDateStr] = useState(() =>
    `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
  );
  const [timeStr, setTimeStr] = useState(() =>
    `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
  );

  const [gallons, setGallons] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [costPerGallon, setCostPerGallon] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const pickedInitialVehicle = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/vehicles?take=500")
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(
            typeof body?.error === "string"
              ? body.error
              : "Failed to load vehicles.",
          );
        }
        return r.json() as Promise<{ vehicles: VehicleRow[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        const active = data.vehicles.filter((v) => v.active);
        setVehicles(active);
        if (active.length > 0 && !pickedInitialVehicle.current) {
          pickedInitialVehicle.current = true;
          setVehicleId(String(active[0].id));
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setVehiclesError(
            e instanceof Error ? e.message : "Failed to load vehicles.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setVehiclesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetError();
    setFormError(null);
    setSaved(false);

    const d = new Date(`${dateStr}T${timeStr}`);
    if (Number.isNaN(d.getTime())) {
      setFormError("Invalid date or time.");
      return;
    }

    const vId = Number(vehicleId);
    const drvId = Number(driverId);
    const g = Number(gallons);
    const total = Number(totalCost);

    let cpg: number | null = null;
    if (SHOW_COST_PER_GALLON_AND_RECEIPT_URL) {
      const cpgRaw = costPerGallon.trim();
      cpg = cpgRaw === "" ? null : Number(cpgRaw);
      if (cpg !== null && !Number.isFinite(cpg)) {
        setFormError("Cost per gallon must be a valid number.");
        return;
      }
    }

    try {
      await run({
        driverId: drvId,
        vehicleId: vId,
        gallons: g,
        totalCost: total,
        costPerGallon: cpg,
        date: formatDateYYYYMMDD(d),
        time: formatTimeHHMM(d),
        imageUrl: SHOW_COST_PER_GALLON_AND_RECEIPT_URL
          ? imageUrl.trim() || null
          : null,
      });
      setSaved(true);
      setGallons("");
      setTotalCost("");
      if (SHOW_COST_PER_GALLON_AND_RECEIPT_URL) {
        setCostPerGallon("");
        setImageUrl("");
      }
    } catch {
      /* error message comes from useServerAction */
    }
  }

  const submitDisabled =
    isPending ||
    vehiclesLoading ||
    vehicles.length === 0 ||
    !driverId ||
    !vehicleId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Log fuel stop</CardTitle>
        <CardDescription>
          Enter pump details. Date and time use this device&apos;s local
          timezone.
        </CardDescription>
      </CardHeader>
      <form id={formId} onSubmit={(e) => void handleSubmit(e)}>
        <CardContent className="flex flex-col gap-4">
          {vehiclesError ? (
            <Alert variant="destructive">
              <AlertTitle>Vehicles unavailable</AlertTitle>
              <AlertDescription>{vehiclesError}</AlertDescription>
            </Alert>
          ) : null}

          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>Check the form</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Could not save</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {saved && !error ? (
            <Alert>
              <AlertTitle>Saved</AlertTitle>
              <AlertDescription>
                Fuel stop was recorded successfully.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${formId}-driver`}>Driver</Label>
            <NativeSelect
              id={`${formId}-driver`}
              name="driverId"
              required
              className="w-full"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            >
              {drivers.map((d) => (
                <NativeSelectOption key={d.id} value={String(d.id)}>
                  {d.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${formId}-vehicle`}>Vehicle</Label>
            <NativeSelect
              id={`${formId}-vehicle`}
              name="vehicleId"
              required
              className="w-full"
              disabled={vehiclesLoading || vehicles.length === 0}
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              {vehiclesLoading ? (
                <NativeSelectOption value="">Loading…</NativeSelectOption>
              ) : (
                vehicles.map((v) => (
                  <NativeSelectOption key={v.id} value={String(v.id)}>
                    {v.unitNumber} — {v.vehicleType.name} ({v.plate})
                  </NativeSelectOption>
                ))
              )}
            </NativeSelect>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${formId}-date`}>Date</Label>
              <Input
                id={`${formId}-date`}
                name="date"
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${formId}-time`}>Time</Label>
              <Input
                id={`${formId}-time`}
                name="time"
                type="time"
                required
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${formId}-gallons`}>Gallons</Label>
              <Input
                id={`${formId}-gallons`}
                name="gallons"
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                required
                value={gallons}
                onChange={(e) => setGallons(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${formId}-total`}>Total cost</Label>
              <Input
                id={`${formId}-total`}
                name="totalCost"
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                required
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
              />
            </div>
          </div>

          {SHOW_COST_PER_GALLON_AND_RECEIPT_URL ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${formId}-cpg`}>
                  Cost per gallon{" "}
                  <span className="font-normal">(optional)</span>
                </Label>
                <Input
                  id={`${formId}-cpg`}
                  name="costPerGallon"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={costPerGallon}
                  onChange={(e) => setCostPerGallon(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`${formId}-image`}>
                  Receipt image URL{" "}
                  <span className="font-normal">(optional)</span>
                </Label>
                <Input
                  id={`${formId}-image`}
                  name="imageUrl"
                  type="url"
                  inputMode="url"
                  placeholder="https://"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 border-t pt-4">
          <Button type="submit" disabled={submitDisabled} className="gap-2">
            {isPending ? (
              <>
                <Spinner />
                Saving…
              </>
            ) : (
              "Save fuel stop"
            )}
          </Button>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
          >
            Change driver
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
