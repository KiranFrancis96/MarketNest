import { useState } from "react";
import { userApi } from "@/entities/user/api/userApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@/entities/user/model/userSlice";
import axios from "axios";

export const useLogin = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message ?? "Login failed. Please check your credentials.";
    }
    return "Something went wrong. Please try again.";
  };

  const login = async (data: { email: string; password: string }) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await userApi.login(data);
      
      if (response.data?.user) {
        dispatch(setUser(response.data.user));
      }
      
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    setError,
    isLoading,
    login,
  };
};
