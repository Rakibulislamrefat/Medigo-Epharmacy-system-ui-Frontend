import { useState } from "react";
import { registerApi } from "./Register.service";
import type { RegisterFormData } from "./register.type";

export const useRegister = () => {
  const [loading, setLoading] = useState(false);

  const register = async (form: RegisterFormData) => {
    setLoading(true);
    try {
      const data = await registerApi(form);
      return data;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
};