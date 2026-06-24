-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WalkerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "experience" INTEGER,
    "certifications" TEXT,
    "services" TEXT NOT NULL DEFAULT 'WALKING',
    "ratePerWalk" REAL NOT NULL DEFAULT 15.0,
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "latitude" REAL,
    "longitude" REAL,
    "serviceRadius" REAL NOT NULL DEFAULT 5.0,
    "totalWalks" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "completedWalks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WalkerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WalkerProfile" ("bio", "certifications", "completedWalks", "createdAt", "currency", "experience", "id", "isAvailable", "isFeatured", "latitude", "longitude", "ratePerWalk", "rating", "reviewCount", "serviceRadius", "services", "totalWalks", "updatedAt", "userId") SELECT "bio", "certifications", "completedWalks", "createdAt", "currency", "experience", "id", "isAvailable", "isFeatured", "latitude", "longitude", "ratePerWalk", "rating", "reviewCount", "serviceRadius", "services", "totalWalks", "updatedAt", "userId" FROM "WalkerProfile";
DROP TABLE "WalkerProfile";
ALTER TABLE "new_WalkerProfile" RENAME TO "WalkerProfile";
CREATE UNIQUE INDEX "WalkerProfile_userId_key" ON "WalkerProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
