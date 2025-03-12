import { HourRequest } from "@prisma/client";

export interface CreateHourRequestDTO {
  date: Date;
  requestedHours: number;
}

export interface UpdateHourRequestDTO {
  status: "pending" | "approved" | "rejected";
}

export interface HourRequestResponse extends HourRequest {
  user: {
    id: number;
    email: string;
    name: string;
    monthlyHourBalance: number;
  };
}
