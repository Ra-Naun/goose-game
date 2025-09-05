import { AxiosClient } from "../../client/HTTPClient";
import { AuthorizationInterceptor } from "../utils/authorizationInterceptor";

const API_URL = "/api";

export const apiClient: AxiosClient = new AxiosClient({
  baseURL: API_URL,
  onRequest: AuthorizationInterceptor,
  enableRetry: true,
});
