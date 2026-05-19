import api from "../../../utilities/api";
import { type IReduxUser } from "../../../redux/slices/userSlice";
import { getFrontendConfig } from "../../../config/frontend";

export interface AdminLoginPayload {
  identifier: string;
  password: string;
}

export interface AdminAuthResponse {
  message?: string;
  data?: {
    user?: IReduxUser;
    accessToken?: string;
    message?: string;
  };
  user?: IReduxUser;
  accessToken?: string;
}

export const adminLoginApi = async (
  data: AdminLoginPayload,
): Promise<AdminAuthResponse> => {
  const res = await api.post(
    getFrontendConfig().endpoints.auth.adminLogin,
    data,
  );
  return res.data;
};
