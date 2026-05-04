import { useState } from "react";
import { userApi } from "@/entities/user/api/userApi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const useForgotPassword = () => {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message ?? "Request failed. Please try again.";
    }
    return "Something went wrong. Please try again.";
  };

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await userApi.forgotPassword({ email });
      setSuccessMessage(response.data.message);
      setStep("reset");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await userApi.resetPassword({ email, otp, password });
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    email,
    setEmail,
    otp,
    setOtp,
    password,
    setPassword,
    error,
    successMessage,
    isLoading,
    requestReset,
    submitReset,
  };
};
