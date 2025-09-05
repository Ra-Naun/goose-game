import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from "axios";

import axiosRetry, { type IAxiosRetryConfig } from "axios-retry";

type RequestInterceptor = (
  config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
type ResponseInterceptor = (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
type ErrorInterceptor = (error: AxiosError) => any;

interface AxiosClientOptions {
  baseURL: string;
  timeout?: number;
  enableRetry?: boolean;
  retryOptions?: Partial<IAxiosRetryConfig>;
  onRequest?: RequestInterceptor;
  onResponse?: ResponseInterceptor;
  onError?: ErrorInterceptor;
}

export class AxiosClient {
  private instance: AxiosInstance;

  constructor(options: AxiosClientOptions) {
    this.instance = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout ?? 10000,
      withCredentials: true,
    });

    if (options.enableRetry) {
      axiosRetry(this.instance, {
        retries: 3,
        retryDelay: (count) => count * 1000,
        retryCondition: (error) =>
          axiosRetry.isNetworkOrIdempotentRequestError(error) || [502, 503, 504].includes(error.response?.status ?? 0),
        ...options.retryOptions,
      });
    }

    if (options.onRequest) {
      this.instance.interceptors.request.use(options.onRequest, (error) => Promise.reject(error));
    }

    if (options.onResponse) {
      this.instance.interceptors.response.use(options.onResponse, (error) => Promise.reject(error));
    }

    if (options.onError) {
      this.instance.interceptors.response.use((r) => r, options.onError);
    }
  }

  // Позволяет добавить дополнительные перехватчики запросов
  addRequestInterceptor(onFulfilled: RequestInterceptor, onRejected?: (error: any) => any) {
    this.instance.interceptors.request.use(onFulfilled, onRejected);
  }

  // Позволяет добавить дополнительные перехватчики ответов
  addResponseInterceptor(onFulfilled: ResponseInterceptor, onRejected?: (error: any) => any) {
    this.instance.interceptors.response.use(onFulfilled, onRejected);
  }

  // Основные HTTP методы с указанием generic для типизации
  async get<T = any>(url: string, config?: AxiosRequestConfig, abortController?: AbortController): Promise<T> {
    const signal = abortController?.signal;
    const res = await this.instance.get<T>(url, { ...config, signal });
    return res.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    abortController?: AbortController,
  ): Promise<T> {
    const signal = abortController?.signal;
    const res = await this.instance.post<T>(url, data, { ...config, signal });
    return res.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    abortController?: AbortController,
  ): Promise<T> {
    const signal = abortController?.signal;
    const res = await this.instance.put<T>(url, data, { ...config, signal });
    return res.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    abortController?: AbortController,
  ): Promise<T> {
    const signal = abortController?.signal;
    const res = await this.instance.patch<T>(url, data, { ...config, signal });
    return res.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig, abortController?: AbortController): Promise<T> {
    const signal = abortController?.signal;
    const res = await this.instance.delete<T>(url, { ...config, signal });
    return res.data;
  }
}
