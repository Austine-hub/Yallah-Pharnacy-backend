import axiosClient from "./axiosClient.js";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await axiosClient.post<AuthResponse>("/auth/login", payload);
  return data;
};
