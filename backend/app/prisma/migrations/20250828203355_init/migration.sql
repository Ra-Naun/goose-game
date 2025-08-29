-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('ADMIN', 'USER', 'NIKITA');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "roles" "public"."user_role"[] DEFAULT ARRAY['USER']::"public"."user_role"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_score" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "game_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "game_score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "idx_user_id" ON "public"."game_score"("user_id");

-- CreateIndex
CREATE INDEX "idx_game_id" ON "public"."game_score"("game_id");

-- CreateIndex
CREATE INDEX "idx_user_game_id" ON "public"."game_score"("user_id", "game_id");

-- AddForeignKey
ALTER TABLE "public"."game_score" ADD CONSTRAINT "game_score_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_score" ADD CONSTRAINT "game_score_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
