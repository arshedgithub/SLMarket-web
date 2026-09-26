-- Drop the SELLER/BUYER distinction: every account is just a "USER" now.
-- Business features come from owning a BusinessProfile, not from role.
-- Existing SELLER/BUYER rows were already backfilled to USER before this
-- migration runs, so the enum swap below has nothing left to reject.
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
