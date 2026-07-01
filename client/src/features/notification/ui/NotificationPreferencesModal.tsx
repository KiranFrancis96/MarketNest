import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import { fetchPreferences, updatePreferences } from "../model/notificationSlice";
import { X, Settings2, BellOff, BellRing, Save } from "lucide-react";

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const preferences = useSelector((state: RootState) => state.notification.preferences);
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(true);
  const [orderEnabled, setOrderEnabled] = useState(true);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(21);
  const [frequency, setFrequency] = useState("IMMEDIATE");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPreferences());
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (preferences) {
      setPushEnabled(preferences.pushEnabled);
      setChatbotEnabled(preferences.chatbotEnabled);
      setMarketingEnabled(preferences.marketingEnabled);
      setOrderEnabled(preferences.orderEnabled);
      setStartHour(preferences.startHour);
      setEndHour(preferences.endHour);
      setFrequency(preferences.notificationFrequency);
    }
  }, [preferences]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(
        updatePreferences({
          pushEnabled,
          chatbotEnabled,
          marketingEnabled,
          orderEnabled,
          startHour,
          endHour,
          notificationFrequency: frequency,
        })
      ).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to update preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div style={overlayStyles} onClick={handleOverlayClick}>
      <div style={modalStyles} onClick={handleModalClick}>
        <div style={headerStyles}>
          <div style={titleWrapperStyles}>
            <Settings2 size={20} color="var(--primary)" />
            <h3 style={titleStyles}>Notification Preferences</h3>
          </div>
          <button onClick={onClose} style={closeBtnStyles}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyles}>
          {/* Main Push Toggle */}
          <div style={pushToggleContainer(pushEnabled)}>
            <div style={pushToggleTextWrapper}>
              <span style={pushToggleTitleStyles}>
                {pushEnabled ? <BellRing size={18} /> : <BellOff size={18} />}
                Push Notifications
              </span>
              <p style={pushToggleDescStyles}>
                Enable or disable all notifications sent directly to your device
              </p>
            </div>
            <label style={switchLabelStyles}>
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={(e) => setPushEnabled(e.target.checked)}
                style={hiddenCheckboxStyles}
              />
              <div style={sliderStyles(pushEnabled)}>
                <div style={circleStyles(pushEnabled)} />
              </div>
            </label>
          </div>

          {/* Categorized Preferences */}
          <div style={sectionStyles}>
            <h4 style={sectionTitleStyles}>Notification Categories</h4>
            <div style={checkboxGroupStyles}>
              <label style={checkboxLabelStyles}>
                <input
                  type="checkbox"
                  checked={chatbotEnabled}
                  onChange={(e) => setChatbotEnabled(e.target.checked)}
                  style={checkboxStyles}
                />
                <div>
                  <span style={checkboxTextStyles}>Chatbot Prompts & Reminders</span>
                  <p style={checkboxDescStyles}>AI-generated chats and routine prompts</p>
                </div>
              </label>

              <label style={checkboxLabelStyles}>
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={(e) => setMarketingEnabled(e.target.checked)}
                  style={checkboxStyles}
                />
                <div>
                  <span style={checkboxTextStyles}>Product Recommendations</span>
                  <p style={checkboxDescStyles}>Special offers, customized catalog matches</p>
                </div>
              </label>

              <label style={checkboxLabelStyles}>
                <input
                  type="checkbox"
                  checked={orderEnabled}
                  onChange={(e) => setOrderEnabled(e.target.checked)}
                  style={checkboxStyles}
                />
                <div>
                  <span style={checkboxTextStyles}>Order Updates & Payments</span>
                  <p style={checkboxDescStyles}>Shipping changes, purchase invoices, billing receipts</p>
                </div>
              </label>
            </div>
          </div>

          {/* Start/End Quiet Hours */}
          <div style={sectionStyles}>
            <h4 style={sectionTitleStyles}>Active Window (Quiet Hours)</h4>
            <p style={checkboxDescStyles} style={{ marginBottom: "0.75rem" }}>
              Define when you want to receive real-time push alerts. Alerts outside this window are saved to your inbox without buzzing your device.
            </p>
            <div style={hoursGroupStyles}>
              <div style={hourSelectStyles}>
                <label style={selectLabelStyles}>Allowed From</label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  style={selectStyles}
                >
                  {Array.from({ length: 24 }).map((_, idx) => (
                    <option key={idx} value={idx}>
                      {idx.toString().padStart(2, "0")}:00 ({idx < 12 ? `${idx === 0 ? 12 : idx} AM` : `${idx === 12 ? 12 : idx - 12} PM`})
                    </option>
                  ))}
                </select>
              </div>

              <div style={hourSelectStyles}>
                <label style={selectLabelStyles}>Allowed Until</label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  style={selectStyles}
                >
                  {Array.from({ length: 24 }).map((_, idx) => (
                    <option key={idx} value={idx}>
                      {idx.toString().padStart(2, "0")}:00 ({idx < 12 ? `${idx === 0 ? 12 : idx} AM` : `${idx === 12 ? 12 : idx - 12} PM`})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Delivery Frequency */}
          <div style={sectionStyles}>
            <div style={hourSelectStyles}>
              <label style={selectLabelStyles}>Delivery Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={selectStyles}
              >
                <option value="IMMEDIATE">Immediate (Real-Time)</option>
                <option value="DAILY">Daily Digest</option>
                <option value="WEEKLY">Weekly Digest</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={footerStyles}>
            <button type="button" onClick={onClose} style={cancelBtnStyles}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={saveBtnStyles}>
              <Save size={16} />
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
const overlayStyles: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyles: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "500px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  overflow: "hidden",
  border: "1px solid var(--border)",
  display: "flex",
  flexDirection: "column",
};

const headerStyles: React.CSSProperties = {
  padding: "1.25rem 1.5rem",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const titleWrapperStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const titleStyles: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "var(--text-main)",
};

const closeBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--text-muted)",
  padding: "4px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
};

const formStyles: React.CSSProperties = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
  maxHeight: "80vh",
  overflowY: "auto",
};

const pushToggleContainer = (enabled: boolean): React.CSSProperties => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: enabled ? "rgba(79, 70, 229, 0.06)" : "#f8fafc",
  padding: "1rem",
  borderRadius: "12px",
  border: enabled ? "1px solid rgba(79, 70, 229, 0.2)" : "1px solid var(--border)",
  transition: "all 0.25s ease",
});

const pushToggleTextWrapper: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  maxWidth: "80%",
};

const pushToggleTitleStyles: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "var(--text-main)",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const pushToggleDescStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--text-muted)",
  lineHeight: 1.4,
};

const switchLabelStyles: React.CSSProperties = {
  position: "relative",
  display: "inline-block",
  width: "48px",
  height: "26px",
  cursor: "pointer",
};

const hiddenCheckboxStyles: React.CSSProperties = {
  opacity: 0,
  width: 0,
  height: 0,
};

const sliderStyles = (checked: boolean): React.CSSProperties => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: checked ? "var(--primary)" : "#cbd5e1",
  borderRadius: "34px",
  transition: "0.3s",
  display: "flex",
  alignItems: "center",
  padding: "2px",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
});

const circleStyles = (checked: boolean): React.CSSProperties => ({
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  backgroundColor: "white",
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  transition: "0.3s",
  transform: checked ? "translateX(22px)" : "translateX(0)",
});

const sectionStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const sectionTitleStyles: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid var(--border)",
  paddingBottom: "0.35rem",
};

const checkboxGroupStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  marginTop: "0.25rem",
};

const checkboxLabelStyles: React.CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  cursor: "pointer",
  alignItems: "flex-start",
};

const checkboxStyles: React.CSSProperties = {
  marginTop: "3px",
  width: "16px",
  height: "16px",
  accentColor: "var(--primary)",
};

const checkboxTextStyles: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "var(--text-main)",
};

const checkboxDescStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--text-muted)",
  lineHeight: 1.3,
};

const hoursGroupStyles: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  marginTop: "0.25rem",
};

const hourSelectStyles: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
};

const selectLabelStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--text-main)",
};

const selectStyles: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  backgroundColor: "white",
  fontSize: "0.875rem",
  color: "var(--text-main)",
  outline: "none",
  fontFamily: "inherit",
};

const footerStyles: React.CSSProperties = {
  borderTop: "1px solid var(--border)",
  padding: "1rem 1.5rem",
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.75rem",
  backgroundColor: "#f8fafc",
};

const cancelBtnStyles: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  backgroundColor: "white",
  color: "var(--text-muted)",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.875rem",
};

const saveBtnStyles: React.CSSProperties = {
  padding: "0.5rem 1.25rem",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "var(--primary)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.875rem",
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
};
