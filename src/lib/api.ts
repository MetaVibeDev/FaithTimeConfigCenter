import axios, { type AxiosRequestConfig } from "axios";
import type {
  GeneratePromotionCodesRequest,
  GeneratePromotionCodesResponse,
  BindPromotionCodeRequest,
  PromotionCodeOperationResponse,
  GetUserPromotionCodeRequest,
  GetUserPromotionCodeResponse,
  UsePromotionCodeRequest,
  ValidatePromotionCodeRequest,
  ValidatePromotionCodeResponse,
  DeactivatePromotionCodeRequest,
  DeactivatePromotionCodeResponse,
  GetAllPromotionCodesRequest,
  GetAllPromotionCodesResponse,
  HasUserRedeemedPromotionCodeRequest,
  HasUserRedeemedPromotionCodeResponse,
  GetPromotedUsersRequest,
  GetPromotedUsersResponse,
  UserInfo,
} from "./types";

const API_BASE_URL = "/api/user";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    // We can modify config here before request is sent
    return config;
  },
  (error) => {
    console.error("Axios request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response.data;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data,
      error.config
    );
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      `API request failed with status ${error.response?.status}`;
    return Promise.reject(new Error(errorMessage));
  }
);

async function requestWithUserId(
  config: AxiosRequestConfig,
  userId?: string | null
): Promise<any> {
  const headers: { [key: string]: any } = { ...config.headers };

  if (userId) {
    headers["UserId"] = userId;
  } else {
    headers["UserId"] = "123";
  }

  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return api({ ...config, headers });
}

export async function generatePromotionCodes(
  data: GeneratePromotionCodesRequest
): Promise<GeneratePromotionCodesResponse> {
  return requestWithUserId({
    url: "/promotion-codes/generate",
    method: "POST",
    data,
  });
}

export async function bindPromotionCode(
  data: BindPromotionCodeRequest
): Promise<PromotionCodeOperationResponse> {
  return requestWithUserId(
    {
      url: "/promotion-codes/bind",
      method: "POST",
      data,
    },
    data.userId
  );
}

export async function getUserPromotionCode(
  params: GetUserPromotionCodeRequest
): Promise<GetUserPromotionCodeResponse> {
  return requestWithUserId({
    url: "/promotion-codes/user",
    method: "GET",
    params,
  });
}

export async function usePromotionCode(
  data: UsePromotionCodeRequest
): Promise<PromotionCodeOperationResponse> {
  return requestWithUserId({
    url: "/promotion-codes/use",
    method: "POST",
    data,
  });
}

export async function validatePromotionCode(
  params: ValidatePromotionCodeRequest
): Promise<ValidatePromotionCodeResponse> {
  return requestWithUserId({
    url: "/promotion-codes/validate",
    method: "GET",
    params,
  });
}

export async function deactivatePromotionCode(
  data: DeactivatePromotionCodeRequest
): Promise<DeactivatePromotionCodeResponse> {
  return requestWithUserId({
    url: "/promotion-codes/deactivate",
    method: "POST",
    data,
  });
}

export async function getAllPromotionCodes(
  params: GetAllPromotionCodesRequest
): Promise<GetAllPromotionCodesResponse> {
  return requestWithUserId({
    url: "/promotion-codes/all",
    method: "GET",
    params,
  });
}

export async function hasUserRedeemedPromotionCode(
  params: HasUserRedeemedPromotionCodeRequest
): Promise<HasUserRedeemedPromotionCodeResponse> {
  return requestWithUserId({
    url: "/promotion-codes/has-redeemed",
    method: "GET",
    params,
  });
}

export async function getPromotedUsers(
  params: GetPromotedUsersRequest
): Promise<GetPromotedUsersResponse> {
  return requestWithUserId({
    url: "/promotion-code/promoted-users",
    method: "GET",
    params,
  });
}

export async function getUserProfile(userId: string): Promise<UserInfo> {
  return requestWithUserId(
    {
      url: "/profile",
      method: "GET",
    },
    userId
  );
}
