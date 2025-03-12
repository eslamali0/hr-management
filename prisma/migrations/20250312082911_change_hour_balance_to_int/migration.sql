/*
  Warnings:

  - You are about to alter the column `requestedHours` on the `HourRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(4,1)` to `Int`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[HourRequest] ALTER COLUMN [requestedHours] INT NOT NULL;
ALTER TABLE [dbo].[HourRequest] ADD CONSTRAINT [HourRequest_requestedHours_df] DEFAULT 0 FOR [requestedHours];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
