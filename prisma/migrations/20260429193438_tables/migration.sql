-- CreateTable
CREATE TABLE "vehicleTypes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,

    CONSTRAINT "vehicleTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "vehicleTypeId" INTEGER NOT NULL,
    "unitNumber" VARCHAR(20) NOT NULL,
    "plate" VARCHAR(20) NOT NULL,
    "isRental" BOOLEAN NOT NULL,
    "branch" VARCHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuelStops" (
    "id" VARCHAR(36) NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "costPerGallon" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "gallons" DOUBLE PRECISION NOT NULL,
    "date" BIGINT NOT NULL,
    "time" BIGINT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "fuelStops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(40) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicleTypes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuelStops" ADD CONSTRAINT "fuelStops_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
