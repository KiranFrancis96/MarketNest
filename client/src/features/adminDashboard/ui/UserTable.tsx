import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { User } from "@/entities/admin/model/types";
import { adminApi } from "@/entities/admin/api/adminApi";
import { updateUserBlockStatus } from "@/entities/admin/model/adminSlice";
import { Modal } from "@/shared/ui/Modal";

interface UserTableProps {
  users: User[];
}

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const dispatch = useDispatch();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleBlock = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      if (selectedUser.isBlocked) {
        await adminApi.unblockUser(selectedUser._id);
        dispatch(updateUserBlockStatus({ id: selectedUser._id, isBlocked: false }));
      } else {
        await adminApi.blockUser(selectedUser._id);
        dispatch(updateUserBlockStatus({ id: selectedUser._id, isBlocked: true }));
      }
      setShowBlockModal(false);
      setSelectedUser(null);
    } catch (err) {
      alert("Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  const openBlockModal = (user: User) => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{user.firstName} {user.lastName} {user.isAdmin && <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase">Admin</span>}</td>
              <td className="px-6 py-4 text-gray-500">{user.email}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${user.isBlocked ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </td>
              <td className="px-6 py-4">
                {!user.isAdmin && (
                  <button
                    onClick={() => openBlockModal(user)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      user.isBlocked 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                        : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                    }`}
                  >
                    {user.isBlocked ? "Unblock User" : "Block User"}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title={selectedUser?.isBlocked ? "Unblock User" : "Block User"}
        footer={
          <div className="flex gap-3">
            <button className="modal-btn modal-btn-secondary" onClick={() => setShowBlockModal(false)}>Cancel</button>
            <button 
              className={`modal-btn ${selectedUser?.isBlocked ? "modal-btn-success" : "modal-btn-danger"}`}
              onClick={handleToggleBlock}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm"}
            </button>
          </div>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to {selectedUser?.isBlocked ? "unblock" : "block"} <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?
          {!selectedUser?.isBlocked && " This user will be logged out and cannot log in until unblocked."}
        </p>
      </Modal>
    </div>
  );
};
