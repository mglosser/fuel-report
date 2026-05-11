import { DriverSelectGrid } from "@/components/drivers/server/get-drivers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Fuel report</CardTitle>
          <CardDescription>
            Choose a driver to log a fuel stop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DriverSelectGrid />
        </CardContent>
      </Card>
    </main>
  );
}
