import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { merchantApi } from "@/entities/merchant/api/merchantApi";
import { setMerchant } from "@/entities/merchant/model/merchantSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

type AuthStep = "login" | "register" | "otp" | "forgotPassword" | "resetPassword";

export const useMerchantAuth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStepState] = useState<AuthStep>("login");

  const setStep = (newStep: AuthStep) => {
    setStepState(newStep);
    setSearchParams({ step: newStep });
  };
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const initialStep = searchParams.get("step") as AuthStep;
    if (initialStep && ["login", "register"].includes(initialStep)) {
      setStepState(initialStep);
    }
  }, [searchParams]);

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message ?? "Request failed. Please try again.";
    }
    return "Something went wrong. Please try again.";
  };

  const login = async (e: React.FormEvent, pass: string) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await merchantApi.login({ email, password: pass });
      dispatch(setMerchant(res.data.merchant));
      navigate("/merchant/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (e: React.FormEvent, data: any) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      setEmail(data.email);
      await merchantApi.register(data);
      setStep("otp");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent, otp: string) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await merchantApi.verifyOtp({ email, otp });
      dispatch(setMerchant(res.data.merchant));
      navigate("/merchant/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (e: React.FormEvent, emailInput: string) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      setEmail(emailInput);
      await merchantApi.forgotPassword({ email: emailInput });
      setSuccessMessage("If an account exists, a reset OTP has been sent.");
      setStep("resetPassword");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent, otp: string, pass: string) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      await merchantApi.resetPassword({ email, otp, password: pass });
      setSuccessMessage("Password reset successful. Please login.");
      setStep("login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    setStep,
    email,
    setEmail,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    isLoading,
    login,
    register,
    verifyOtp,
    forgotPassword,
    resetPassword,
    getErrorMessage
  };
};
