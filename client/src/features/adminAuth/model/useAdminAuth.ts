import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/entities/admin/api/adminApi";
import { setAdmin, setLoading, setError, setAdminAuthStep } from "@/entities/admin/model/adminSlice";
import type { RootState } from "@/app/store";

export const useAdminAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const step = useSelector((state: RootState) => state.admin.step);

  const setStep = (nextStep: "forgot" | "reset" | "login") => {
    dispatch(setError(null)); // Clear error when switching forms
    dispatch(setAdminAuthStep(nextStep));
  };

  const login = async (credentials: Record<string, unknown>) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await adminApi.login(credentials);
      dispatch(setAdmin(response.data.user));
      navigate("/admin/dashboard", { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      dispatch(setError(error.response?.data?.message || "Login failed"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
      dispatch(setAdmin(null));
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const forgotPassword = async (email: string) => {
    dispatch(setLoading(true));
    try {
      await adminApi.forgotPassword(email);
      setStep("reset");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      dispatch(setError(error.response?.data?.message || "Operation failed"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const resetPassword = async (data: Record<string, unknown>) => {
    dispatch(setLoading(true));
    try {
      await adminApi.resetPassword(data);
      setStep("login");
      dispatch(setError(null));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      dispatch(setError(error.response?.data?.message || "Reset failed"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { login, logout, forgotPassword, resetPassword, step, setStep };
};
