BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_annualLeaveBalance_df],
[User_monthlyHourBalance_df];
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_annualLeaveBalance_df] DEFAULT 0 FOR [annualLeaveBalance], CONSTRAINT [User_monthlyHourBalance_df] DEFAULT 0 FOR [monthlyHourBalance];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
