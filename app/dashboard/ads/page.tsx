"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";

const GOOGLE_ADS_DATA = {
  accountId: "123-456-7890",
  status: "Connected",
  totalSpend: "₹45,230",
  campaigns: [
    {
      id: 1, name: "Hotel Booking - Search", status: "ACTIVE", type: "Search",
      budget: "₹2,000/day", impressions: 12500, clicks: 890, ctr: "7.12%",
      conversions: 45, conversionRate: "5.06%", costPerConversion: "₹1,005",
      reach: "N/A", startDate: "01/04/2026",
    },
    {
      id: 2, name: "Brand Awareness - Display", status: "ACTIVE", type: "Display",
      budget: "₹1,500/day", impressions: 45000, clicks: 1200, ctr: "2.67%",
      conversions: 28, conversionRate: "2.33%", costPerConversion: "₹1,607",
      reach: "N/A", startDate: "05/04/2026",
    },
    {
      id: 3, name: "Remarketing Campaign", status: "PAUSED", type: "Display",
      budget: "₹1,000/day", impressions: 8900, clicks: 450, ctr: "5.06%",
      conversions: 18, conversionRate: "4.00%", costPerConversion: "₹1,111",
      reach: "N/A", startDate: "10/04/2026",
    },
  ],
  stats: {
    totalImpressions: 66400, totalClicks: 2540, avgCTR: "3.83%",
    totalConversions: 91, totalSpend: 45230, avgCPC: "₹17.81",
  },
  audiences: [
    { name: "Hotel Seekers", size: "50K-100K", type: "In-market" },
    { name: "Luxury Travel", size: "10K-50K", type: "Affinity" },
    { name: "Website Visitors", size: "2K-5K", type: "Remarketing" },
  ]
};

const META_ADS_DATA = {
  accountId: "act_987654321",
  status: "Connected",
  totalSpend: "₹38,450",
  campaigns: [
    {
      id: 1, name: "Hotel Awareness - Facebook", status: "ACTIVE", type: "Awareness",
      budget: "₹1,800/day", impressions: 85000, clicks: 2100, ctr: "2.47%",
      conversions: 52, conversionRate: "2.48%", costPerConversion: "₹1,047",
      reach: "62,000", startDate: "01/04/2026",
    },
    {
      id: 2, name: "Instagram Booking Drive", status: "ACTIVE", type: "Conversion",
      budget: "₹2,200/day", impressions: 45000, clicks: 1800, ctr: "4.00%",
      conversions: 67, conversionRate: "3.72%", costPerConversion: "₹985",
      reach: "38,000", startDate: "03/04/2026",
    },
    {
      id: 3, name: "Retargeting - Website Visitors", status: "PAUSED", type: "Retargeting",
      budget: "₹800/day", impressions: 12000, clicks: 680, ctr: "5.67%",
      conversions: 31, conversionRate: "4.56%", costPerConversion: "₹774",
      reach: "9,500", startDate: "08/04/2026",
    },
  ],
  stats: {
    totalImpressions: 142000, totalClicks: 4580, avgCTR: "3.23%",
    totalConversions: 150, totalSpend: 38450, avgCPM: "₹270.77", totalReach: "109,500",
  },
  audiences: [
    { name: "Travel Enthusiasts", size: "500K-1M", type: "Interest" },
    { name: "Lookalike - Bookers", size: "100K-200K", type: "Lookalike" },
    { name: "Website Custom Audience", size: "5K-10K", type: "Custom" },
    { name: "Instagram Engagers", size: "20K-50K", type: "Engagement" },
  ]
};

export default function AdsPage() {
  useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"google" | "meta">("google");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: "", type: "Search", budget: "", objective: "Conversions",
    startDate: "", endDate: "", targeting: "",
  });

  const isGoogle = activeTab === "google";
  const data = isGoogle ? GOOGLE_ADS_DATA : META_ADS_DATA;

  // Google: #4285F4, Meta: #1877F2
  const primaryColor = isGoogle ? "#4285F4" : "#1877F2";
  const primaryDark = isGoogle ? "#2b5fcc" : "#0d5fcc";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3 md:gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">📢 Digital Ads Manager</h2>
            <p className="text-gray-500 text-sm mt-1">Google Ads aur Meta Ads ek jagah manage karo</p>
          </div>
          <button onClick={() => setShowCreateModal(true)}
            style={{ backgroundColor: primaryColor }}
            className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            + New Campaign
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-3 mb-6">
          {/* Google Tab */}
          <button onClick={() => setActiveTab("google")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all border-2 ${
              activeTab === "google"
                ? "border-[#4285F4] bg-[#4285F4] text-white shadow-md"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#4285F4] hover:text-[#4285F4]"
            }`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google Ads Manager
          </button>

          {/* Meta Tab */}
          <button onClick={() => setActiveTab("meta")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all border-2 ${
              activeTab === "meta"
                ? "border-[#1877F2] bg-[#1877F2] text-white shadow-md"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#1877F2] hover:text-[#1877F2]"
            }`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Meta Ads Manager
          </button>
        </div>

        {/* Account Banner */}
        <div className="rounded-2xl p-5 mb-6 text-white relative overflow-hidden"
          style={{ background: isGoogle
            ? "linear-gradient(135deg, #4285F4 0%, #2b5fcc 100%)"
            : "linear-gradient(135deg, #1877F2 0%, #0d5fcc 100%)" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: "white", transform: "translate(30%, -30%)" }}></div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-xl p-3">
                {isGoogle ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" opacity="0.8"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" opacity="0.6"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" opacity="0.7"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{isGoogle ? "Google Ads" : "Meta Ads"}</h3>
                <p className="text-white/80 text-xs">Account ID: {data.accountId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-green-400/30 border border-green-300/50 text-white text-xs px-3 py-1 rounded-full">✅ {data.status}</span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Demo Data</span>
              <span className="bg-white/20 text-white font-bold px-4 py-2 rounded-lg">Total Spend: {data.totalSpend}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {isGoogle ? (
            <>
              {[
                { label: "👁️ Impressions", value: data.stats.totalImpressions.toLocaleString(), color: "text-gray-900" },
                { label: "🖱️ Clicks", value: data.stats.totalClicks.toLocaleString(), color: "text-[#4285F4]" },
                { label: "📊 Avg CTR", value: data.stats.avgCTR, color: "text-[#34A853]" },
                { label: "✅ Conversions", value: String(data.stats.totalConversions), color: "text-[#FBBC05]" },
                { label: "💰 Total Spend", value: `₹${data.stats.totalSpend.toLocaleString()}`, color: "text-[#EA4335]" },
                { label: "💵 Avg CPC", value: (data.stats as any).avgCPC, color: "text-[#4285F4]" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { label: "👁️ Impressions", value: data.stats.totalImpressions.toLocaleString(), color: "text-gray-900" },
                { label: "👥 Reach", value: (data.stats as any).totalReach, color: "text-[#1877F2]" },
                { label: "🖱️ Clicks", value: data.stats.totalClicks.toLocaleString(), color: "text-[#42B72A]" },
                { label: "📊 Avg CTR", value: data.stats.avgCTR, color: "text-[#1877F2]" },
                { label: "✅ Conversions", value: String(data.stats.totalConversions), color: "text-[#42B72A]" },
                { label: "💰 Total Spend", value: `₹${data.stats.totalSpend.toLocaleString()}`, color: "text-[#1877F2]" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: isGoogle ? "#4285F420" : "#1877F220",
              background: isGoogle ? "#4285F408" : "#1877F208" }}>
            <h3 className="font-semibold text-gray-900">📋 Campaigns</h3>
            <span className="text-xs text-gray-400">{data.campaigns.length} campaigns</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  {["Campaign", "Status", "Budget", "Impressions", "Clicks", "CTR", "Conversions", "Conv. Rate", "Cost/Conv.", ...(activeTab === "meta" ? ["Reach"] : [])].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-gray-900">{campaign.name}</p>
                      <p className="text-xs text-gray-400">{campaign.type} • {campaign.startDate}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${campaign.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {campaign.status === "ACTIVE" ? "🟢 Active" : "⏸️ Paused"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600">{campaign.budget}</td>
                    <td className="px-4 py-4 text-xs text-gray-700 font-medium">{campaign.impressions.toLocaleString()}</td>
                    <td className="px-4 py-4 text-xs font-semibold" style={{ color: primaryColor }}>{campaign.clicks.toLocaleString()}</td>
                    <td className="px-4 py-4 text-xs text-green-600 font-medium">{campaign.ctr}</td>
                    <td className="px-4 py-4 text-xs text-purple-600 font-medium">{campaign.conversions}</td>
                    <td className="px-4 py-4 text-xs text-orange-500 font-medium">{campaign.conversionRate}</td>
                    <td className="px-4 py-4 text-xs text-red-500 font-medium">{campaign.costPerConversion}</td>
                    {activeTab === "meta" && <td className="px-4 py-4 text-xs text-gray-600">{campaign.reach}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audience Targeting */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🎯 Audience Targeting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.audiences.map((audience, i) => (
              <div key={i} className="rounded-xl p-4 border-2 transition-all hover:shadow-md"
                style={{ borderColor: `${primaryColor}30`, background: `${primaryColor}05` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium text-white"
                    style={{ backgroundColor: primaryColor }}>
                    {audience.type}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-2">{audience.name}</p>
                <p className="text-xs text-gray-500 mt-1">👥 {audience.size}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: primaryColor }}>
                {isGoogle ? "G" : "f"}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                New {isGoogle ? "Google" : "Meta"} Campaign
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Campaign Name</label>
                <input type="text" placeholder="e.g. Hotel Summer Sale"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none"
                  style={{ outlineColor: primaryColor }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Campaign Type</label>
                <select value={campaignForm.type}
                  onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none">
                  {isGoogle ? (
                    <><option>Search</option><option>Display</option><option>Shopping</option><option>Video</option></>
                  ) : (
                    <><option>Awareness</option><option>Conversion</option><option>Retargeting</option><option>Lead Generation</option></>
                  )}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Daily Budget (₹)</label>
                <input type="number" placeholder="e.g. 2000"
                  value={campaignForm.budget}
                  onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                  <input type="date" value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                  <input type="date" value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Target Audience</label>
                <input type="text" placeholder="e.g. Travel enthusiasts, 25-45 age"
                  value={campaignForm.targeting}
                  onChange={(e) => setCampaignForm({ ...campaignForm, targeting: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none" />
              </div>
              <div className="rounded-lg p-3 text-xs"
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                💡 Demo mode mein hai — Real API keys add karne ke baad actual campaigns create honge
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={() => { alert("Demo mode: Campaign create ho gaya!"); setShowCreateModal(false); }}
                className="flex-1 text-white py-2 rounded-lg text-sm font-medium hover:opacity-90"
                style={{ backgroundColor: primaryColor }}>
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}