import { baseApi } from "./baseApi";

let isRefreshing = false;

type QueueItem = {
  resolve: () => void;
  reject: (error: any) => void;
};

let failedQueue: QueueItem[] = [];

const processQueue = (error: any) => {
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

     
      if (originalRequest.url.includes("/auth/refresh")) {
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
        
        await baseApi.post("/auth/refresh");

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