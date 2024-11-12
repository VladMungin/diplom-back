/*
  Warnings:

  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Company" ("id", "name") SELECT "id", "name" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("companyId", "email", "id", "name") SELECT "companyId", "email", "id", "name" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" INTEGER NOT NULL
);
INSERT INTO "new_Project" ("description", "id", "name", "userId") SELECT "description", "id", "name", "userId" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time_to_compleate" INTEGER NOT NULL,
    "current_time" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("comment", "created_at", "current_time", "description", "employeeId", "id", "projectId", "status", "time_to_compleate", "title", "type") SELECT "comment", "created_at", "current_time", "description", "employeeId", "id", "projectId", "status", "time_to_compleate", "title", "type" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("companyId", "email", "id", "name", "password") SELECT "companyId", "email", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new__EmployeeProjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EmployeeProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EmployeeProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__EmployeeProjects" ("A", "B") SELECT "A", "B" FROM "_EmployeeProjects";
DROP TABLE "_EmployeeProjects";
ALTER TABLE "new__EmployeeProjects" RENAME TO "_EmployeeProjects";
CREATE UNIQUE INDEX "_EmployeeProjects_AB_unique" ON "_EmployeeProjects"("A", "B");
CREATE INDEX "_EmployeeProjects_B_index" ON "_EmployeeProjects"("B");
CREATE TABLE "new__EmployeeTasks" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EmployeeTasks_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EmployeeTasks_B_fkey" FOREIGN KEY ("B") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__EmployeeTasks" ("A", "B") SELECT "A", "B" FROM "_EmployeeTasks";
DROP TABLE "_EmployeeTasks";
ALTER TABLE "new__EmployeeTasks" RENAME TO "_EmployeeTasks";
CREATE UNIQUE INDEX "_EmployeeTasks_AB_unique" ON "_EmployeeTasks"("A", "B");
CREATE INDEX "_EmployeeTasks_B_index" ON "_EmployeeTasks"("B");
CREATE TABLE "new__EmployeeToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EmployeeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EmployeeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__EmployeeToUser" ("A", "B") SELECT "A", "B" FROM "_EmployeeToUser";
DROP TABLE "_EmployeeToUser";
ALTER TABLE "new__EmployeeToUser" RENAME TO "_EmployeeToUser";
CREATE UNIQUE INDEX "_EmployeeToUser_AB_unique" ON "_EmployeeToUser"("A", "B");
CREATE INDEX "_EmployeeToUser_B_index" ON "_EmployeeToUser"("B");
CREATE TABLE "new__ProjectToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProjectToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProjectToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__ProjectToUser" ("A", "B") SELECT "A", "B" FROM "_ProjectToUser";
DROP TABLE "_ProjectToUser";
ALTER TABLE "new__ProjectToUser" RENAME TO "_ProjectToUser";
CREATE UNIQUE INDEX "_ProjectToUser_AB_unique" ON "_ProjectToUser"("A", "B");
CREATE INDEX "_ProjectToUser_B_index" ON "_ProjectToUser"("B");
CREATE TABLE "new__UserProjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__UserProjects" ("A", "B") SELECT "A", "B" FROM "_UserProjects";
DROP TABLE "_UserProjects";
ALTER TABLE "new__UserProjects" RENAME TO "_UserProjects";
CREATE UNIQUE INDEX "_UserProjects_AB_unique" ON "_UserProjects"("A", "B");
CREATE INDEX "_UserProjects_B_index" ON "_UserProjects"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
