"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";

// ==================== META ADS DATA ====================
const META_OVERVIEW_DATA = {
  dateRange: "Apr 1, 2026 - Apr 12, 2026",
  summary: {
    reach: { value: "1,09,500", change: "+18.2%", up: true },
    impressions: { value: "1,42,000", change: "+14.5%", up: true },
    clicks: { value: "4,580", change: "+11.3%", up: true },
    ctr: { value: "3.23%", change: "+0.3%", up: true },
    cpm: { value: "₹270.77", change: "-3.2%", up: false },
    spend: { value: "₹38,450", change: "+9.1%", up: true },
    conversions: { value: "150", change: "+22.5%", up: true },
    costPerResult: { value: "₹256.33", change: "-10.8%", up: false },
  },
  campaigns: [
    { name: "Hotel Awareness - Facebook", status: "Active", budget: "₹1,800/day", reach: "62,000", impressions: "85,000", clicks: "2,100", ctr: "2.47%", cpm: "₹247", spend: "₹21,000", conversions: "52", costPerResult: "₹403" },
    { name: "Instagram Booking Drive", status: "Active", budget: "₹2,200/day", reach: "38,000", impressions: "45,000", clicks: "1,800", ctr: "4.00%", cpm: "₹293", spend: "₹13,200", conversions: "67", costPerResult: "₹197" },
    { name: "Retargeting - Website Visitors", status: "Paused", budget: "₹800/day", reach: "9,500", impressions: "12,000", clicks: "680", ctr: "5.67%", cpm: "₹353", spend: "₹4,240", conversions: "31", costPerResult: "₹137" },
  ],
  recommendations: [
    { type: "Audience", title: "Expand Lookalike Audience", description: "1% se 3% lookalike audience expand karne se reach 3x ho sakti hai", impact: "High" },
    { type: "Creative", title: "Add video ads", description: "Video ads image ads se 2x zyada engagement dete hain", impact: "High" },
    { type: "Budget", title: "Increase Instagram campaign budget", description: "Instagram campaign best performance de raha hai — budget badhao", impact: "Medium" },
  ],
};

export default function MetaAdsPage() {
  useAuth();
  const router = useRouter();
  const [activePage, setActivePage] = useState<"overview" | "campaigns" | "adgroups" | "keywords" | "billing">("overview");
  const [dateRange, setDateRange] = useState("Last 14 days");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignStep, setCampaignStep] = useState(1);
  const [showMoreAssetTypes, setShowMoreAssetTypes] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: "", goal: "", type: "", budget: "", objective: "Conversions",
    startDate: "", endDate: "", targeting: "Automatically maximize conversions",
  });

  const primaryColor = "#1877F2";
  const metaData = META_OVERVIEW_DATA;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-blue-600 cursor-pointer" onClick={() => router.push("/dashboard")}>HotelPro</h1>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1877F2]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-xs font-medium text-white">Meta Ads</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      {/* Secondary Nav */}
      <div className="bg-white border-b border-gray-200 px-4 flex items-center gap-1 overflow-x-auto">
        {[
          { key: "overview", label: "Overview" },
          { key: "campaigns", label: "Campaigns" },
          { key: "adgroups", label: "Ad Sets" },
          { key: "keywords", label: "Audiences" },
          { key: "billing", label: "Billing" },
        ].map(page => (
          <button key={page.key} onClick={() => setActivePage(page.key as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activePage === page.key ? "border-current font-semibold" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            style={{ color: activePage === page.key ? primaryColor : undefined,
              borderBottomColor: activePage === page.key ? primaryColor : undefined }}>
            {page.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {activePage === "overview" ? "Overview" :
               activePage === "campaigns" ? "Campaigns" :
               activePage === "adgroups" ? "Ad Sets" :
               activePage === "keywords" ? "Audiences" : "Billing"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Demo Data • {metaData.dateRange}</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option>Last 7 days</option>
              <option>Last 14 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
              <option>Last month</option>
            </select>
            <button onClick={() => setShowCreateModal(true)}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              style={{ backgroundColor: primaryColor }}>
              + New Campaign
            </button>
          </div>
        </div>

        {/* ==================== OVERVIEW PAGE ==================== */}
        {activePage === "overview" && (
          <div className="space-y-6">

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metaData.summary).map(([key, stat]) => (
                <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs mt-1 font-medium ${stat.up ? "text-green-600" : "text-red-500"}`}>
                    {stat.up ? "▲" : "▼"} {stat.change} vs prev period
                  </p>
                </div>
              ))}
            </div>

            {/* Campaigns Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Campaign Performance</h3>
                <button onClick={() => setActivePage("campaigns")}
                  className="text-xs font-medium hover:underline" style={{ color: primaryColor }}>
                  View all campaigns →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Campaign", "Status", "Budget", "Reach", "Impressions", "Clicks", "CTR", "Spend", "Conversions", "Cost/Result"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metaData.campaigns.map((campaign, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">{campaign.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            campaign.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>{campaign.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{campaign.budget}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{campaign.reach}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{campaign.impressions}</td>
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: primaryColor }}>{campaign.clicks}</td>
                        <td className="px-4 py-3 text-xs text-green-600">{campaign.ctr}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{campaign.spend}</td>
                        <td className="px-4 py-3 text-xs text-purple-600 font-medium">{campaign.conversions}</td>
                        <td className="px-4 py-3 text-xs text-orange-500">{campaign.costPerResult}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">💡 Recommendations</h3>
              <div className="space-y-3">
                {metaData.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}>
                      {rec.type[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{rec.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${rec.impact === "High" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}>
                          {rec.impact} Impact
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{rec.description}</p>
                    </div>
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg text-white hover:opacity-90 flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}>Apply</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== CAMPAIGNS PAGE ==================== */}
        {activePage === "campaigns" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">All Campaigns</h3>
              <button onClick={() => setShowCreateModal(true)}
                className="text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90"
                style={{ backgroundColor: primaryColor }}>
                + New Campaign
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50">
                  <tr>
                    {["Campaign", "Status", "Budget", "Reach", "Impressions", "Clicks", "CTR", "CPM", "Spend", "Conversions", "Cost/Result"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metaData.campaigns.map((campaign, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium hover:underline" style={{ color: primaryColor }}>{campaign.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${campaign.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}></div>
                          <span className="text-xs text-gray-600">{campaign.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{campaign.budget}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{campaign.reach}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{campaign.impressions}</td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: primaryColor }}>{campaign.clicks}</td>
                      <td className="px-4 py-3 text-xs text-green-600">{campaign.ctr}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{campaign.cpm}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{campaign.spend}</td>
                      <td className="px-4 py-3 text-xs text-purple-600 font-medium">{campaign.conversions}</td>
                      <td className="px-4 py-3 text-xs text-red-500">{campaign.costPerResult}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900" colSpan={3}>Total</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">1,09,500</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">1,42,000</td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: primaryColor }}>4,580</td>
                    <td className="px-4 py-3 text-xs font-bold text-green-600">3.23%</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">—</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">₹38,450</td>
                    <td className="px-4 py-3 text-xs font-bold text-purple-600">150</td>
                    <td className="px-4 py-3 text-xs font-bold text-red-500">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ==================== AD SETS PAGE ==================== */}
        {activePage === "adgroups" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Ad Sets</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    {["Ad Set", "Campaign", "Status", "Impressions", "Clicks", "CTR", "Avg CPC", "Conversions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Travel Interest - 25-45", campaign: "Hotel Awareness", status: "Active", impressions: "8,200", clicks: "620", ctr: "7.56%", cpc: "₹24.19", conversions: "32" },
                    { name: "Lookalike - Bookers", campaign: "Hotel Awareness", status: "Active", impressions: "4,300", clicks: "270", ctr: "6.28%", cpc: "₹18.52", conversions: "13" },
                    { name: "Instagram Stories", campaign: "Instagram Booking Drive", status: "Active", impressions: "22,000", clicks: "580", ctr: "2.64%", cpc: "₹10.34", conversions: "18" },
                    { name: "Retargeting - Visitors", campaign: "Retargeting", status: "Paused", impressions: "5,400", clicks: "210", ctr: "3.89%", cpc: "₹15.71", conversions: "8" },
                  ].map((ag, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium hover:underline cursor-pointer" style={{ color: primaryColor }}>{ag.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{ag.campaign}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${ag.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}></div>
                          <span className="text-xs text-gray-600">{ag.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{ag.impressions}</td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: primaryColor }}>{ag.clicks}</td>
                      <td className="px-4 py-3 text-xs text-green-600">{ag.ctr}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{ag.cpc}</td>
                      <td className="px-4 py-3 text-xs text-purple-600 font-medium">{ag.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== AUDIENCES PAGE ==================== */}
        {activePage === "keywords" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Audiences</h3>
              <button className="text-xs font-medium px-3 py-1.5 rounded-lg text-white hover:opacity-90"
                style={{ backgroundColor: primaryColor }}>
                + Add Audience
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    {["Audience", "Type", "Size", "Campaign", "Status", "Reach", "Impressions", "Clicks", "Conversions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { audience: "Travel Enthusiasts", type: "Interest", size: "500K-1M", campaign: "Hotel Awareness", status: "Active", reach: "62,000", imp: "85,000", clicks: "2,100", conv: "52" },
                    { audience: "Lookalike - Bookers", type: "Lookalike", size: "100K-200K", campaign: "Instagram Drive", status: "Active", reach: "38,000", imp: "45,000", clicks: "1,800", conv: "67" },
                    { audience: "Website Visitors", type: "Custom", size: "5K-10K", campaign: "Retargeting", status: "Paused", reach: "9,500", imp: "12,000", clicks: "680", conv: "31" },
                    { audience: "Instagram Engagers", type: "Engagement", size: "20K-50K", campaign: "Instagram Drive", status: "Active", reach: "28,000", imp: "32,000", clicks: "1,200", conv: "45" },
                  ].map((aud, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: primaryColor }}>{aud.audience}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{aud.type}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-600">{aud.size}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{aud.campaign}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${aud.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}></div><span className="text-xs text-gray-600">{aud.status}</span></div></td>
                      <td className="px-4 py-3 text-xs text-gray-700">{aud.reach}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{aud.imp}</td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: primaryColor }}>{aud.clicks}</td>
                      <td className="px-4 py-3 text-xs text-purple-600 font-medium">{aud.conv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== BILLING PAGE ==================== */}
        {activePage === "billing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Current Balance", value: "₹12,500", sub: "Available to spend", color: "text-green-600" },
                { label: "Monthly Spend", value: "₹38,450", sub: "April 2026", color: "text-gray-900" },
                { label: "Payment Method", value: "HDFC Credit Card", sub: "****4242", color: "text-gray-700" },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Transaction History</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Date", "Description", "Amount", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: "Apr 12, 2026", desc: "Auto payment - Daily spend", amount: "₹3,210", status: "Completed" },
                    { date: "Apr 11, 2026", desc: "Auto payment - Daily spend", amount: "₹3,190", status: "Completed" },
                    { date: "Apr 10, 2026", desc: "Auto payment - Daily spend", amount: "₹3,640", status: "Completed" },
                    { date: "Apr 9, 2026", desc: "Auto payment - Daily spend", amount: "₹3,480", status: "Completed" },
                    { date: "Apr 8, 2026", desc: "Auto payment - Daily spend", amount: "₹3,790", status: "Completed" },
                  ].map((tx, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-600">{tx.date}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{tx.desc}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-900">{tx.amount}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{tx.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ==================== CREATE META CAMPAIGN MODAL ==================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-6xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: primaryColor }}>f</div>
              <h3 className="text-lg font-semibold text-gray-900">New Meta Campaign</h3>
            </div>

            <div className="space-y-5">

              {/* Row 1: Buying Type + Campaign Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1 block">
                    Choose a buying type
                    <span className="w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 text-[9px] flex items-center justify-center cursor-default flex-shrink-0">i</span>
                  </label>
                  <div className="relative">
                    <select
                      value={(campaignForm as any).metaBuyingType || "Auction"}
                      onChange={(e) => {
                        const val = e.target.value;
                        const curObj = (campaignForm as any).metaObjective || "Awareness";
                        const newObj = val === "Reservation" && !["Awareness","Engagement"].includes(curObj) ? "Awareness" : curObj;
                        setCampaignForm({ ...campaignForm, name: `New ${newObj} campaign`, metaBuyingType: val, metaObjective: newObj } as any);
                      }}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 appearance-none bg-white">
                      <option>Auction</option>
                      <option>Reservation</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Campaign name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">✓</span>
                    <input
                      type="text"
                      value={campaignForm.name || `New ${(campaignForm as any).metaObjective || "Awareness"} campaign`}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Campaign Objective */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Choose a campaign objective</p>
                <div className="space-y-1.5">
                  {[
                    { key: "Awareness", icon: "📢", auctionOnly: false },
                    { key: "Traffic", icon: "🖱️", auctionOnly: true },
                    { key: "Engagement", icon: "💬", auctionOnly: false },
                    { key: "Leads", icon: "🎯", auctionOnly: true },
                    { key: "App promotion", icon: "📱", auctionOnly: true },
                    { key: "Sales", icon: "🛍️", auctionOnly: true },
                  ]
                    .filter(o => (campaignForm as any).metaBuyingType === "Reservation" ? !o.auctionOnly : true)
                    .map((obj) => {
                      const selected = ((campaignForm as any).metaObjective || "Awareness") === obj.key;
                      return (
                        <div key={obj.key}
                          onClick={() => setCampaignForm({ ...campaignForm, name: `New ${obj.key} campaign`, metaObjective: obj.key } as any)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${selected ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}>
                          <div className={`w-2 h-2 rounded-full border-2 flex-shrink-0 ${selected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`} />
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${selected ? "bg-blue-500" : "bg-gray-100"}`}>
                            <span>{obj.icon}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{obj.key}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Budget + Bid Strategy */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1 block">
                    Budget
                    <span className="w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 text-[9px] flex items-center justify-center cursor-default flex-shrink-0">i</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        value={(campaignForm as any).metaBudgetType || "Daily budget"}
                        onChange={(e) => setCampaignForm({ ...campaignForm, metaBudgetType: e.target.value } as any)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 appearance-none bg-white">
                        <option>Daily budget</option>
                        <option>Lifetime budget</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
                    </div>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 gap-1 min-w-[110px]">
                      <span className="text-xs text-gray-500">₹</span>
                      <input type="number" defaultValue={200}
                        className="w-full text-sm focus:outline-none text-right bg-transparent" />
                      <span className="text-xs text-gray-400">INR</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    You'll spend an average of ₹200.00 per day. Max daily ₹350.00, weekly ₹1,400.00.
                  </p>
                  <button className="text-xs text-blue-500 mt-1 hover:underline">About daily budget</button>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1 block">
                    Campaign bid strategy
                    <span className="w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 text-[9px] flex items-center justify-center cursor-default flex-shrink-0">i</span>
                  </label>
                  <div className="relative">
                    <select
                      value={(campaignForm as any).metaBidStrategy || "Highest volume"}
                      onChange={(e) => setCampaignForm({ ...campaignForm, metaBidStrategy: e.target.value } as any)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 appearance-none bg-white">
                      <option>Highest volume</option>
                      <option>Cost per result goal</option>
                      <option>Bid cap</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {((campaignForm as any).metaBidStrategy || "Highest volume") === "Highest volume"
                      ? "Get the most results for your budget."
                      : (campaignForm as any).metaBidStrategy === "Cost per result goal"
                      ? "Aim for a certain cost per result while maximising volume."
                      : "Set a maximum bid across all auctions."}
                  </p>
                </div>
              </div>

              {/* Show/Hide Options */}
              <div>
                <button
                  onClick={() => setShowMoreAssetTypes(!showMoreAssetTypes)}
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  {showMoreAssetTypes ? "▲ Hide options" : "▼ Show options"}
                </button>
                {showMoreAssetTypes && (
                  <div className="mt-3 border border-gray-100 rounded-xl p-4 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-0.5 flex items-center gap-1">
                        Budget scheduling
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 text-[9px] flex items-center justify-center flex-shrink-0">i</span>
                      </p>
                      <p className="text-xs text-gray-400 mb-2">Increase your budget during specific days or times.</p>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox"
                            checked={!!(campaignForm as any).metaScheduleBudget}
                            onChange={(e) => setCampaignForm({ ...campaignForm, metaScheduleBudget: e.target.checked } as any)}
                            className="w-3.5 h-3.5 accent-blue-500" />
                          <span className="text-xs text-gray-700">Schedule budget increases</span>
                        </label>
                        <button className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-500">View ▼</button>
                      </div>
                      {(campaignForm as any).metaScheduleBudget && (
                        <div className="mt-3 border border-gray-200 rounded-lg p-3 space-y-3">
                          <p className="text-xs font-medium text-gray-700">Time period for budget increase</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Starts on</p>
                              <div className="flex items-center gap-1">
                                <input type="date" className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none" defaultValue="2026-06-05" />
                                <input type="time" className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none" defaultValue="00:00" />
                              </div>
                            </div>
                            <span className="text-gray-400 mt-4">—</span>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Ends</p>
                              <div className="flex items-center gap-1">
                                <input type="date" className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none" defaultValue="2026-06-06" />
                                <input type="time" className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none" defaultValue="00:00" />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <select
                                value={(campaignForm as any).metaBudgetIncreaseType || "value"}
                                onChange={(e) => setCampaignForm({ ...campaignForm, metaBudgetIncreaseType: e.target.value } as any)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none appearance-none bg-white">
                                <option value="value">Increase daily budget by value amount (₹)</option>
                                <option value="percent">Increase daily budget by a percentage (%)</option>
                              </select>
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
                            </div>
                            <div className="flex items-center border border-gray-200 rounded-lg px-2 py-2 gap-1 min-w-[80px]">
                              <span className="text-xs text-gray-500">{(campaignForm as any).metaBudgetIncreaseType === "percent" ? "" : "₹"}</span>
                              <input type="number" defaultValue={(campaignForm as any).metaBudgetIncreaseType === "percent" ? 25 : 5}
                                className="w-12 text-xs focus:outline-none text-right bg-transparent" />
                              <span className="text-xs text-gray-400">{(campaignForm as any).metaBudgetIncreaseType === "percent" ? "%" : "INR"}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">Meta will aim to spend an average of ₹25 a day (a ₹5 increase) from 5 Jun to 6 Jun.</p>
                          <button className="text-xs text-gray-500 border border-gray-200 rounded px-3 py-1.5 flex items-center gap-1">🗑️ Remove this period</button>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium text-gray-700 mb-0.5 flex items-center gap-1">
                        Ad scheduling
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 text-[9px] flex items-center justify-center flex-shrink-0">i</span>
                      </p>
                      <p className="text-xs text-gray-400">Run ads all the time</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowCreateModal(false); setCampaignStep(1); }}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
              <button
                onClick={() => { alert("Meta Campaign published!"); setShowCreateModal(false); setCampaignStep(1); }}
                className="flex-1 text-white py-2 rounded-lg text-sm font-medium hover:opacity-90"
                style={{ backgroundColor: primaryColor }}>
                🚀 Publish Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
