export interface ApiResponseDTO<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp?: string;
}