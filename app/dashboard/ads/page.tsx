"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";

// ✅ Mock Campaign Data
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
    totalImpressions: 66400,
    totalClicks: 2540,
    avgCTR: "3.83%",
    totalConversions: 91,
    totalSpend: 45230,
    avgCPC: "₹17.81",
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
    totalImpressions: 142000,
    totalClicks: 4580,
    avgCTR: "3.23%",
    totalConversions: 150,
    totalSpend: 38450,
    avgCPM: "₹270.77",
    totalReach: "109,500",
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

  const data = activeTab === "google" ? GOOGLE_ADS_DATA : META_ADS_DATA;

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">📢 Digital Ads Manager</h2>
            <p className="text-gray-500 text-sm mt-1">Google Ads aur Meta Ads ek jagah manage karo</p>
          </div>
          <button onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + New Campaign
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setActiveTab("google")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "google" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
            🔵 Google Ads Manager
          </button>
          <button onClick={() => setActiveTab("meta")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "meta" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
            🔵 Meta Ads Manager
          </button>
        </div>

        {/* Account Info */}
        <div className={`rounded-xl p-4 mb-6 flex items-center justify-between ${activeTab === "google" ? "bg-blue-600" : "bg-blue-800"}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeTab === "google" ? "🔵" : "📘"}</span>
            <div>
              <h3 className="font-bold text-white">{activeTab === "google" ? "Google Ads" : "Meta Ads"}</h3>
              <p className="text-white/80 text-xs">Account ID: {data.accountId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-green-400 text-white text-xs px-3 py-1 rounded-full">✅ {data.status}</span>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Demo Data</span>
            <span className="text-white font-bold">Total Spend: {data.totalSpend}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {activeTab === "google" ? (
            <>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">👁️ Impressions</p>
                <p className="text-xl font-bold text-gray-900">{data.stats.totalImpressions.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">🖱️ Clicks</p>
                <p className="text-xl font-bold text-blue-600">{data.stats.totalClicks.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">📊 Avg CTR</p>
                <p className="text-xl font-bold text-green-600">{data.stats.avgCTR}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">✅ Conversions</p>
                <p className="text-xl font-bold text-purple-600">{data.stats.totalConversions}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">💰 Total Spend</p>
                <p className="text-xl font-bold text-orange-500">₹{data.stats.totalSpend.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">💵 Avg CPC</p>
                <p className="text-xl font-bold text-red-500">{(data.stats as any).avgCPC}</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">👁️ Impressions</p>
                <p className="text-xl font-bold text-gray-900">{data.stats.totalImpressions.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">👥 Reach</p>
                <p className="text-xl font-bold text-blue-600">{(data.stats as any).totalReach}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">🖱️ Clicks</p>
                <p className="text-xl font-bold text-green-600">{data.stats.totalClicks.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">📊 Avg CTR</p>
                <p className="text-xl font-bold text-purple-600">{data.stats.avgCTR}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">✅ Conversions</p>
                <p className="text-xl font-bold text-orange-500">{data.stats.totalConversions}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">💰 Total Spend</p>
                <p className="text-xl font-bold text-red-500">₹{data.stats.totalSpend.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">📋 Campaigns</h3>
            <span className="text-xs text-gray-400">{data.campaigns.length} campaigns</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Campaign</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Impressions</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Clicks</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">CTR</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Conversions</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Conv. Rate</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Cost/Conv.</th>
                  {activeTab === "meta" && <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Reach</th>}
                </tr>
              </thead>
              <tbody>
                {data.campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="text-xs font-medium text-gray-900">{campaign.name}</p>
                      <p className="text-xs text-gray-400">{campaign.type} • {campaign.startDate}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${campaign.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {campaign.status === "ACTIVE" ? "🟢 Active" : "⏸️ Paused"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600">{campaign.budget}</td>
                    <td className="px-4 py-4 text-xs text-gray-600">{campaign.impressions.toLocaleString()}</td>
                    <td className="px-4 py-4 text-xs text-blue-600 font-medium">{campaign.clicks.toLocaleString()}</td>
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
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    audience.type === "In-market" ? "bg-blue-100 text-blue-700" :
                    audience.type === "Affinity" ? "bg-purple-100 text-purple-700" :
                    audience.type === "Remarketing" || audience.type === "Retargeting" ? "bg-orange-100 text-orange-700" :
                    audience.type === "Lookalike" ? "bg-green-100 text-green-700" :
                    audience.type === "Custom" ? "bg-red-100 text-red-700" :
                    audience.type === "Interest" ? "bg-pink-100 text-pink-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{audience.type}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{audience.name}</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              + New {activeTab === "google" ? "Google" : "Meta"} Campaign
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Campaign Name</label>
                <input type="text" placeholder="e.g. Hotel Summer Sale"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Campaign Type</label>
                <select value={campaignForm.type}
                  onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                  {activeTab === "google" ? (
                    <>
                      <option>Search</option>
                      <option>Display</option>
                      <option>Shopping</option>
                      <option>Video</option>
                    </>
                  ) : (
                    <>
                      <option>Awareness</option>
                      <option>Conversion</option>
                      <option>Retargeting</option>
                      <option>Lead Generation</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Daily Budget (₹)</label>
                <input type="number" placeholder="e.g. 2000"
                  value={campaignForm.budget}
                  onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                  <input type="date"
                    value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                  <input type="date"
                    value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Target Audience</label>
                <input type="text" placeholder="e.g. Travel enthusiasts, 25-45 age"
                  value={campaignForm.targeting}
                  onChange={(e) => setCampaignForm({ ...campaignForm, targeting: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600">💡 Demo mode mein hai — Real API keys add karne ke baad actual campaigns create honge</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={() => { alert("Demo mode: Campaign create ho gaya! Real API se connect karne ke baad live hoga."); setShowCreateModal(false); }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}