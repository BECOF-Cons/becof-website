-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 150.0,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "studentPhone" TEXT NOT NULL,
    "preferredDate" DATETIME NOT NULL,
    "alternateDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "googleEventId" TEXT,
    "meetingLink" TEXT,
    "cancellationNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("alternateDate", "cancellationNote", "createdAt", "googleEventId", "id", "meetingLink", "notes", "preferredDate", "serviceType", "status", "studentEmail", "studentName", "studentPhone", "updatedAt", "userId") SELECT "alternateDate", "cancellationNote", "createdAt", "googleEventId", "id", "meetingLink", "notes", "preferredDate", "serviceType", "status", "studentEmail", "studentName", "studentPhone", "updatedAt", "userId" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
