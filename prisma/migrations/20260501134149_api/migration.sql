-- CreateTable
CREATE TABLE "apiKeys" (
    "id" VARCHAR(256) NOT NULL,
    "createdBy" VARCHAR(30) NOT NULL,
    "expires" BIGINT NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "apiKeys_pkey" PRIMARY KEY ("id")
);
