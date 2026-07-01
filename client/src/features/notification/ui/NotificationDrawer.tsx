import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotification,
  type Notification,
} from "../model/notificationSlice";
import { NotificationPreferencesModal } from "./NotificationPreferencesModal";
import { X, Trash2, Check, Settings, Inbox, Bell } from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading } = useSelector((state: RootState) => state.notification);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  if (!isOpen) return null;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(markNotificationAsRead(id));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  // Helper to format timestamps relatively
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "CHATBOT_PROMPT":
        return "#8b5cf6"; // Purple
      case "PRODUCT_RECOMMENDATION":
        return "#ec4899"; // Pink
      case "ORDER_UPDATE":
      case "PAYMENT_SUCCESS":
        return "#10b981"; // Green
      case "SYSTEM":
      case "ADMIN":
        return "#3b82f6"; // Blue
      default:
        return "#6b7280"; // Gray
    }
  };

  return (
    <div style={backdropStyles} onClick={onClose}>
      <div style={drawerStyles} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyles}>
          <div style={headerTitleWrapper}>
            <Bell size={20} color="var(--primary)" />
            <h3 style={titleStyles}>Notifications</h3>
            {notifications.length > 0 && (
              <span style={countBadgeStyles}>
                {notifications.filter((n) => !n.isRead).length} unread
              </span>
            )}
          </div>
          <div style={headerActionsWrapper}>
            <button
              onClick={() => setIsPrefsOpen(true)}
              style={iconBtnStyles}
              title="Notification Settings"
            >
              <Settings size={18} />
            </button>
            <button onClick={onClose} style={iconBtnStyles} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={bodyStyles}>
          {loading ? (
            <div style={placeholderStyles}>
              <div style={spinnerStyles} className="animate-spin" />
              <p style={placeholderTextStyles}>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={placeholderStyles}>
              <Inbox size={48} color="var(--text-muted)" style={{ opacity: 0.5 }} />
              <p style={placeholderTitleStyles}>Inbox is empty</p>
              <p style={placeholderTextStyles}>
                You have no notifications yet.
              </p>
            </div>
          ) : (
            <div style={listStyles}>
              {notifications.map((item: Notification) => (
                <div
                  key={item._id}
                  style={itemContainerStyles(item.isRead)}
                  onClick={(e) => !item.isRead && handleMarkAsRead(item._id, e)}
                >
                  {/* Category Pill Tag */}
                  <div style={itemHeaderStyles}>
                    <span
                      style={categoryPillStyles(getCategoryColor(item.type))}
                    >
                      {item.type.replace("_", " ")}
                    </span>
                    <span style={timeStyles}>{formatTimeAgo(item.createdAt)}</span>
                  </div>

                  {/* Title & Message */}
                  <h4 style={itemTitleStyles(item.isRead)}>{item.title}</h4>
                  <p style={itemMsgStyles(item.isRead)}>{item.message}</p>

                  {/* Action Buttons */}
                  <div style={itemActionsStyles}>
                    {!item.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(item._id, e)}
                        style={actionBtnStyles("#4f46e5", "rgba(79, 70, 229, 0.08)")}
                        title="Mark as Read"
                      >
                        <Check size={14} />
                        <span>Mark read</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(item._id, e)}
                      style={actionBtnStyles("#ef4444", "rgba(239, 68, 68, 0.08)")}
                      title="Delete notification"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Unread indicator dot */}
                  {!item.isRead && <div style={unreadIndicatorDot} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
      />
    </div>
  );
};

// Styles
const backdropStyles: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(15, 23, 42, 0.35)",
  backdropFilter: "blur(6px)",
  zIndex: 100,
  display: "flex",
  justifyContent: "flex-end",
};

const drawerStyles: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "var(--surface)",
  height: "100%",
  boxShadow: "-10px 0 25px -5px rgba(0, 0, 0, 0.1), -10px 0 10px -5px rgba(0, 0, 0, 0.04)",
  display: "flex",
  flexDirection: "column",
  animation: "drawerSlideIn 0.3s ease-out forwards",
  borderLeft: "1px solid var(--border)",
};

const headerStyles: React.CSSProperties = {
  padding: "1.25rem 1.5rem",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const headerTitleWrapper: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const titleStyles: React.CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "var(--text-main)",
};

const countBadgeStyles: React.CSSProperties = {
  backgroundColor: "rgba(79, 70, 229, 0.1)",
  color: "var(--primary)",
  fontSize: "0.75rem",
  fontWeight: 700,
  padding: "2px 8px",
  borderRadius: "99px",
};

const headerActionsWrapper: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

const iconBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--text-muted)",
  padding: "6px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
};

const bodyStyles: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  backgroundColor: "#f8fafc",
};

const placeholderStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: "3rem",
  textAlign: "center",
};

const placeholderTitleStyles: React.CSSProperties = {
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "var(--text-main)",
  marginTop: "1rem",
  marginBottom: "0.25rem",
};

const placeholderTextStyles: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--text-muted)",
  lineHeight: 1.4,
};

const spinnerStyles: React.CSSProperties = {
  width: "32px",
  height: "32px",
  border: "3px solid rgba(79, 70, 229, 0.1)",
  borderTopColor: "var(--primary)",
  borderRadius: "50%",
  marginBottom: "1rem",
};

const listStyles: React.CSSProperties = {
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const itemContainerStyles = (isRead: boolean): React.CSSProperties => ({
  position: "relative",
  backgroundColor: isRead ? "var(--surface)" : "#ffffff",
  border: isRead ? "1px solid var(--border)" : "1px solid rgba(79, 70, 229, 0.15)",
  borderRadius: "12px",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  cursor: isRead ? "default" : "pointer",
  boxShadow: isRead ? "none" : "0 4px 12px rgba(79, 70, 229, 0.04)",
  transition: "all 0.2s ease",
});

const itemHeaderStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const categoryPillStyles = (color: string): React.CSSProperties => ({
  fontSize: "0.65rem",
  fontWeight: 750,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color,
  backgroundColor: `${color}15`,
  padding: "2px 8px",
  borderRadius: "4px",
});

const timeStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--text-muted)",
  fontWeight: 500,
};

const itemTitleStyles = (isRead: boolean): React.CSSProperties => ({
  fontSize: "0.9rem",
  fontWeight: isRead ? 600 : 700,
  color: isRead ? "#334155" : "var(--text-main)",
  lineHeight: 1.3,
});

const itemMsgStyles = (isRead: boolean): React.CSSProperties => ({
  fontSize: "0.85rem",
  color: isRead ? "#64748b" : "#334155",
  lineHeight: 1.4,
  fontWeight: isRead ? 400 : 500,
});

const itemActionsStyles: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  marginTop: "0.25rem",
};

const actionBtnStyles = (color: string, hoverBg: string): React.CSSProperties => ({
  background: "none",
  border: "none",
  cursor: "pointer",
  color,
  fontSize: "0.75rem",
  fontWeight: 600,
  padding: "4px 8px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  transition: "background-color 0.2s ease",
  backgroundColor: hoverBg,
});

const unreadIndicatorDot: React.CSSProperties = {
  position: "absolute",
  top: "10px",
  right: "10px",
  width: "8px",
  height: "8px",
  backgroundColor: "var(--primary)",
  borderRadius: "50%",
};
