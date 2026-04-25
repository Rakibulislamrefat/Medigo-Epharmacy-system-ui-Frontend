import Api from "../../../utilities/api";

export const sendOtpApi = async (email: string) => {
  const res = await Api.post("/auth/send-otp", { email });
  return res.data;
};

export const verifyOtpApi = async (email: string, otp: string) => {
  const res = await Api.post("/auth/verify-otp", { email, otp });
  return res.data;
};
