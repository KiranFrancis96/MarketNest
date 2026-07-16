import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { baseApi } from "@/shared/api/baseApi";
import {
  MSG_FAILED_FETCH_NOTIFICATIONS,
  MSG_FAILED_MARK_READ,
  MSG_FAILED_DELETE_NOTIFICATION,
  MSG_FAILED_REGISTER_DEVICE,
  MSG_FAILED_FETCH_PREFERENCES,
  MSG_FAILED_UPDATE_PREFERENCES,
} from "@/shared/constants/messages";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  pushEnabled: boolean;
  chatbotEnabled: boolean;
  marketingEnabled: boolean;
  orderEnabled: boolean;
  startHour: number;
  endHour: number;
  notificationFrequency: string;
}

interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreference | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  preferences: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await baseApi.get<Notification[]>("/notifications");
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || MSG_FAILED_FETCH_NOTIFICATIONS);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await baseApi.patch<{ message: string; notification: Notification }>(
        `/notifications/${id}/read`
      );
      return response.data.notification;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || MSG_FAILED_MARK_READ);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (id: string, { rejectWithValue }) => {
    try {
      await baseApi.delete(`/notifications/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || MSG_FAILED_DELETE_NOTIFICATION);
    }
  }
);

export const registerDevice = createAsyncThunk(
  "notification/registerDevice",
  async (
    data: { deviceToken: string; browser?: string; platform?: string },
    { rejectWithValue }
  ) => {
    try {
      await baseApi.post("/notifications/register-device", data);
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || MSG_FAILED_REGISTER_DEVICE);
    }
  }
);

export const fetchPreferences = createAsyncThunk(
  "notification/fetchPreferences",
  async (_, { rejectWithValue }) => {
    try {
      const response = await baseApi.get<NotificationPreference>("/notification-preferences");
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || MSG_FAILED_FETCH_PREFERENCES);
    }
  }
);

export const updatePreferences = createAsyncThunk(
  "notification/updatePreferences",
  async (data: Partial<NotificationPreference>, { rejectWithValue }) => {
    try {
      const response = await baseApi.put<{ message: string; preferences: NotificationPreference }>(
        "/notification-preferences",
        data
      );
      return response.data.preferences;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || MSG_FAILED_UPDATE_PREFERENCES);
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearNotificationsState(state) {
      state.notifications = [];
      state.preferences = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action: PayloadAction<Notification>) => {
        const index = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
      })
      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<string>) => {
        state.notifications = state.notifications.filter((n) => n._id !== action.payload);
      })
      // Fetch Preferences
      .addCase(fetchPreferences.fulfilled, (state, action: PayloadAction<NotificationPreference>) => {
        state.preferences = action.payload;
      })
      // Update Preferences
      .addCase(updatePreferences.fulfilled, (state, action: PayloadAction<NotificationPreference>) => {
        state.preferences = action.payload;
      });
  },
});

export const { clearNotificationsState } = notificationSlice.actions;
export default notificationSlice.reducer;
