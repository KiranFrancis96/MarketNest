import { useState } from "react";
import { userApi } from "@/entities/user/api/userApi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "@/entities/user/model/userSlice";

export const useRegister = () => {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message ?? "Request failed. Please try again.";
    }

    return "Something went wrong. Please try again.";
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    setError("");
    setIsLoading(true);

    try {
      await userApi.register(data);
      setEmail(data.email);
      setStep("otp");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await userApi.verifyOtp({ email, otp });
      if (response.data?.user) {
        dispatch(setUser(response.data.user));
      }

      navigate("/");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return { step, register, verifyOtp, error, isLoading, email };
};
