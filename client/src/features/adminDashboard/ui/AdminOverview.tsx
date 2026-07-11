import React, { useState } from "react";
import { 
  Users, 
  Building2, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  UserPlus, 
  CheckSquare, 
  FileText, 
  ChevronDown
} from "lucide-react";

interface AdminOverviewProps {
  onNavigate: (tab: string) => void;
  totalUsersCount?: number;
  totalMerchantsCount?: number;
  totalProductsCount?: number;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ 
  onNavigate,
  totalUsersCount = 42892,
  totalMerchantsCount = 1240,
  totalProductsCount = 85400
}) => {
  const [selectedBar, setSelectedBar] = useState<number | null>(5); // Default to last bar

  const stats = [
    { label: "Total Users", value: totalUsersCount.toLocaleString(), trend: "+12%", trendUp: true, icon: Users, color: "blue" },
    { label: "Total Merchants", value: totalMerchantsCount.toLocaleString(), trend: "+5.2%", trendUp: true, icon: Building2, color: "green" },
    { label: "Total Products", value: (totalProductsCount / 1000).toFixed(1) + "k", trend: "+0.8%", trendUp: true, icon: Package, color: "orange" },
    { label: "Total Orders", value: "12,651", trend: "+18.4%", trendUp: true, icon: ShoppingCart, color: "purple" },
    { label: "Revenue (₹)", value: "₹8.4M", trend: "+24%", trendUp: true, icon: DollarSign, color: "indigo" },
    { label: "Commission (₹)", value: "₹1.2M", trend: "-2.1%", trendUp: false, icon: Percent, color: "red" },
  ];

  const chartData = [
    { label: "Jan", value: 3.2, displayValue: "₹3.2M" },
    { label: "Feb", value: 4.5, displayValue: "₹4.5M" },
    { label: "Mar", value: 3.8, displayValue: "₹3.8M" },
    { label: "Apr", value: 5.6, displayValue: "₹5.6M" },
    { label: "May", value: 7.2, displayValue: "₹7.2M" },
    { label: "Jun", value: 8.4, displayValue: "₹8.4M" },
    { label: "Jul", value: 6.8, displayValue: "₹6.8M" },
  ];

  const maxVal = Math.max(...chartData.map(d => d.value));

  const categories = [
    { name: "Electronics", percent: 30, color: "blue" },
    { name: "Fashion", percent: 25, color: "green" },
    { name: "Groceries", percent: 20, color: "yellow" },
    { name: "Fitness", percent: 15, color: "purple" },
    { name: "Home Decor", percent: 10, color: "red" },
  ];

  const activities = [
    {
      id: 1,
      type: "register",
      text: <><strong>Rajesh Kumar</strong> registered as a New Merchant <span className="merchant-org">(TechStore Pvt Ltd)</span></>,
      time: "2 minutes ago",
      location: "Bangalore, IN",
      color: "blue",
      icon: UserPlus
    },
    {
      id: 2,
      type: "onboarding",
      text: <>Onboarding completed for <strong>Global Groceries</strong>.</>,
      time: "15 minutes ago",
      location: "Mumbai, IN",
      color: "green",
      icon: CheckSquare
    },
    {
      id: 3,
      type: "product",
      text: <><strong>Urban Trends</strong> added 24 new products to 'Electronics' category.</>,
      time: "1 hour ago",
      location: "New Delhi, IN",
      color: "yellow",
      icon: Package
    },
    {
      id: 4,
      type: "commission",
      text: <>Commission request received from <strong>StyleHub</strong>.</>,
      time: "2 hours ago",
      location: "Hyderabad, IN",
      color: "purple",
      icon: FileText
    }
  ];

  return (
    <div>
      {/* Upper Header Row */}
      <div className="dash-header-row">
        <div className="dash-title-block">
          <h1>Admin Overview</h1>
          <p>Real-time performance and system status of MarketNest platform.</p>
        </div>
        <div className="dash-header-actions-btn-group">
          <button className="btn-secondary-white">Download Report</button>
          <button className="btn-primary-orange">Export CSV</button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="dash-stats-grid">
        {stats.map((stat, idx) => {
          return (
            <div key={idx} className={`stat-card ${stat.color}`}>
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-value-row">
                <div className="stat-card-value">{stat.value}</div>
                <div className={`stat-card-trend ${stat.trendUp ? "up" : "down"}`}>
                  {stat.trend}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections Grid */}
      <div className="dash-sections-grid">
        {/* Revenue Growth Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Revenue Growth</div>
            </div>
            <button className="btn-secondary-white" style={{ padding: "0.375rem 0.75rem", fontSize: "0.8rem", gap: "0.25rem" }}>
              <span>Last 30 Days</span>
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="revenue-chart-container">
            {chartData.map((data, idx) => {
              const heightPct = (data.value / maxVal) * 80; // Scale to fit nicely
              const isSelected = selectedBar === idx;
              return (
                <div 
                  key={idx} 
                  className="revenue-chart-bar-wrapper"
                  onMouseEnter={() => setSelectedBar(idx)}
                >
                  <div className={`revenue-chart-tooltip ${isSelected ? "visible" : ""}`} style={{ opacity: isSelected ? 1 : 0, transform: isSelected ? "translateX(-50%) translateY(-10px)" : "" }}>
                    {data.displayValue}
                  </div>
                  <div 
                    className={`revenue-chart-bar ${isSelected ? "highlighted" : ""}`} 
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <div className="revenue-chart-label">{data.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Merchant Categories Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Merchant Categories</div>
            <span className="dash-card-subtitle">Distribution</span>
          </div>
          
          <div className="categories-list">
            {categories.map((cat, idx) => (
              <div key={idx} className="category-row">
                <div className="category-label-side">
                  <div className={`category-dot ${cat.color}`}></div>
                  <span className="category-name">{cat.name}</span>
                </div>
                <span className="category-percentage">{cat.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Activity & Quick Actions Section */}
      <div className="dash-sections-grid">
        {/* Live Activity Feed */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Live Activity Feed</div>
            <span className="live-updates-badge">LIVE UPDATES</span>
          </div>

          <div className="activity-feed-list">
            {activities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="activity-feed-item">
                  <div className={`activity-icon-wrapper ${act.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="activity-details">
                    <div className="activity-text">{act.text}</div>
                    <div className="activity-time-loc">{act.time} • {act.location}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => onNavigate("users")} 
            className="dash-card-view-all"
          >
            View All Activities
          </button>
        </div>

        {/* Quick Admin Actions */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Quick Admin Actions</div>
          </div>

          <div className="quick-actions-list">
            <button 
              onClick={() => onNavigate("merchants")} 
              className="quick-action-card"
            >
              <div className="quick-action-label">Approve Companies</div>
              <div className="quick-action-badge blue">12 Pending</div>
            </button>
            
            <button 
              onClick={() => onNavigate("categories")} 
              className="quick-action-card"
            >
              <div className="quick-action-label">Review Commission Requests</div>
              <div className="quick-action-badge yellow">8 New</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
