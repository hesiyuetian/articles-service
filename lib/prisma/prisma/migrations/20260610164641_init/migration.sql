-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

