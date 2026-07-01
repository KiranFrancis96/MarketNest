import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import { fetchNotifications, registerDevice } from "../model/notificationSlice";
import { NotificationDrawer } from "./NotificationDrawer";
import { Bell } from "lucide-react";

export const NotificationBell: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((state: RootState) => state.notification.notifications);
  const user = useSelector((state: RootState) => state.user.user);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (user) {
      // 1. Fetch user notifications
      dispatch(fetchNotifications());

      // 2. Request browser push permission & Register device
      if ("Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              _registerClientDevice();
            }
          });
        } else if (Notification.permission === "granted") {
          _registerClientDevice();
        }
      }
    }
  }, [dispatch, user]);

  const _registerClientDevice = () => {
    // Check if we have a device token stored, else generate a unique mock token for local testing
    let deviceToken = localStorage.getItem("marketnest_device_token");
    if (!deviceToken) {
      deviceToken = `fcm_dev_token_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      localStorage.setItem("marketnest_device_token", deviceToken);
    }

    const browser = _detectBrowser();
    const platform = navigator.platform || "Unknown";

    dispatch(
      registerDevice({
        deviceToken,
        browser,
        platform,
      })
    );
  };

  const _detectBrowser = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("SamsungBrowser")) return "Samsung Browser";
    if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
    if (userAgent.includes("Trident")) return "Internet Explorer";
    if (userAgent.includes("Edge")) return "Microsoft Edge";
    if (userAgent.includes("Chrome")) return "Google Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    return "Unknown Browser";
  };

  const handleToggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
    if (!isDrawerOpen) {
      dispatch(fetchNotifications());
    }
  };

  return (
    <>
      <button
        onClick={handleToggleDrawer}
        style={bellContainerStyles}
        title="Notifications"
      >
        <Bell size={20} color="var(--text-main)" style={bellIconStyles(unreadCount > 0)} />
        {unreadCount > 0 && (
          <span style={badgeStyles}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isDrawerOpen && createPortal(
        <NotificationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />,
        document.body
      )}
    </>
  );
};

// Styles
const bellContainerStyles: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "0.4rem",
  borderRadius: "50%",
  transition: "background-color 0.2s ease",
};

const bellIconStyles = (hasUnread: boolean): React.CSSProperties => ({
  animation: hasUnread ? "bellRing 2s ease infinite" : "none",
  transformOrigin: "top center",
});

const badgeStyles: React.CSSProperties = {
  position: "absolute",
  top: "-2px",
  right: "-2px",
  backgroundColor: "#ef4444",
  color: "white",
  fontSize: "0.65rem",
  fontWeight: 800,
  borderRadius: "9999px",
  minWidth: "16px",
  height: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 4px",
  boxShadow: "0 0 0 2px white",
};

// We will load the keyframe animation inside a custom styles block or rely on CSS. 
// Adding keyframes dynamically in code or client CSS:
if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    @keyframes bellRing {
      0%, 100% { transform: rotate(0); }
      10%, 30% { transform: rotate(15deg); }
      20%, 40% { transform: rotate(-15deg); }
      50% { transform: rotate(10deg); }
      60% { transform: rotate(-10deg); }
      70% { transform: rotate(5deg); }
      80% { transform: rotate(-5deg); }
      90% { transform: rotate(0); }
    }
    @keyframes drawerSlideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `;
  document.head.appendChild(styleTag);
}
