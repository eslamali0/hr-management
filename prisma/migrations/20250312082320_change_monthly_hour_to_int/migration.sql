/*
  Warnings:

  - You are about to alter the column `monthlyHourBalance` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(4,1)` to `Int`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Attendance] DROP CONSTRAINT [Attendance_status_df];
ALTER TABLE [dbo].[Attendance] ADD CONSTRAINT [Attendance_status_df] DEFAULT 'Present' FOR [status];

-- AlterTable
ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_monthlyHourBalance_df];
ALTER TABLE [dbo].[User] ALTER COLUMN [monthlyHourBalance] INT NOT NULL;
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_monthlyHourBalance_df] DEFAULT 0 FOR [monthlyHourBalance];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
