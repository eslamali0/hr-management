BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'user',
    [annualLeaveBalance] INT NOT NULL CONSTRAINT [User_annualLeaveBalance_df] DEFAULT 21,
    [monthlyHourBalance] DECIMAL(4,1) NOT NULL CONSTRAINT [User_monthlyHourBalance_df] DEFAULT 3.0,
    [name] NVARCHAR(1000),
    [department] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Attendance] (
    [id] INT NOT NULL IDENTITY(1,1),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Attendance_status_df] DEFAULT 'present',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Attendance_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT NOT NULL,
    CONSTRAINT [Attendance_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Attendance_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[LeaveRequest] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000) NOT NULL,
    [startDate] DATE NOT NULL,
    [endDate] DATE,
    [requestedDays] FLOAT(53),
    [requestedHours] DECIMAL(4,1),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [LeaveRequest_status_df] DEFAULT 'pending',
    [reason] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LeaveRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT NOT NULL,
    CONSTRAINT [LeaveRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Attendance] ADD CONSTRAINT [Attendance_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LeaveRequest] ADD CONSTRAINT [LeaveRequest_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
