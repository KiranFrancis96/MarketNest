import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { User } from "@/entities/admin/model/types";
import { adminApi } from "@/entities/admin/api/adminApi";
import { updateUserBlockStatus } from "@/entities/admin/model/adminSlice";
import { Modal } from "@/shared/ui/Modal";
import { orderApi } from "@/entities/order/api/orderApi";
import { ShieldAlert, ShieldCheck, History } from "lucide-react";

interface ClientProduct {
  images?: string[];
  name?: string;
}

interface ClientOrderItem {
  product?: ClientProduct;
  priceSnapshot: number;
  quantity: number;
}

interface ClientOrder {
  _id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items: ClientOrderItem[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface UserTableProps {
  users: User[];
}

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const dispatch = useDispatch();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [users]);

  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedUsers = users.slice(startIndex, endIndex);

  // States for purchase history audit modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyUser, setHistoryUser] = useState<User | null>(null);
  const [userHistory, setUserHistory] = useState<ClientOrder[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

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

  const openHistoryModal = async (user: User) => {
    setHistoryUser(user);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    setHistoryError(null);
    setUserHistory([]);
    try {
      const res = await orderApi.getAdminUserHistory(user._id);
      setUserHistory(res.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setHistoryError(error.response?.data?.message || "Failed to load user purchase history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
      <div className="flex-1 overflow-x-auto">
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
            {paginatedUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{user.firstName} {user.lastName} {user.isAdmin && <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase">Admin</span>}</td>
                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${user.isBlocked ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {!user.isAdmin && (
                      <>
                        <button
                          onClick={() => openBlockModal(user)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border ${
                            user.isBlocked 
                              ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0] hover:bg-[#dcfce7]" 
                              : "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca] hover:bg-[#fee2e2]"
                          }`}
                        >
                          {user.isBlocked ? (
                            <>
                              <ShieldCheck size={14} color="#166534" />
                              <span>Unblock</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert size={14} color="#b91c1c" />
                              <span>Block</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openHistoryModal(user)}
                          className="px-3 py-1.5 bg-[#f5f3ff] text-[#4f46e5] border border-[#c7d2fe] hover:bg-[#e0e7ff] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <History size={14} color="#4f46e5" />
                          <span>View Purchases</span>
                        </button>
                      </>
                    )}
                  </div>
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
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100 gap-4 mt-auto">
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-semibold text-gray-900">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
              <span className="font-semibold text-gray-900">{endIndex}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalItems}</span> users
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors outline-none"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isSec = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[32px] h-8 rounded-lg text-xs font-bold transition-colors outline-none ${
                        isSec
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors outline-none"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

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

      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title={`Purchase History: ${historyUser?.firstName} ${historyUser?.lastName}`}
        footer={
          <button className="modal-btn modal-btn-secondary" onClick={() => setShowHistoryModal(false)}>Close</button>
        }
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "4px" }}>
          {historyLoading ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-500 text-xs mt-3 font-semibold">Fetching transactions...</p>
            </div>
          ) : historyError ? (
            <p className="text-rose-600 text-sm font-semibold">{historyError}</p>
          ) : userHistory.length === 0 ? (
            <p className="text-gray-400 italic text-center py-6">No purchases recorded for this user.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {userHistory.map((order) => {
                const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }) : "N/A";
                return (
                  <div key={order._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400">ORDER ID</span>
                        <div className="text-xs font-bold text-gray-800">#{order._id}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-400">TOTAL</span>
                        <div className="text-xs font-extrabold text-indigo-600">₹{order.totalAmount.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500 mb-2 font-medium">Placed on: {dateStr}</div>
                    
                    <div className="flex flex-col gap-2 mt-2">
                      {order.items.map((item: ClientOrderItem, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700">{item.product?.name || "Product Listing"}</span>
                          <span className="text-gray-500">
                            ₹{item.priceSnapshot} × {item.quantity} = <strong className="text-gray-800">₹{(item.priceSnapshot * item.quantity).toFixed(2)}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
