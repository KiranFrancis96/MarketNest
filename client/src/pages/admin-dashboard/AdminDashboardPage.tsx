import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { adminApi } from "@/entities/admin/api/adminApi";
import { setUsers, setMerchants, setLoading } from "@/entities/admin/model/adminSlice";
import { UserTable } from "@/features/adminDashboard/ui/UserTable";
import { MerchantTable } from "@/features/adminDashboard/ui/MerchantTable";
import { useAdminAuth } from "@/features/adminAuth/model/useAdminAuth";

const AdminDashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const { admin, users, merchants, isLoading } = useSelector((state: RootState) => state.admin);
  const { logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<"users" | "merchants">("users");
  const [merchantFilter, setMerchantFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        if (activeTab === "users") {
          const res = await adminApi.getUsers();
          dispatch(setUsers(res.data));
        } else {
          const res = await adminApi.getMerchants(merchantFilter);
          dispatch(setMerchants(res.data));
        }
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchData();
  }, [activeTab, merchantFilter, dispatch]);

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar/Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Console</h1>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-500 font-medium">Welcome, <span className="text-gray-900">{admin.firstName}</span></span>
              <button
                onClick={logout}
                className="text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "users" ? "tab-active" : "tab-inactive"
              }`}
            >
              Users Listing
            </button>
            <button
              onClick={() => setActiveTab("merchants")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "merchants" ? "tab-active" : "tab-inactive"
              }`}
            >
              Merchants Listing
            </button>
          </div>

          {activeTab === "merchants" && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter:</span>
              <select
                value={merchantFilter}
                onChange={(e) => setMerchantFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Merchants</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "users" ? (
              <UserTable users={users} />
            ) : (
              <MerchantTable merchants={merchants} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
