import React from "react";
import { 
  CheckCircle2, 
  Lock, 
  User, 
  Activity, 
  Users, 
  Home as HomeIcon, 
  ShoppingBag, 
  Briefcase, 
  Monitor, 
  Plane, 
  Utensils, 
  Film, 
  Cpu 
} from "lucide-react";

interface SectionCardProps {
  id: string;
  title: string;
  description: string;
  reward: string;
  estTime: string;
  iconName: string;
  status: "completed" | "current" | "upcoming";
  progress: number;
  onAction?: () => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  id,
  title,
  description,
  reward,
  estTime,
  iconName,
  status,
  progress,
  onAction,
}) => {
  
  // Render icon dynamically
  const renderIcon = () => {
    const iconProps = { size: 20, color: status === "upcoming" ? "#64748b" : "#6366f1" };
    switch (iconName) {
      case "user":
        return <User {...iconProps} />;
      case "activity":
        return <Activity {...iconProps} />;
      case "users":
        return <Users {...iconProps} />;
      case "home":
        return <HomeIcon {...iconProps} />;
      case "briefcase":
        return <Briefcase {...iconProps} />;
      case "shopping-bag":
        return <ShoppingBag {...iconProps} />;
      case "monitor":
        return <Monitor {...iconProps} />;
      case "plane":
        return <Plane {...iconProps} />;
      case "utensils":
        return <Utensils {...iconProps} />;
      case "film":
        return <Film {...iconProps} />;
      case "cpu":
        return <Cpu {...iconProps} />;
      case "lock":
        return <Lock {...iconProps} />;
      default:
        return <User {...iconProps} />;
    }
  };

  const isInteractive = id === "basicInformation" || (status === "current");

  return (
    <div 
      style={{
        ...cardStyles,
        ...(status === "current" ? currentCardStyles : {}),
        ...(status === "upcoming" ? upcomingCardStyles : {}),
      }}
    >
      {/* Header of the Card */}
      <div style={headerStyles}>
        <div 
          style={{
            ...iconWrapperStyles,
            backgroundColor: 
              status === "completed" 
                ? "rgba(34, 197, 94, 0.1)"
                : status === "current"
                  ? "rgba(99, 102, 241, 0.15)"
                  : "rgba(30, 41, 59, 0.5)",
          }}
        >
          {renderIcon()}
        </div>
        
        {/* Badge or Checkmark */}
        <div style={statusWrapperStyles}>
          {status === "completed" && (
            <div style={completedBadgeStyles}>
              <CheckCircle2 size={16} color="#10b981" />
            </div>
          )}
          {status === "current" && (
            <span style={resumeBadgeStyles}>
              {id === "basicInformation" ? "RESUME" : "START"}
            </span>
          )}
          {status === "upcoming" && (
            <span style={rewardPointsTextStyles}>{reward}</span>
          )}
        </div>
      </div>

      {/* Body Info */}
      <div style={bodyStyles}>
        <h4 style={titleStyles}>{title}</h4>
        <p style={descriptionStyles}>{description}</p>
      </div>

      {/* Progress Bar section */}
      <div style={progressContainerStyles}>
        <div style={progressLabelsStyles}>
          <span style={progressLabelStyles}>
            {status === "completed" ? "Completion" : "Progress"}
          </span>
          <span 
            style={{
              ...progressValueStyles,
              color: status === "completed" ? "#10b981" : status === "current" ? "#818cf8" : "#64748b"
            }}
          >
            {progress}%
          </span>
        </div>
        <div style={progressTrackStyles}>
          <div 
            style={{
              ...progressBarStyles,
              width: `${progress}%`,
              backgroundColor: status === "completed" ? "#10b981" : "#6366f1",
            }}
          />
        </div>
      </div>

      {/* Action Button */}
      <div style={actionWrapperStyles}>
        {status === "completed" && (
          <button onClick={onAction} style={reviewBtnStyles}>
            Review
          </button>
        )}
        {status === "current" && (
          <button 
            onClick={onAction} 
            style={{
              ...continueBtnStyles,
              // If it's not basic info, it's just a visual continue button (disabled under the hood or shows coming soon)
              cursor: id === "basicInformation" ? "pointer" : "not-allowed",
              opacity: id === "basicInformation" ? 1 : 0.8,
            }}
          >
            {id === "basicInformation" ? "Continue" : `Start (${estTime})`}
          </button>
        )}
        {status === "upcoming" && (
          <button 
            disabled 
            style={
              id === "aiPreferences" 
                ? priorityBtnStyles 
                : startBtnStyles
            }
          >
            {id === "aiPreferences" ? "Start Priority" : `Start (${estTime})`}
          </button>
        )}
      </div>
    </div>
  );
};

// CSS Styles matching premium dark card theme
const cardStyles: React.CSSProperties = {
  backgroundColor: "#111625", // dark bluish gray
  border: "1px solid #1e293b",
  borderRadius: "18px",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
  transition: "all 0.25s ease",
  position: "relative",
};

const currentCardStyles: React.CSSProperties = {
  backgroundColor: "#12132e", // indigo hue dark background
  border: "1px solid #4f46e5",
  boxShadow: "0 0 15px rgba(79, 70, 229, 0.2)",
};

const upcomingCardStyles: React.CSSProperties = {
  backgroundColor: "#0d111d",
  border: "1px solid #1e293b",
  opacity: 0.8,
};

const headerStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const iconWrapperStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "38px",
  height: "38px",
  borderRadius: "10px",
};

const statusWrapperStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const completedBadgeStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  backgroundColor: "rgba(16, 185, 129, 0.15)",
};

const resumeBadgeStyles: React.CSSProperties = {
  fontSize: "0.65rem",
  fontWeight: 800,
  color: "#a855f7",
  backgroundColor: "rgba(168, 85, 247, 0.15)",
  padding: "0.25rem 0.5rem",
  borderRadius: "6px",
  letterSpacing: "0.05em",
};

const rewardPointsTextStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#94a3b8", // slate-400
};

const bodyStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const titleStyles: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#f8fafc",
  margin: 0,
};

const descriptionStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "#64748b", // slate-500
  margin: 0,
  lineHeight: 1.3,
};

const progressContainerStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  marginTop: "0.5rem",
};

const progressLabelsStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const progressLabelStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  fontWeight: 500,
};

const progressValueStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
};

const progressTrackStyles: React.CSSProperties = {
  width: "100%",
  height: "4px",
  backgroundColor: "#1e293b",
  borderRadius: "99px",
  overflow: "hidden",
};

const progressBarStyles: React.CSSProperties = {
  height: "100%",
  borderRadius: "99px",
  transition: "width 0.3s ease",
};

const actionWrapperStyles: React.CSSProperties = {
  marginTop: "0.5rem",
  width: "100%",
};

const reviewBtnStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem",
  borderRadius: "10px",
  border: "1px solid #334155",
  backgroundColor: "#1e293b",
  color: "#94a3b8",
  fontSize: "0.85rem",
  fontWeight: 700,
  cursor: "pointer",
};

const continueBtnStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
  color: "white",
  fontSize: "0.85rem",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(99, 102, 241, 0.2)",
};

const startBtnStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem",
  borderRadius: "10px",
  border: "1px solid #1e293b",
  backgroundColor: "rgba(30, 41, 59, 0.2)",
  color: "#475569",
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "not-allowed",
};

const priorityBtnStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem",
  borderRadius: "10px",
  border: "1px solid rgba(168, 85, 247, 0.4)",
  backgroundColor: "transparent",
  color: "#d8b4fe", // light purple
  fontSize: "0.85rem",
  fontWeight: 700,
  cursor: "not-allowed",
};
