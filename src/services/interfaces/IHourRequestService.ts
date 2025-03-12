import { HourRequest } from "@prisma/client";

export interface IHourRequestService {
  submitHourRequest(
    userId: number,
    requestData: Partial<HourRequest>,
  ): Promise<void>;

  approveHourRequest(requestId: number): Promise<void>;

  rejectHourRequest(requestId: number): Promise<void>;

  getPendingRequests(): Promise<
    (Partial<HourRequest> & {
      user: {
        name: string | null;
        department: { name: string } | null;
      };
    })[]
  >;

  getUserRequests(userId: number): Promise<Partial<HourRequest>[]>;
}
