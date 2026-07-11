import React, { createContext, useContext, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ---- Types ----
type AlertType = "success" | "error" | "warning" | "info";

interface AlertState {
  isOpen: boolean;
  message: string;
  type: AlertType;
}

interface AlertModalContextValue {
  showAlert: (message: string, type?: AlertType) => void;
}

// ---- Context ----
const AlertModalContext = createContext<AlertModalContextValue | null>(null);

// ---- Hook ----
export const useAlertModal = (): AlertModalContextValue => {
  const ctx = useContext(AlertModalContext);
  if (!ctx) {
    throw new Error("useAlertModal must be used within an AlertModalProvider");
  }
  return ctx;
};

// ---- Icons per type ----
const ICON_MAP: Record<AlertType, React.ReactNode> = {
  success: <CheckCircle size={32} />,
  error: <XCircle size={32} />,
  warning: <AlertTriangle size={32} />,
  info: <Info size={32} />,
};

const TITLE_MAP: Record<AlertType, string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Notice",
};

// ---- Provider ----
export const AlertModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showAlert = useCallback((message: string, type: AlertType = "info") => {
    setAlert({ isOpen: true, message, type });
  }, []);

  const handleClose = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AlertModalContext.Provider value={{ showAlert }}>
      {children}
      {alert.isOpen &&
        ReactDOM.createPortal(
          <div className="modal-overlay" onClick={handleClose}>
            <div
              className="modal-container alert-modal-container"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "420px" }}
            >
              <div className="modal-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div className={`alert-modal-icon alert-modal-icon-${alert.type}`}>
                    {ICON_MAP[alert.type]}
                  </div>
                  <h3 className="modal-title">{TITLE_MAP[alert.type]}</h3>
                </div>
                <button className="modal-close" onClick={handleClose}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body" style={{ paddingTop: "0.75rem" }}>
                <p className="alert-modal-message">{alert.message}</p>
              </div>
              <div className="modal-footer">
                <button
                  className={`alert-modal-btn alert-modal-btn-${alert.type}`}
                  onClick={handleClose}
                >
                  OK
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </AlertModalContext.Provider>
  );
};
