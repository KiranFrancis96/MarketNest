import React from "react";

interface ProfileCompletionBarProps {
  percentage: number;
}

export const ProfileCompletionBar: React.FC<ProfileCompletionBarProps> = ({ percentage }) => {
  return (
    <div style={containerStyles}>
      <div style={textRowStyles}>
        <span style={titleStyles}>Profile Completion</span>
        <span style={percentageStyles}>{percentage}% Complete</span>
      </div>
      <div style={trackStyles}>
        <div 
          style={{
            ...barStyles,
            width: `${percentage}%`,
          }} 
        />
      </div>
    </div>
  );
};

const containerStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  width: "100%",
};

const textRowStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const titleStyles: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "#94a3b8", // slate-400
};

const percentageStyles: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "#38bdf8", // sky-400
};

const trackStyles: React.CSSProperties = {
  width: "100%",
  height: "8px",
  backgroundColor: "#1e293b", // slate-800
  borderRadius: "999px",
  overflow: "hidden",
};

const barStyles: React.CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)", // indigo-500 to sky-400
  borderRadius: "999px",
  transition: "width 0.5s ease-out",
};
