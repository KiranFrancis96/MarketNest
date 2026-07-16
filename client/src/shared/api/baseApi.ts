import axios from "axios";
import { store } from "@/app/store";
import { logout } from "@/entities/user/model/userSlice";
import { logoutMerchant } from "@/entities/merchant/model/merchantSlice";
import {
  PATH_LOGIN,
  PATH_MERCHANT_AUTH,
  PATH_MERCHANT_PREFIX,
  PATH_ADMIN_PREFIX,
} from "@/shared/api/clientRoutes";
import { HttpStatus } from "@/shared/api/httpStatus";

export const baseApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

baseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === HttpStatus.FORBIDDEN) {
      const message = error.response.data?.message?.toLowerCase() || "";
      if (message.includes("blocked") || message.includes("contact admin") || message.includes("contact support")) {
        
        store.dispatch(logout());
        store.dispatch(logoutMerchant());
        
        const path = window.location.pathname;
        const isMerchantAuth = path === PATH_MERCHANT_AUTH;
        const isUserAuth = path === PATH_LOGIN;
        const isAdminPath = path.startsWith(PATH_ADMIN_PREFIX);

        if (!isMerchantAuth && !isUserAuth && !isAdminPath) {
          if (path.startsWith(PATH_MERCHANT_PREFIX)) {
            window.location.href = PATH_MERCHANT_AUTH;
          } else {
            window.location.href = PATH_LOGIN;
          }
        }
      }
    }
    return Promise.reject(error);
  }
);