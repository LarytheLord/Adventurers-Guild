import { AssignmentStatus } from "@prisma/client";

export type ServiceResult<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

export type UpdateAssignmentBody = {
  assignmentId: string;
  status: AssignmentStatus;
  progress?: number;
};