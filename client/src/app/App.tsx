import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppRouter } from "./router";
import { useSelector, useDispatch } from "react-redux";
import { userApi } from "@/entities/user/api/userApi";
import { merchantApi } from "@/entities/merchant/api/merchantApi";
import { logout } from "@/entities/user/model/userSlice";
import { logoutMerchant } from "@/entities/merchant/model/merchantSlice";

function AppContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated: isUserAuth } = useSelector((state: any) => state.user);
  const { isAuthenticated: isMerchantAuth } = useSelector((state: any) => state.merchant);

  useEffect(() => {
    // Session Verification on Load
    const verifySession = async () => {
      try {
        if (isUserAuth) {
          await userApi.getProfile();
        } else if (isMerchantAuth) {
          await merchantApi.getProfile();
        }
      } catch (err: any) {
        // If it's a 403 blocked error, the interceptor in baseApi 
        // will handle the logout and redirect automatically.
        console.error("Session verification failed", err);
      }
    };

    verifySession();
  }, [isUserAuth, isMerchantAuth]);

  useEffect(() => {
    const handleLogout = () => {
      const flag = localStorage.getItem("logout");

      if (flag) {
        localStorage.removeItem("logout");
        navigate("/register");
      }
    };

    window.addEventListener("storage", handleLogout);

    return () => {
      window.removeEventListener("storage", handleLogout);
    };
  }, [navigate]);

  return <AppRouter />;
}

export default AppContent;