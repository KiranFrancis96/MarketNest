import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { Merchant } from "@/entities/admin/model/types";
import { adminApi } from "@/entities/admin/api/adminApi";
import { updateMerchantBlockStatus } from "@/entities/admin/model/adminSlice";
import { Modal } from "@/shared/ui/Modal";
import { MerchantApprovalActions } from "./MerchantApprovalActions";

interface MerchantTableProps {
  merchants: Merchant[];
}

export const MerchantTable: React.FC<MerchantTableProps> = ({ merchants }) => {
  const dispatch = useDispatch();
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleBlock = async () => {
    if (!selectedMerchant) return;
    
    setLoading(true);
    try {
      if (selectedMerchant.isBlocked) {
        await adminApi.unblockMerchant(selectedMerchant._id);
        dispatch(updateMerchantBlockStatus({ id: selectedMerchant._id, isBlocked: false }));
      } else {
        await adminApi.blockMerchant(selectedMerchant._id);
        dispatch(updateMerchantBlockStatus({ id: selectedMerchant._id, isBlocked: true }));
      }
      setShowBlockModal(false);
      setSelectedMerchant(null);
    } catch (err) {
      alert("Failed to update merchant status");
    } finally {
      setLoading(false);
    }
  };

  const openBlockModal = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setShowBlockModal(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Business Name</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Owner</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">GST No.</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {merchants.map((m) => (
            <tr key={m._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{m.businessName}</td>
              <td className="px-6 py-4 text-gray-500">{m.ownerName}</td>
              <td className="px-6 py-4 text-gray-500 font-mono text-xs">{m.gstNumber}</td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${
                    m.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                    m.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {m.status}
                  </span>
                  {m.isBlocked && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold uppercase w-fit">Blocked</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                  {m.status === "pending" && <MerchantApprovalActions merchantId={m._id} />}
                  {m.status === "approved" && (
                    <button
                      onClick={() => openBlockModal(m)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors w-fit ${
                        m.isBlocked 
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                          : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      }`}
                    >
                      {m.isBlocked ? "Unblock Merchant" : "Block Merchant"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {merchants.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">No merchants found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title={selectedMerchant?.isBlocked ? "Unblock Merchant" : "Block Merchant"}
        footer={
          <div className="flex gap-3">
            <button className="modal-btn modal-btn-secondary" onClick={() => setShowBlockModal(false)}>Cancel</button>
            <button 
              className={`modal-btn ${selectedMerchant?.isBlocked ? "modal-btn-success" : "modal-btn-danger"}`}
              onClick={handleToggleBlock}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm"}
            </button>
          </div>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to {selectedMerchant?.isBlocked ? "unblock" : "block"} <strong>{selectedMerchant?.businessName}</strong>?
          {!selectedMerchant?.isBlocked && " Their products will be hidden from the marketplace."}
        </p>
      </Modal>
    </div>
  );
};
