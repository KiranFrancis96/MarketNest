import axios from "axios";
import { store } from "@/app/store";
import { logout } from "@/entities/user/model/userSlice";
import { logoutMerchant } from "@/entities/merchant/model/merchantSlice";

export const baseApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

baseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      const message = error.response.data?.message?.toLowerCase() || "";
      if (message.includes("blocked") || message.includes("contact admin") || message.includes("contact support")) {
        
        store.dispatch(logout());
        store.dispatch(logoutMerchant());
        
        const path = window.location.pathname;
        const isMerchantAuth = path === "/merchant/auth";
        const isUserAuth = path === "/login";
        const isAdminPath = path.startsWith("/admin");

        if (!isMerchantAuth && !isUserAuth && !isAdminPath) {
          if (path.startsWith("/merchant")) {
            window.location.href = "/merchant/auth";
          } else {
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);