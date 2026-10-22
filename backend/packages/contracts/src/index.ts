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
