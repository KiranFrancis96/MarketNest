import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  X, 
  Flag, 
  Clock, 
  Lightbulb,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import type { RootState, AppDispatch } from "@/app/store";
import { setProfile, setError, setLoading } from "@/entities/userProfile/model/userProfileSlice";
import { userProfileApi } from "@/entities/userProfile/api/userProfileApi";
import { SectionCard } from "./SectionCard";
import { BasicInformationForm } from "./BasicInformationForm";
import { LifestyleForm } from "./LifestyleForm";
import { FamilyForm } from "./FamilyForm";
import { HomeForm } from "./HomeForm";
import { ShoppingForm } from "./ShoppingForm";
import { PrivacyForm } from "./PrivacyForm";
import { OccupationForm } from "./OccupationForm";
import { TechnologyForm } from "./TechnologyForm";
import { TravelForm } from "./TravelForm";
import { FoodForm } from "./FoodForm";
import { EntertainmentForm } from "./EntertainmentForm";
import { AiPreferencesForm } from "./AiPreferencesForm";
import { calculateSectionCompletion } from "../model/sectionCompletion";
import { useUpdateUserProfile } from "../model/useUpdateUserProfile";
import { HttpStatus } from "@/shared/api/httpStatus";
import { MSG_FAILED_LOAD_PERSONALIZATION } from "@/shared/constants/messages";
import type { ProfileSection } from "@/entities/userProfile/model/types";

interface PersonalizationOverviewCardProps {
  autoOpenOnboardingModal?: boolean;
  onModalCloseAction?: () => void;
}
  
export const PersonalizationOverviewCard: React.FC<PersonalizationOverviewCardProps> = ({
  autoOpenOnboardingModal = false,
  onModalCloseAction,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector((state: RootState) => state.userProfile);
  const user = useSelector((state: RootState) => state.user.user);
  const [activeSection, setActiveSection] = useState<ProfileSection | null>(
    autoOpenOnboardingModal ? "basicInformation" : null
  );
  const { mutateAsync: updateProfile } = useUpdateUserProfile();

  const fetchProfile = async () => {
    dispatch(setLoading(true));
    try {
      const res = await userProfileApi.getUserPersonalizationProfile();
      dispatch(setProfile(res.data.profile));
    } catch (err: any) {
      if (err.response?.status === HttpStatus.NOT_FOUND) {
        dispatch(setProfile(null));
      } else {
        dispatch(setError(err.response?.data?.message || MSG_FAILED_LOAD_PERSONALIZATION));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (profile) {
        // Edit/Review mode: profile already exists, use PUT
        await updateProfile(formData);
        await fetchProfile();
      } else {
        // Create mode: first-time submission, use POST
        await userProfileApi.createUserProfile(formData);
        await fetchProfile();
      }
      setActiveSection(null);
      if (onModalCloseAction) onModalCloseAction();
    } catch (err: any) {
      throw err;
    }
  };

  const getModalTitle = (section: ProfileSection) => {
    switch (section) {
      case "basicInformation":
        return "Basic Information";
      case "lifestyle":
        return "Lifestyle";
      case "family":
        return "Family";
      case "home":
        return "Home & Living";
      case "occupation":
        return "Occupation";
      case "shopping":
        return "Shopping Preferences";
      case "technology":
        return "Technology";
      case "travel":
        return "Travel Preferences";
      case "food":
        return "Food & Dining";
      case "entertainment":
        return "Entertainment & Media";
      case "aiPreferences":
        return "AI Preferences";
      case "privacy":
        return "Privacy Settings";
      default:
        return "";
    }
  };

  const getModalSubtitle = (section: ProfileSection) => {
    switch (section) {
      case "basicInformation":
        return "Help us get the essentials right to personalize your experience.";
      case "lifestyle":
        return "Help us understand your daily routines and habits.";
      case "family":
        return "Help us understand your household composition.";
      case "home":
        return "Help us understand your real estate and living environment.";
      case "occupation":
        return "Tell us about your professional background and work environment.";
      case "shopping":
        return "Help us understand your brand loyalty and habits.";
      case "technology":
        return "Share your hardware, software, and tech usage habits.";
      case "travel":
        return "Tell us about your travel frequency and destination preferences.";
      case "food":
        return "Help us understand your dining preferences and dietary needs.";
      case "entertainment":
        return "Tell us about your media consumption and entertainment choices.";
      case "aiPreferences":
        return "Configure your automation and AI interaction preferences.";
      case "privacy":
        return "Manage your data visibility and AI model usage preferences.";
      default:
        return "";
    }
  };

  const handleProfileUpdate = async (formData: any) => {
    try {
      await updateProfile(formData);
      await fetchProfile();
      setActiveSection(null);
      if (onModalCloseAction) onModalCloseAction();
    } catch (err) {
      throw err;
    }
  };

  const renderActiveForm = (section: ProfileSection) => {
    const handleClose = () => {
      setActiveSection(null);
      if (onModalCloseAction) onModalCloseAction();
    };

    switch (section) {
      case "basicInformation":
        return (
          <BasicInformationForm
            onSubmit={handleFormSubmit}
            onClose={handleClose}
            initialValues={profile?.basicInformation}
          />
        );
      case "lifestyle":
        return (
          <LifestyleForm
            onSubmit={handleProfileUpdate}
            onClose={handleClose}
            initialValues={profile?.lifestyle}
          />
        );
      case "family":
        return (
          <FamilyForm
            onSubmit={handleProfileUpdate}
            onClose={handleClose}
            initialValues={profile?.family}
          />
        );
      case "home":
        return (
          <HomeForm
            onSubmit={handleProfileUpdate}
            onClose={handleClose}
            initialValues={profile?.home}
          />
        );
      case "occupation":
        return (
          <OccupationForm
            onSubmit={handleProfileUpdate}
            onClose={handleClose}
            initialValues={profile?.occupation}
          />
        );
      case "shopping":
        return (
          <ShoppingForm
            onSubmit={handleProfileUpdate}
            onClose={handleClose}
            initialValues={profile?.shopping}
          />
        );
      case "technology":
        return (
          <TechnologyForm
            onSubmit={handleProfileUpdate}
            onClose={handleClose}
            initialValues={profile?.technology}
          />
        );
      case "travel":
        return (
          <TravelForm
            onSubmit={handleProfileUpdate}
            onClose={handleClose}
            initialValues={profile?.travel}
          />
        );
      case "food":
        return (
          <FoodForm
            onSubmit={handleProfileUpdate}
            onClose={handleClose}
            initialValues={profile?.food}
          />
        );
      case "entertainment":
        return (
          <EntertainmentForm
            onSubmit={handleProfileUpdate}
            onClose={handleClose}
            initialValues={profile?.entertainment}
          />
        );
      case "aiPreferences":
        return (
          <AiPreferencesForm
            onSubmit={handleProfileUpdate}
            onClose={handleClose}
            initialValues={profile?.aiPreferences}
          />
        );
      case "privacy":
        return (
          <PrivacyForm
            onSubmit={handleProfileUpdate}
            onClose={handleClose}
            initialValues={profile?.privacy}
          />
        );
      default:
        return null;
    }
  };

  const firstName = user?.firstName || user?.email?.split("@")[0] || "User";

  // Detailed list of 12 sections matching the layout from the image
  const sectionsList = [
    {
      id: "basicInformation",
      title: "Basic Information",
      description: "Identity and contact details",
      reward: "+100 pts",
      estTime: "2 min",
      iconName: "user",
    },
    {
      id: "lifestyle",
      title: "Lifestyle",
      description: "Daily routines and habits",
      reward: "+150 pts",
      estTime: "2 min",
      iconName: "activity",
    },
    {
      id: "family",
      title: "Family",
      description: "Household composition",
      reward: "+100 pts",
      estTime: "2 min",
      iconName: "users",
    },
    {
      id: "home",
      title: "Home & Living",
      description: "Real estate & environment",
      reward: "+200 pts",
      estTime: "3 min",
      iconName: "home",
    },
    {
      id: "occupation",
      title: "Occupation",
      description: "Professional background",
      reward: "+120 pts",
      estTime: "2 min",
      iconName: "briefcase",
    },
    {
      id: "shopping",
      title: "Shopping",
      description: "Brand loyalty & habits",
      reward: "+180 pts",
      estTime: "4 min",
      iconName: "shopping-bag",
    },
    {
      id: "technology",
      title: "Technology",
      description: "Hardware & software usage",
      reward: "+140 pts",
      estTime: "2 min",
      iconName: "monitor",
    },
    {
      id: "travel",
      title: "Travel",
      description: "Frequency and preferences",
      reward: "+160 pts",
      estTime: "3 min",
      iconName: "plane",
    },
    {
      id: "food",
      title: "Food",
      description: "Dining & dietary needs",
      reward: "+100 pts",
      estTime: "2 min",
      iconName: "utensils",
    },
    {
      id: "entertainment",
      title: "Entertainment",
      description: "Media consumption",
      reward: "+120 pts",
      estTime: "3 min",
      iconName: "film",
    },
    {
      id: "aiPreferences",
      title: "AI Preferences",
      description: "Automation & interaction levels",
      reward: "+250 pts",
      estTime: "3 min",
      iconName: "cpu",
    },
    {
      id: "privacy",
      title: "Privacy",
      description: "Data handling & visibility",
      reward: "+100 pts",
      estTime: "1 min",
      iconName: "lock",
    },
  ];

  // Helper to determine progress dynamically based on completed fields
  const getSectionProgress = (sectionId: string) => {
    if (!profile) return 0;
    const sectionData = (profile as any)[sectionId];
    return calculateSectionCompletion(sectionId, sectionData);
  };

  // Helper to determine status dynamically based on section progress
  const getSectionStatus = (sectionId: string) => {
    if (!profile) return "upcoming" as const;
    const progress = getSectionProgress(sectionId);
    if (progress === 100) {
      return "completed" as const;
    }
    const completed = profile.completedSections || [];
    if (completed.includes(sectionId as any)) {
      return "completed" as const;
    }
    if (profile.currentSection === sectionId || progress > 0) {
      return "current" as const;
    }
    return "upcoming" as const;
  };

  // Render SVG circular progress ring
  const renderProgressRing = (percentage: number) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div style={progressRingContainerStyles}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#131926"
            strokeWidth="8"
          />
          {/* Indicator */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#6366f1"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
          />
          {/* Text */}
          <text
            x="50%"
            y="45%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#f8fafc"
            fontSize="14"
            fontWeight="800"
          >
            {percentage}%
          </text>
          <text
            x="50%"
            y="65%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#64748b"
            fontSize="7"
            fontWeight="700"
            letterSpacing="0.05em"
          >
            COMPLETE
          </text>
        </svg>
      </div>
    );
  };

  // If loading and no profile exists yet, show skeleton
  if (loading && !profile) {
    return (
      <div style={skeletonContainerStyles}>
        <div style={skeletonHeaderStyles} />
        <div style={skeletonBodyStyles} />
      </div>
    );
  }

  // If there is an error (other than 404 which clears profile)
  if (error) {
    return (
      <div style={errorContainerStyles}>
        <AlertCircle size={24} color="#ef4444" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={errorTitleStyles}>Something went wrong</span>
          <span style={errorTextStyles}>{error}</span>
          <button onClick={fetchProfile} style={retryBtnStyles}>Try Again</button>
        </div>
      </div>
    );
  }

  // CASE 1: No profile exists (Show Onboarding card)
  if (!profile) {
    return (
      <div style={onboardingContainerStyles}>
        <div style={onboardingBadgeStyles}>
          <Sparkles size={14} color="#a855f7" style={{ marginRight: "0.25rem" }} />
          AI Personalization
        </div>
        
        <h2 style={onboardingTitleStyles}>Build Your AI Profile</h2>
        <p style={onboardingTextStyles}>
          Your AI Concierge becomes smarter as you complete your profile. Unlock tailored recommendations, personalized offers, and exclusive rewards.
        </p>

        <div style={onboardingSpecsStyles}>
          <div style={specItemStyles}>
            <span style={specLabelStyles}>Estimated Time</span>
            <span style={specValueStyles}>2 Minutes</span>
          </div>
          <div style={specDividerStyles} />
          <div style={specItemStyles}>
            <span style={specLabelStyles}>Reward</span>
            <span style={specValueStyles} style={{ color: "#f59e0b" }}>100 Coins</span>
          </div>
        </div>

        <button onClick={() => setActiveSection("basicInformation")} style={startBtnStyles}>
          Start Building <ArrowRight size={16} style={{ marginLeft: "0.5rem" }} />
        </button>

        {activeSection === "basicInformation" && (
          <div className="modal-overlay animate-fadeIn">
            <div className="modal-container" style={modalContainerStyles}>
              <div style={modalHeaderStyles}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles size={20} color="#6366f1" />
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#1e293b" }}>
                    Basic Information
                  </h3>
                </div>
                <button onClick={() => { setActiveSection(null); if (onModalCloseAction) onModalCloseAction(); }} style={modalCloseBtnStyles}>
                  <X size={20} />
                </button>
              </div>
              <p style={modalSubtitleStyles}>Help us get the essentials right to personalize your experience.</p>
              
              <BasicInformationForm 
                onSubmit={handleFormSubmit}
                onClose={() => { setActiveSection(null); if (onModalCloseAction) onModalCloseAction(); }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // CASE 2: Profile exists (Show premium dashboard)
  const completionPercentage = profile.completionPercentage || 12;
  const rewardCoins = profile.rewardCoins || 180;
  const remainingCoins = 1500 - rewardCoins;

  return (
    <div style={dashboardWrapperStyles}>
      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
      
      {/* 2-Column Dashboard Layout */}
      <div style={dashboardColumnsStyles}>
        
        {/* Left main column: Banner + Node Cards */}
        <div style={mainColumnStyles}>
          
          {/* Header Row: Big Banner + AI Concierge Card */}
          <div style={headerRowStyles}>
            
            {/* Build Your AI Profile Banner */}
            <div style={bannerCardStyles}>
              <div style={bannerLeftContentStyles}>
                {renderProgressRing(completionPercentage)}
              </div>
              
              <div style={bannerMiddleContentStyles}>
                <h3 style={bannerTitleStyles}>Build Your AI Profile</h3>
                <p style={bannerSubtitleStyles}>
                  Enhance your digital concierge experience. Completing your profile allows our AI to personalize market insights specifically for your lifestyle.
                </p>
                
                {/* Banner Stats Cards */}
                <div style={bannerStatsRowStyles}>
                  <div style={statBoxStyles}>
                    <span style={statBoxLabelStyles}>CURRENT REWARDS</span>
                    <span style={statBoxValueStyles} style={{ color: "#10b981" }}>{rewardCoins} <span style={statBoxSubTextStyles}>pts</span></span>
                  </div>
                  <div style={statBoxStyles}>
                    <span style={statBoxLabelStyles}>REMAINING</span>
                    <span style={statBoxValueStyles}>{remainingCoins} <span style={statBoxSubTextStyles}>pts</span></span>
                  </div>
                  <div style={statBoxStyles}>
                    <span style={statBoxLabelStyles}>EST. TIME</span>
                    <span style={statBoxValueStyles}>15 <span style={statBoxSubTextStyles}>min</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personalization AI Assistant Card */}
            <div style={aiAssistantCardStyles}>
              <div style={aiHeaderStyles}>
                <div style={aiPulseDotWrapperStyles}>
                  <div style={aiPulseDotStyles} />
                  <div style={aiPulseGlowStyles} />
                </div>
                <div style={aiTitleWrapperStyles}>
                  <span style={aiTitleStyles}>Personalization AI</span>
                  <span style={aiStatusStyles}>ONLINE & ANALYZING</span>
                </div>
              </div>
              
              <p style={aiTextStyles}>
                "Hello {firstName}! I've already mapped your Basic Info. Complete the Lifestyle section next to unlock your first custom market forecast."
              </p>
              
              <button style={askAiBtnStyles} onClick={() => alert("AI Concierge Assistant is ready for your inputs!")}>
                <MessageSquare size={14} style={{ marginRight: "0.5rem" }} /> Ask AI Assistant
              </button>
            </div>

          </div>

          {/* Personalization Nodes Grid */}
          <div style={nodesGridStyles}>
            {sectionsList.map((section) => (
              <SectionCard
                key={section.id}
                id={section.id}
                title={section.title}
                description={section.description}
                reward={section.reward}
                estTime={section.estTime}
                iconName={section.iconName}
                status={getSectionStatus(section.id)}
                progress={getSectionProgress(section.id)}
                onAction={() => setActiveSection(section.id as ProfileSection)}
              />
            ))}
          </div>

        </div>

        {/* Right sidebar column: Achievements + Tip + Coins Target */}
        <div style={sidebarColumnStyles}>
          
          {/* Recent Achievements */}
          <div style={sidebarSectionCardStyles}>
            <span style={sidebarSectionTitleStyles}>RECENT ACHIEVEMENTS</span>
            <div style={achievementsListStyles}>
              <div style={achievementItemStyles}>
                <div style={achievementIconWrapperStyles} style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }}>
                  <Flag size={16} color="#10b981" />
                </div>
                <div style={achievementTextWrapperStyles}>
                  <span style={achievementNameStyles}>First Step Taken</span>
                  <span style={achievementDescStyles}>Completed 1st section</span>
                </div>
              </div>
              <div style={achievementItemStyles}>
                <div style={achievementIconWrapperStyles} style={{ backgroundColor: "rgba(99, 102, 241, 0.15)" }}>
                  <Clock size={16} color="#6366f1" />
                </div>
                <div style={achievementTextWrapperStyles}>
                  <span style={achievementNameStyles}>Early Bird</span>
                  <span style={achievementDescStyles}>Signed up on launch day</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tip of the Day */}
          <div style={sidebarSectionCardStyles}>
            <div style={tipHeaderStyles}>
              <Lightbulb size={18} color="#f59e0b" style={{ marginRight: "0.5rem" }} />
              <span style={sidebarSectionTitleStyles} style={{ margin: 0, color: "#f8fafc" }}>AI Tip of the Day</span>
            </div>
            <p style={tipTextStyles}>
              "Sync your external financial accounts to automatically fill up to 40% of your personalization data instantly."
            </p>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Financial accounts sync is coming soon!"); }} style={tipLinkStyles}>
              Connect Accounts <ArrowRight size={14} style={{ marginLeft: "0.25rem" }} />
            </a>
          </div>

          {/* Points Progress / Total Earned */}
          <div style={sidebarSectionCardStyles}>
            <span style={sidebarSectionTitleStyles}>Total Earned</span>
            <div style={totalEarnedContainerStyles}>
              <span style={totalEarnedValueStyles}>{rewardCoins} <span style={totalEarnedUnitStyles}>MNP</span></span>
            </div>
            
            <div style={coinsTrackContainerStyles}>
              <div style={coinsTrackProgressRowStyles}>
                <div style={coinsTrackBarStyles}>
                  <div style={{ ...coinsTrackFillStyles, width: `${(rewardCoins / 550) * 100}%` }} />
                </div>
              </div>
              <div style={coinsTrackTextRowStyles}>
                <span>Voucher in 550 pts</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {activeSection && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={modalContainerStyles}>
            <div style={modalHeaderStyles}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={20} color="#6366f1" />
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#1e293b" }}>
                  {getModalTitle(activeSection)}
                </h3>
              </div>
              <button onClick={() => { setActiveSection(null); if (onModalCloseAction) onModalCloseAction(); }} style={modalCloseBtnStyles}>
                <X size={20} />
              </button>
            </div>
            <p style={modalSubtitleStyles}>{getModalSubtitle(activeSection)}</p>
            
            {renderActiveForm(activeSection)}
          </div>
        </div>
      )}
    </div>
  );
};

// Styles for the premium, high-fidelity dark personalization panel
const skeletonContainerStyles: React.CSSProperties = {
  backgroundColor: "#080b11",
  borderRadius: "24px",
  padding: "2rem",
  border: "1px solid #1e293b",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  animation: "pulse 2s infinite ease-in-out",
};

const skeletonHeaderStyles: React.CSSProperties = {
  height: "32px",
  width: "250px",
  backgroundColor: "#111625",
  borderRadius: "8px",
};

const skeletonBodyStyles: React.CSSProperties = {
  height: "120px",
  backgroundColor: "#111625",
  borderRadius: "16px",
};

const errorContainerStyles: React.CSSProperties = {
  backgroundColor: "#0d111d",
  borderRadius: "24px",
  padding: "2rem",
  border: "1px solid #ef4444",
  display: "flex",
  alignItems: "flex-start",
  gap: "1rem",
};

const errorTitleStyles: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#f8fafc",
  marginBottom: "0.25rem",
};

const errorTextStyles: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "#94a3b8",
  marginBottom: "1rem",
};

const retryBtnStyles: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
  width: "fit-content",
};

const onboardingContainerStyles: React.CSSProperties = {
  backgroundColor: "#0b0f19",
  border: "1px solid #1e293b",
  borderRadius: "24px",
  padding: "2.5rem 2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
  backgroundImage: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%)",
};

const onboardingBadgeStyles: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#a855f7",
  backgroundColor: "rgba(168, 85, 247, 0.1)",
  padding: "0.35rem 0.75rem",
  borderRadius: "999px",
  marginBottom: "1rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const onboardingTitleStyles: React.CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 800,
  color: "#f8fafc",
  margin: "0 0 0.75rem 0",
  letterSpacing: "-0.02em",
};

const onboardingTextStyles: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "#94a3b8",
  lineHeight: 1.6,
  maxWidth: "500px",
  margin: "0 0 1.5rem 0",
};

const onboardingSpecsStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2rem",
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  border: "1px solid #1e293b",
  padding: "1rem 2rem",
  borderRadius: "16px",
  marginBottom: "2rem",
};

const specItemStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const specLabelStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const specValueStyles: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#f8fafc",
};

const specDividerStyles: React.CSSProperties = {
  width: "1px",
  height: "30px",
  backgroundColor: "#1e293b",
};

const startBtnStyles: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.85rem 2rem",
  borderRadius: "16px",
  border: "none",
  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
  color: "white",
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
  boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.4)",
  transition: "transform 0.2s, box-shadow 0.2s",
};

// Dashboard structure styles
const dashboardWrapperStyles: React.CSSProperties = {
  backgroundColor: "#080b11", // very dark blue slate
  border: "1px solid #1e293b",
  borderRadius: "24px",
  padding: "2rem",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
  backgroundImage: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 45%)",
};

const dashboardColumnsStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "3.2fr 1fr",
  gap: "1.75rem",
};

const mainColumnStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.75rem",
};

const sidebarColumnStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.75rem",
};

const headerRowStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "1.5rem",
};

const bannerCardStyles: React.CSSProperties = {
  backgroundColor: "#111625",
  border: "1px solid #1e293b",
  borderRadius: "20px",
  padding: "2rem",
  display: "flex",
  gap: "1.75rem",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
};

const bannerLeftContentStyles: React.CSSProperties = {
  flexShrink: 0,
};

const bannerMiddleContentStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  flex: 1,
};

const bannerTitleStyles: React.CSSProperties = {
  fontSize: "1.6rem",
  fontWeight: 800,
  color: "#f8fafc",
  margin: 0,
  letterSpacing: "-0.02em",
};

const bannerSubtitleStyles: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#64748b",
  lineHeight: 1.5,
  margin: 0,
};

const bannerStatsRowStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "1rem",
  marginTop: "0.75rem",
};

const statBoxStyles: React.CSSProperties = {
  backgroundColor: "#0d111d",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "0.75rem 1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const statBoxLabelStyles: React.CSSProperties = {
  fontSize: "0.65rem",
  fontWeight: 700,
  color: "#475569",
  letterSpacing: "0.05em",
};

const statBoxValueStyles: React.CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 800,
  color: "#f8fafc",
};

const statBoxSubTextStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#475569",
  fontWeight: 600,
};

// AI Assistant Card Styles
const aiAssistantCardStyles: React.CSSProperties = {
  backgroundColor: "#111625",
  border: "1px solid #1e293b",
  borderRadius: "20px",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: "1rem",
};

const aiHeaderStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const aiPulseDotWrapperStyles: React.CSSProperties = {
  position: "relative",
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  backgroundColor: "rgba(168, 85, 247, 0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const aiPulseDotStyles: React.CSSProperties = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#a855f7",
};

const aiPulseGlowStyles: React.CSSProperties = {
  position: "absolute",
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  backgroundColor: "#a855f7",
  opacity: 0.4,
  animation: "ping 1.5s infinite ease-in-out",
};

const aiTitleWrapperStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const aiTitleStyles: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "#f8fafc",
};

const aiStatusStyles: React.CSSProperties = {
  fontSize: "0.65rem",
  fontWeight: 700,
  color: "#10b981",
  letterSpacing: "0.02em",
};

const aiTextStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "#94a3b8",
  fontStyle: "italic",
  lineHeight: 1.4,
  margin: 0,
};

const askAiBtnStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem",
  borderRadius: "10px",
  border: "1px solid #334155",
  backgroundColor: "transparent",
  color: "#cbd5e1",
  fontSize: "0.85rem",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// Nodes Grid
const nodesGridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "1.25rem",
};

// Sidebar section elements
const sidebarSectionCardStyles: React.CSSProperties = {
  backgroundColor: "#111625",
  border: "1px solid #1e293b",
  borderRadius: "20px",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const sidebarSectionTitleStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const achievementsListStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const achievementItemStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const achievementIconWrapperStyles: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const achievementTextWrapperStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.15rem",
};

const achievementNameStyles: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "#f8fafc",
};

const achievementDescStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
};

const tipHeaderStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const tipTextStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "#94a3b8",
  lineHeight: 1.4,
  margin: 0,
  fontStyle: "italic",
};

const tipLinkStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#6366f1",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  marginTop: "0.25rem",
};

const totalEarnedContainerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
};

const totalEarnedValueStyles: React.CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 800,
  color: "#f8fafc",
};

const totalEarnedUnitStyles: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "#64748b",
  marginLeft: "0.25rem",
};

const coinsTrackContainerStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const coinsTrackProgressRowStyles: React.CSSProperties = {
  width: "100%",
};

const coinsTrackBarStyles: React.CSSProperties = {
  width: "100%",
  height: "6px",
  backgroundColor: "#0d111d",
  borderRadius: "99px",
  overflow: "hidden",
};

const coinsTrackFillStyles: React.CSSProperties = {
  height: "100%",
  backgroundColor: "#6366f1",
  borderRadius: "99px",
};

const coinsTrackTextRowStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  fontSize: "0.75rem",
  color: "#64748b",
  fontWeight: 600,
};

const progressRingContainerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100px",
  height: "100px",
};

const modalContainerStyles: React.CSSProperties = {
  maxWidth: "600px",
  width: "90%",
  borderRadius: "24px",
  padding: "2rem",
  backgroundColor: "#f8fafc",
};

const modalHeaderStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.25rem",
};

const modalSubtitleStyles: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "#64748b",
  margin: "0 0 1.5rem 0",
};

const modalCloseBtnStyles: React.CSSProperties = {
  fontSize: "1.5rem",
  border: "none",
  background: "none",
  cursor: "pointer",
  color: "#64748b",
  padding: 0,
};
