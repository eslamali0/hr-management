/*
  Warnings:

  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[User] DROP COLUMN [department];
ALTER TABLE [dbo].[User] ADD [departmentId] INT;

-- CreateTable
CREATE TABLE [dbo].[Department] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] VARCHAR(50) NOT NULL,
    CONSTRAINT [Department_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Department_name_key] UNIQUE NONCLUSTERED ([name])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_departmentId_fkey] FOREIGN KEY ([departmentId]) REFERENCES [dbo].[Department]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
