export type ServiceResult<T> = {
  data: T | null;
  error: string | null;
  status: number;
};