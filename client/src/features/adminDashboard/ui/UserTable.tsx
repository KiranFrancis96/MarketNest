import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { User } from "@/entities/admin/model/types";
import { adminApi } from "@/entities/admin/api/adminApi";
import { updateUserBlockStatus, deleteUserAction, addUserAction } from "@/entities/admin/model/adminSlice";
import { Modal } from "@/shared/ui/Modal";
import { useAlertModal } from "@/shared/ui/AlertModalContext";
import { orderApi } from "@/entities/order/api/orderApi";
import { 
  ShieldAlert, 
  ShieldCheck, 
  History, 
  Edit, 
  Ban, 
  Plus, 
  Download, 
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react";

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
  onEditUser: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onEditUser }) => {
  const dispatch = useDispatch();
  const { showAlert } = useAlertModal();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add User states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", password: "" });

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    
    // 1. Filter by search query (null-safe)
    let result = users;
    if (q) {
      result = result.filter(u => {
        const first = u.firstName ? u.firstName.toLowerCase() : "";
        const last = u.lastName ? u.lastName.toLowerCase() : "";
        const mail = u.email ? u.email.toLowerCase() : "";
        const id = u._id ? u._id.toLowerCase() : "";
        return first.includes(q) || last.includes(q) || mail.includes(q) || id.includes(q);
      });
    }

    // 2. Filter by status
    if (statusFilter !== "All") {
      const wantBlocked = statusFilter === "Blocked";
      result = result.filter(u => u.isBlocked === wantBlocked);
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, searchQuery, statusFilter]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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
      showAlert("Failed to update user status", "error");
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

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.firstName || !newUser.lastName || !newUser.email) return;

    // Create a mock user to append in Redux
    const created: User = {
      _id: "usr-" + Math.random().toString(36).substr(2, 9),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      isAdmin: false,
      isVerified: true,
      isBlocked: false,
      createdAt: new Date().toISOString(),
    };

    dispatch(addUserAction(created));
    showAlert("New user created successfully!", "success");
    setNewUser({ firstName: "", lastName: "", email: "", password: "" });
    setShowAddUserModal(false);
  };

  const handleExportPDF = () => {
    if (filteredUsers.length === 0) {
      showAlert("No users found to export.", "warning");
      return;
    }

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    // Generate rows HTML
    const rowsHtml = filteredUsers.map((user, idx) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600;">MN-${user._id.slice(-5).toUpperCase()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #0f172a;">${user.firstName || ""} ${user.lastName || ""}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${user.email || ""}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center;">${user.isAdmin ? "Admin" : "User"}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; background-color: ${user.isBlocked ? "#ffe4e6" : "#d1fae5"}; color: ${user.isBlocked ? "#b91c1c" : "#065f46"}; text-transform: uppercase;">
            ${user.isBlocked ? "Blocked" : "Active"}
          </span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center; color: #475569;">
          ${user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
        </td>
      </tr>
    `).join("");

    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>User List Report - ${dateStr}</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 30px; margin: 0; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #e15b24; padding-bottom: 15px; }
      .title { font-size: 24px; font-weight: 800; color: #0f172a; }
      .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500; }
      .date { font-size: 12px; color: #64748b; text-align: right; font-weight: 500; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th { background-color: #f8fafc; text-align: left; padding: 12px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
      tr:nth-child(even) { background-color: #f8fafc; }
      @media print {
        body { padding: 0; }
        @page { margin: 1.5cm; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="title">MarketNest User List Report</div>
        <div class="subtitle">Filtered users list matching active search/filter criteria. Total: ${filteredUsers.length} record(s)</div>
      </div>
      <div class="date">
        <div>Date Generated</div>
        <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">${dateStr}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="text-align: center; width: 40px;">#</th>
          <th>User ID</th>
          <th>Name</th>
          <th>Email</th>
          <th style="text-align: center;">Role</th>
          <th style="text-align: center;">Status</th>
          <th style="text-align: center;">Joined Date</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </body>
</html>`;

    // Direct download as HTML report file
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `userlist_report_${new Date().toISOString().split('T')[0]}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      {/* Top Header Controls */}
      <div className="dash-header-row" style={{ marginBottom: 0 }}>
        <div className="dash-title-block">
          <h1 style={{ fontSize: "1.5rem" }}>User Management</h1>
          <p>Manage roles, permissions and user account statuses.</p>
        </div>
        <div className="dash-header-actions-btn-group">
          <button onClick={handleExportPDF} className="btn-secondary-white">
            <Download size={16} />
            <span>Export</span>
          </button>
          <button onClick={() => setShowAddUserModal(true)} className="btn-primary-orange">
            <Plus size={16} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      <div className="table-filter-bar">
        <div className="admin-search-bar" style={{ flex: 1, minWidth: "280px" }}>
          <Search size={16} style={{ color: "#94a3b8" }} />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search users by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">Status: All Users</option>
          <option value="Active">Active Only</option>
          <option value="Blocked">Blocked Only</option>
        </select>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
        <div className="flex-grow overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map((user) => {
                const initialFirst = user.firstName ? user.firstName[0] : "";
                const initialLast = user.lastName ? user.lastName[0] : "";
                const avatarInitials = `${initialFirst}${initialLast}`.toUpperCase() || "US";
                
                // Joined Date Format
                const joinStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                }) : "Jan 12, 2024";

                // Last Login Mock
                const lastLoginMock = user.isBlocked ? "Never" : "Yesterday";

                return (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="table-user-cell">
                        <button
                          onClick={() => onEditUser(user)}
                          className="user-avatar-circle orange hover:opacity-80 transition-opacity cursor-pointer border-none"
                          style={{ borderRadius: "8px", backgroundColor: "#fff1eb", color: "#e15b24", padding: 0, overflow: "hidden" }}
                          title={`View details for ${user.firstName} ${user.lastName}`}
                        >
                          {user.profilePic ? (
                            <img 
                              src={user.profilePic} 
                              alt={`${user.firstName} ${user.lastName}`} 
                              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                            />
                          ) : (
                            avatarInitials
                          )}
                        </button>
                        <div className="table-user-info">
                          <span className="table-user-name">{user.firstName} {user.lastName}</span>
                          <span className="table-user-id">ID: MN-{user._id.slice(-5).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="badge-role">
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge-status ${user.isBlocked ? "inactive" : "active"}`}>
                        {user.isBlocked ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{joinStr}</td>
                    <td className="px-6 py-4 text-gray-500">{lastLoginMock}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!user.isAdmin && (
                          <>
                            <button
                              onClick={() => onEditUser(user)}
                              className="table-action-btn"
                              title="Edit Details"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => openBlockModal(user)}
                              className={`table-action-btn ${user.isBlocked ? "" : "delete"}`}
                              title={user.isBlocked ? "Unblock Account" : "Block Account"}
                            >
                              <Ban size={16} />
                            </button>
                            <button
                              onClick={() => openHistoryModal(user)}
                              className="table-action-btn"
                              title="Purchase History"
                            >
                              <History size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400 italic">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        {totalItems > 0 && (
          <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-gray-200 mt-auto">
            <div className="text-sm text-slate-500 font-medium">
              Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} users
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages <= 1}
                className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Summary Banner */}
      <div className="table-total-banner">
        <div className="table-total-info">
          <h4>Total Regular Users</h4>
          <div className="table-total-value">{(users.length + 8000).toLocaleString()}</div>
        </div>
        <div className="table-total-trend flex items-center gap-1">
          <TrendingUp size={16} />
          <span>Active Engagement Rate: 94.2%</span>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <Modal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          title="Add New User"
          footer={
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 border border-gray-200 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUserSubmit}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-sm font-bold text-white rounded-lg transition-colors"
              >
                Create User
              </button>
            </div>
          }
        >
          <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
            <div className="flex gap-4">
              <div style={{ flex: 1 }}>
                <label className="block text-xs font-bold text-gray-600 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="block text-xs font-bold text-gray-600 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Email Address *</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="••••••••"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <Modal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          title={selectedUser?.isBlocked ? "Unblock User" : "Block User"}
          footer={
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 justify-end">
              <button 
                className="px-4 py-2 border border-gray-200 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" 
                onClick={() => setShowBlockModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ${
                  selectedUser?.isBlocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
                onClick={handleToggleBlock}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          }
        >
          <div className="p-6">
            <p className="text-gray-600 text-sm">
              Are you sure you want to {selectedUser?.isBlocked ? "unblock" : "block"} <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?
              {!selectedUser?.isBlocked && " This user will be logged out and cannot log in until unblocked."}
            </p>
          </div>
        </Modal>
      )}

      {/* History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title={`Purchase History: ${historyUser?.firstName} ${historyUser?.lastName}`}
        footer={
          <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button 
              className="px-4 py-2 border border-gray-200 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" 
              onClick={() => setShowHistoryModal(false)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="p-6" style={{ maxHeight: "60vh", overflowY: "auto" }}>
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
