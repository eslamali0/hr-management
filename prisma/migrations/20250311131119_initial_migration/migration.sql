BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'user',
    [annualLeaveBalance] INT NOT NULL CONSTRAINT [User_annualLeaveBalance_df] DEFAULT 0,
    [monthlyHourBalance] DECIMAL(4,1) NOT NULL CONSTRAINT [User_monthlyHourBalance_df] DEFAULT 0,
    [name] NVARCHAR(1000),
    [departmentId] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Attendance] (
    [id] INT NOT NULL IDENTITY(1,1),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Attendance_status_df] DEFAULT 'present',
    [date] DATE NOT NULL,
    [userId] INT NOT NULL,
    CONSTRAINT [Attendance_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Attendance_userId_date_key] UNIQUE NONCLUSTERED ([userId],[date])
);

-- CreateTable
CREATE TABLE [dbo].[LeaveRequest] (
    [id] INT NOT NULL IDENTITY(1,1),
    [startDate] DATE NOT NULL,
    [endDate] DATE NOT NULL,
    [requestedDays] FLOAT(53) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [LeaveRequest_status_df] DEFAULT 'Pending',
    [reason] TEXT,
    [userId] INT NOT NULL,
    CONSTRAINT [LeaveRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[HourRequest] (
    [id] INT NOT NULL IDENTITY(1,1),
    [date] DATE NOT NULL,
    [requestedHours] DECIMAL(4,1) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [HourRequest_status_df] DEFAULT 'Pending',
    [userId] INT NOT NULL,
    CONSTRAINT [HourRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Department] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] VARCHAR(50) NOT NULL,
    CONSTRAINT [Department_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Department_name_key] UNIQUE NONCLUSTERED ([name])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_departmentId_fkey] FOREIGN KEY ([departmentId]) REFERENCES [dbo].[Department]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Attendance] ADD CONSTRAINT [Attendance_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LeaveRequest] ADD CONSTRAINT [LeaveRequest_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[HourRequest] ADD CONSTRAINT [HourRequest_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
