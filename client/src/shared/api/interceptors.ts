import { baseApi } from "./baseApi";
import { AUTH_REFRESH } from "@/shared/api/apiRoutes";

let isRefreshing = false;

type QueueItem = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export const setupInterceptors = () => {
  baseApi.interceptors.response.use(
    (response) => response,

    async (error) => {
      const originalRequest = error.config;

      
      if (!error.response || error.response.status !== 401) {
        return Promise.reject(error);
      }

     
      if (originalRequest.url.includes(AUTH_REFRESH)) {
        triggerLogout(); 
        return Promise.reject(error);
      }

      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(baseApi(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        
        await baseApi.post(AUTH_REFRESH);

        processQueue(null);

        return baseApi(originalRequest);
      } catch (err) {
        processQueue(err);

        triggerLogout(); 

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
  );
};



const triggerLogout = () => {
  
  localStorage.setItem("logout", Date.now().toString());
};