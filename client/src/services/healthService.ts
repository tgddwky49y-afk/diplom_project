import { request } from "./http";
export async function getHealth(): Promise<{ message: string }> {
  return request("/api/health");
}
