import React from "react";
import { Coins, Award } from "lucide-react";

interface RewardCardProps {
  coins: number;
}

export const RewardCard: React.FC<RewardCardProps> = ({ coins }) => {
  return (
    <div style={cardStyles}>
      <div style={iconContainerStyles}>
        <Coins size={24} color="#f59e0b" />
      </div>
      <div style={contentStyles}>
        <span style={titleStyles}>Reward Coins</span>
        <span style={coinsStyles}>{coins} Coins Earned</span>
      </div>
      <Award size={20} color="#94a3b8" style={{ marginLeft: "auto", opacity: 0.8 }} />
    </div>
  );
};

const cardStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.25rem",
  borderRadius: "16px",
  backgroundColor: "#1e293b", // slate-800
  border: "1px solid #334155", // slate-700
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const iconContainerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  backgroundColor: "rgba(245, 158, 11, 0.1)", // amber-500 with opacity
};

const contentStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const titleStyles: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#94a3b8", // slate-400
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const coinsStyles: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "#f59e0b", // amber-500
};
