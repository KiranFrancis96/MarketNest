import React, { useState, useEffect } from "react";

interface OtpTimerProps {
  onResend: () => Promise<void>;
  initialSeconds?: number;
}

export const OtpTimer: React.FC<OtpTimerProps> = ({ onResend, initialSeconds = 60 }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (seconds > 0) {
      timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setSeconds(initialSeconds);
      setCanResend(false);
    } catch (error) {
      console.error("Failed to resend OTP", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
      {!canResend ? (
        <p style={{ color: "var(--text-muted)" }}>
          Resend OTP in <span style={{ color: "var(--primary)", fontWeight: "600" }}>{seconds}s</span>
        </p>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontWeight: "600",
            cursor: "pointer",
            padding: "0.5rem",
            textDecoration: "underline",
          }}
        >
          {isResending ? "Resending..." : "Resend OTP"}
        </button>
      )}
    </div>
  );
};
