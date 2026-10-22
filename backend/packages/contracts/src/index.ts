export const SERVICE_NAMES = {
  apiGateway: "api-gateway",
  auth: "auth-service",
  notification: "notification-service",
  deepagent: "deepagent-service",
} as const;

export type ServiceName = (typeof SERVICE_NAMES)[keyof typeof SERVICE_NAMES];

export interface HealthResponse {
  service: ServiceName;
  status: "ok";
  runtime: "bun";
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
