import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import type { User } from "@/entities/admin/model/types";
import { updateUserAction, deleteUserAction, setError } from "@/entities/admin/model/adminSlice";
import { adminApi } from "@/entities/admin/api/adminApi";
import { useAlertModal } from "@/shared/ui/AlertModalContext";
import { Modal } from "@/shared/ui/Modal";
import { orderApi } from "@/entities/order/api/orderApi";
import { 
  ArrowLeft, 
  User as UserIcon, 
  ShieldCheck, 
  ShieldAlert, 
  Save, 
  X, 
  Trash2,
  Edit2
} from "lucide-react";

interface UserDetailsViewProps {
  user: User;
  onBack: () => void;
}

export const UserDetailsView: React.FC<UserDetailsViewProps> = ({ user, onBack }) => {
  const dispatch = useDispatch();
  const { showAlert } = useAlertModal();

  // Local state for edit fields
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [isBlocked, setIsBlocked] = useState(user.isBlocked);
  const [isVerified, setIsVerified] = useState(user.isVerified);
  
  // Custom mock details matching screenshot
  const [mobileNumber, setMobileNumber] = useState("+91 98765 43210");
  const [language, setLanguage] = useState("English (IN)");
  const [joinDate] = useState(user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "October 14, 2023");
  const [lastLogin] = useState("2 hours ago (10.20.14.32)");
  
  const [spendingAmount, setSpendingAmount] = useState<number>(0);
  const rewards = "0 pts";
  const [profilePic, setProfilePic] = useState<string | undefined>(user.profilePic);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert("Image size should be less than 2MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const res = await orderApi.getAdminUserHistory(user._id);
        if (isMounted) {
          const total = res.data.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
          setSpendingAmount(total);
        }
      } catch (err) {
        console.error("Failed to fetch user history for spending info", err);
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [user._id]);

  const formattedSpending = `₹ ${spendingAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Sync block status to DB if it changed
      if (isBlocked !== user.isBlocked) {
        if (isBlocked) {
          await adminApi.blockUser(user._id);
        } else {
          await adminApi.unblockUser(user._id);
        }
      }

      // Save changes to database
      await adminApi.updateUser(user._id, {
        firstName,
        lastName,
        email,
        profilePic,
      });

      // Update in local redux state
      const updatedUser: User = {
        ...user,
        firstName,
        lastName,
        email,
        isBlocked,
        isVerified,
        profilePic,
      };
      dispatch(updateUserAction(updatedUser));
      showAlert("User details updated successfully!", "success");
      onBack();
    } catch (err) {
      console.error("Save user details failed", err);
      showAlert("Failed to update user details.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false);
    setDeleting(true);
    try {
      // If we had a delete api, we would call it here e.g. await adminApi.deleteUser(user._id);
      dispatch(deleteUserAction(user._id));
      showAlert("User account has been permanently deleted.", "success");
      onBack();
    } catch (err) {
      console.error("Delete user failed", err);
      showAlert("Failed to delete user account.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="details-page-wrapper">
      {/* Navigation Breadcrumbs */}
      <div className="flex justify-between items-center" style={{ width: "100%" }}>
        <div className="breadcrumbs">
          User Management &gt; <span className="current">Edit User</span>
        </div>
        <button onClick={onBack} className="btn-secondary-white" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ArrowLeft size={16} />
          <span>Back to List</span>
        </button>
      </div>

      <div className="details-title-row">
        <h1>Edit User - {firstName} {lastName}</h1>
      </div>

      <div className="details-layout-grid">
        {/* Left Column (Forms) */}
        <form onSubmit={handleSave}>
          {/* Card 1: Basic Information */}
          <div className="details-card">
            <div className="details-card-title-row">
              <UserIcon size={18} style={{ color: "#e15b24" }} />
              <span>Basic Information</span>
            </div>

            <div className="details-avatar-block">
              <div 
                className="details-avatar-circle-wrapper" 
                onClick={handleAvatarClick} 
                style={{ cursor: "pointer" }}
                title="Click to upload profile picture"
              >
                <div className="details-avatar-circle" style={{ overflow: "hidden" }}>
                  {profilePic ? (
                    <img 
                      src={profilePic} 
                      alt="Profile" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  ) : (
                    `${firstName[0]}${lastName[0]}`
                  )}
                </div>
                <div className="details-avatar-edit-btn">
                  <Edit2 size={12} />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: "none" }} 
              />
              <div className="details-avatar-info">
                <div className="details-avatar-title">Profile Picture</div>
                <div className="details-avatar-subtitle">JPG, GIF or PNG. Max size of 2MB</div>
              </div>
            </div>

            <div className="details-form-grid">
              <div className="details-form-group">
                <label className="details-form-label">First Name</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  className="details-form-input"
                  required
                />
              </div>

              <div className="details-form-group">
                <label className="details-form-label">Last Name</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  className="details-form-input"
                  required
                />
              </div>

              <div className="details-form-group">
                <label className="details-form-label">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="details-form-input"
                  required
                />
              </div>

              <div className="details-form-group">
                <label className="details-form-label">Mobile Number</label>
                <input 
                  type="text" 
                  value={mobileNumber} 
                  onChange={(e) => setMobileNumber(e.target.value)} 
                  className="details-form-input"
                />
              </div>

              <div className="details-form-group">
                <label className="details-form-label">Language Preference</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)} 
                  className="details-form-input"
                >
                  <option value="English (IN)">English (IN)</option>
                  <option value="English (US)">English (US)</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>

              <div className="details-form-group">
                <label className="details-form-label">Join Date</label>
                <input 
                  type="text" 
                  value={joinDate} 
                  className="details-form-input" 
                  disabled 
                />
              </div>

              <div className="details-form-group" style={{ gridColumn: "span 2" }}>
                <label className="details-form-label">Last Login</label>
                <input 
                  type="text" 
                  value={lastLogin} 
                  className="details-form-input" 
                  disabled 
                />
              </div>
            </div>
          </div>

          {/* Card 2: Account Security & Status */}
          <div className="details-card">
            <div className="details-card-title-row">
              <ShieldCheck size={18} style={{ color: "#e15b24" }} />
              <span>Account Security & Status</span>
            </div>

            <div className="details-form-grid">
              <div className="details-form-group" style={{ gridColumn: "span 2" }}>
                <label className="details-form-label">Account Status</label>
                <select 
                  value={isBlocked ? "blocked" : "active"} 
                  onChange={(e) => setIsBlocked(e.target.value === "blocked")} 
                  className="details-form-input"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Right Column (Sidebar Cards) */}
        <div>
          {/* Card 1: Activity Summary */}
          <div className="details-card">
            <div className="details-card-title-row" style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}>
              <span>Activity Summary</span>
            </div>

            <div className="activity-summary-grid" style={{ marginTop: "1rem" }}>
              <div className="activity-summary-card peach">
                <div className="activity-summary-card-title">Total Spending</div>
                <div className="activity-summary-card-value">{formattedSpending}</div>
              </div>
              <div className="activity-summary-card grey">
                <div className="activity-summary-card-title">Rewards Earned</div>
                <div className="activity-summary-card-value">{rewards}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Actions */}
          <div className="details-card">
            <div className="details-actions-list">
              <button 
                type="button" 
                onClick={handleSave} 
                disabled={saving} 
                className="btn-large-primary"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                <Save size={18} />
                <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
              </button>

              <button 
                type="button" 
                onClick={onBack} 
                className="btn-large-secondary"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
            </div>

            <div className="danger-zone" style={{ marginTop: "2rem" }}>
              <div className="danger-zone-title">Danger Zone</div>
              <div className="danger-zone-desc">
                This action is permanent and cannot be undone. All database records will be erased.
              </div>
              <button 
                type="button" 
                onClick={() => setShowDeleteModal(true)} 
                disabled={deleting} 
                className="btn-danger-outline"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                <Trash2 size={16} />
                <span>{deleting ? "Deleting..." : "Delete User Account"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete User Account"
          footer={
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 justify-end w-full">
              <button 
                type="button"
                className="modal-btn modal-btn-secondary" 
                style={{ borderRadius: "9999px" }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="modal-btn modal-btn-danger" 
                style={{ borderRadius: "9999px" }}
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          }
        >
          <div className="p-6">
            <p className="text-gray-600 text-sm">
              Are you sure you want to permanently delete the account of <strong>{firstName} {lastName}</strong>?
            </p>
            <p className="text-rose-600 text-xs font-semibold mt-2">
              This action is permanent and cannot be undone. All database records will be erased.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
