import React, { useState } from "react";
import { adminApi } from "@/entities/admin/api/adminApi";
import { useDispatch } from "react-redux";
import { updateMerchantStatus } from "@/entities/admin/model/adminSlice";
import { Modal } from "@/shared/ui/Modal";
import { useAlertModal } from "@/shared/ui/AlertModalContext";
import { CheckCircle, XCircle } from "lucide-react";

interface MerchantApprovalActionsProps {
  merchantId: string;
}

export const MerchantApprovalActions: React.FC<MerchantApprovalActionsProps> = ({ merchantId }) => {
  const dispatch = useDispatch();
  const { showAlert } = useAlertModal();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await adminApi.approveMerchant(merchantId);
      dispatch(updateMerchantStatus({ id: merchantId, status: "approved", isAdminVerified: true }));
      setShowApproveModal(false);
    } catch (err) {
      showAlert("Failed to approve merchant", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      showAlert("Please provide a rejection reason", "warning");
      return;
    }
    setLoading(true);
    try {
      await adminApi.rejectMerchant(merchantId, reason);
      dispatch(updateMerchantStatus({ id: merchantId, status: "rejected", isAdminVerified: false }));
      setShowRejectModal(false);
      setReason("");
    } catch (err) {
      showAlert("Failed to reject merchant", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setShowApproveModal(true)}
          disabled={loading}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <CheckCircle size={14} />
          <span>Approve</span>
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={loading}
          className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <XCircle size={14} />
          <span>Reject</span>
        </button>
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Merchant"
        footer={
          <>
            <button 
              className="modal-btn modal-btn-secondary" 
              onClick={() => setShowApproveModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="modal-btn modal-btn-success" 
              onClick={handleApprove}
              disabled={loading}
            >
              {loading ? "Approving..." : "Confirm Approval"}
            </button>
          </>
        }
      >
        <p>Are you sure you want to approve this merchant? They will gain full access to their dashboard and products.</p>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Merchant"
        footer={
          <>
            <button 
              className="modal-btn modal-btn-secondary" 
              onClick={() => setShowRejectModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="modal-btn modal-btn-danger" 
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p>Please provide a reason for rejecting this merchant application. This will be visible to the merchant.</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Invalid GST document, incomplete business address..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all min-h-[100px]"
          />
        </div>
      </Modal>
    </>
  );
};
