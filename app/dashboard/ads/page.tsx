"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";

// Mock Data
const OVERVIEW_DATA = {
  dateRange: "Apr 1, 2026 - Apr 12, 2026",
  summary: {
    impressions: { value: "66,400", change: "+12.3%", up: true },
    clicks: { value: "2,540", change: "+8.7%", up: true },
    ctr: { value: "3.83%", change: "+0.4%", up: true },
    avgCpc: { value: "₹17.81", change: "-2.1%", up: false },
    cost: { value: "₹45,230", change: "+6.2%", up: true },
    conversions: { value: "91", change: "+15.4%", up: true },
    convRate: { value: "3.58%", change: "+0.6%", up: true },
    costPerConv: { value: "₹497.03", change: "-7.8%", up: false },
  },
  campaigns: [
    { name: "Hotel Booking - Search", status: "Enabled", budget: "₹2,000/day", impressions: "12,500", clicks: "890", ctr: "7.12%", avgCpc: "₹22.47", cost: "₹20,000", conversions: "45", convRate: "5.06%", costPerConv: "₹444" },
    { name: "Brand Awareness - Display", status: "Enabled", budget: "₹1,500/day", impressions: "45,000", clicks: "1,200", ctr: "2.67%", avgCpc: "₹12.50", cost: "₹15,000", conversions: "28", convRate: "2.33%", costPerConv: "₹536" },
    { name: "Remarketing Campaign", status: "Paused", budget: "₹1,000/day", impressions: "8,900", clicks: "450", ctr: "5.06%", avgCpc: "₹22.89", cost: "₹10,300", conversions: "18", convRate: "4.00%", costPerConv: "₹572" },
  ],
  recommendations: [
    { type: "Bid", title: "Increase bids for top keywords", description: "Aapke 3 keywords low bid ki wajah se impression share kho rahe hain", impact: "High" },
    { type: "Budget", title: "Increase budget for Search campaign", description: "Aapka Search campaign budget limited hai — ₹500 badhane se 20% zyada clicks aa sakte hain", impact: "High" },
    { type: "Ad", title: "Add responsive search ads", description: "Responsive ads add karne se CTR improve ho sakti hai", impact: "Medium" },
  ],
  chartData: [
    { date: "Apr 1", clicks: 180, impressions: 5200, cost: 3200 },
    { date: "Apr 2", clicks: 210, impressions: 5800, cost: 3740 },
    { date: "Apr 3", clicks: 195, impressions: 5100, cost: 3470 },
    { date: "Apr 4", clicks: 240, impressions: 6200, cost: 4270 },
    { date: "Apr 5", clicks: 220, impressions: 5900, cost: 3920 },
    { date: "Apr 6", clicks: 185, impressions: 4800, cost: 3290 },
    { date: "Apr 7", clicks: 165, impressions: 4200, cost: 2940 },
    { date: "Apr 8", clicks: 255, impressions: 6800, cost: 4540 },
    { date: "Apr 9", clicks: 235, impressions: 6100, cost: 4180 },
    { date: "Apr 10", clicks: 245, impressions: 6400, cost: 4360 },
    { date: "Apr 11", clicks: 215, impressions: 5600, cost: 3830 },
    { date: "Apr 12", clicks: 195, impressions: 5100, cost: 3470 },
  ]
};

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

export default function AdsPage() {
  useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"google" | "meta">("google");
  const [activePage, setActivePage] = useState<"overview" | "campaigns" | "adgroups" | "keywords" | "billing">("overview");
  const [dateRange, setDateRange] = useState("Last 14 days");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignStep, setCampaignStep] = useState(1);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [locationOption, setLocationOption] = useState("All countries and territories");
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [locationSearchType, setLocationSearchType] = useState("Location");
  const [bidFocus, setBidFocus] = useState("Conversions");
  const [targetCPA, setTargetCPA] = useState(false);
  const [showMoreAssetTypes, setShowMoreAssetTypes] = useState(false);
  const [showAdditionalSignals, setShowAdditionalSignals] = useState(false);
  const [showYourData, setShowYourData] = useState(true);
  const [showAudienceName, setShowAudienceName] = useState(false);
  const [showSearchThemes, setShowSearchThemes] = useState(true);
  const [showAudienceSignal, setShowAudienceSignal] = useState(true);
  const [campaignForm, setCampaignForm] = useState({
    name: "", goal: "", type: "", budget: "", objective: "Conversions",
    startDate: "", endDate: "", targeting: "Automatically maximize conversions",
  });

  const isGoogle = activeTab === "google";
  const goalTypeMap: Record<string, string[]> = {
     "Leads": ["Performance Max", "Search", "Display", "Video"],
    "Website traffic": ["Performance Max", "Search", "Display", "Video"],
    "YouTube reach, views, and engagements": ["Video"],
    "Local store visits and promotions": ["Performance Max"],
    "Create a campaign without guidance": ["Performance Max", "Search", "Display", "Video"],
  };
  const allowedTypes = campaignForm.goal ? goalTypeMap[campaignForm.goal] : [];
  const primaryColor = isGoogle ? "#4285F4" : "#1877F2";
  const data = OVERVIEW_DATA;
  const metaData = META_OVERVIEW_DATA;
  const currentData = isGoogle ? data : metaData;

  const maxClicks = Math.max(...data.chartData.map(d => d.clicks));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-blue-600 cursor-pointer" onClick={() => router.push("/dashboard")}>HotelPro</h1>
          <span className="text-gray-300">|</span>
          {/* Platform Switch */}
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab("google")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === "google" ? "bg-[#4285F4] text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill={activeTab === "google" ? "white" : "#4285F4"}/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={activeTab === "google" ? "white" : "#34A853"}/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill={activeTab === "google" ? "white" : "#FBBC05"}/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={activeTab === "google" ? "white" : "#EA4335"}/>
              </svg>
              Google Ads
            </button>
            <button onClick={() => setActiveTab("meta")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === "meta" ? "bg-[#1877F2] text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={activeTab === "meta" ? "white" : "#1877F2"}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Meta Ads
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      {/* Secondary Nav — Pages */}
      <div className="bg-white border-b border-gray-200 px-4 flex items-center gap-1 overflow-x-auto">
        {[
          { key: "overview", label: "Overview" },
          { key: "campaigns", label: "Campaigns" },
          { key: "adgroups", label: isGoogle ? "Ad Groups" : "Ad Sets" },
          { key: "keywords", label: isGoogle ? "Keywords" : "Audiences" },
          { key: "billing", label: "Billing" },
        ].map(page => (
          <button key={page.key} onClick={() => setActivePage(page.key as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activePage === page.key
                ? "border-current font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
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
               activePage === "adgroups" ? (isGoogle ? "Ad Groups" : "Ad Sets") :
               activePage === "keywords" ? (isGoogle ? "Keywords" : "Audiences") : "Billing"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Demo Data • {currentData.dateRange}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Range */}
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
              {isGoogle ? (
                Object.entries(data.summary).map(([key, stat]) => (
                  <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-xs mt-1 font-medium ${stat.up ? "text-green-600" : "text-red-500"}`}>
                      {stat.up ? "▲" : "▼"} {stat.change} vs prev period
                    </p>
                  </div>
                ))
              ) : (
                Object.entries(metaData.summary).map(([key, stat]) => (
                  <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-xs mt-1 font-medium ${stat.up ? "text-green-600" : "text-red-500"}`}>
                      {stat.up ? "▲" : "▼"} {stat.change} vs prev period
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Chart */}
            {isGoogle && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Clicks Over Time</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: primaryColor }}></span>
                    <span className="text-xs text-gray-500">Clicks</span>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {data.chartData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-sm transition-all hover:opacity-80"
                        style={{
                          height: `${(d.clicks / maxClicks) * 100}%`,
                          backgroundColor: primaryColor,
                          minHeight: "4px"
                        }}></div>
                      <span className="text-xs text-gray-400 hidden md:block" style={{ fontSize: "9px" }}>{d.date.split(" ")[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                      {["Campaign", "Status", "Budget", "Impressions", "Clicks", "CTR", "Cost", "Conversions", "Conv. Rate"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(isGoogle ? data.campaigns : metaData.campaigns).map((campaign, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">{campaign.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            campaign.status === "Enabled" || campaign.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}>{campaign.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{campaign.budget}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{campaign.impressions}</td>
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: primaryColor }}>{campaign.clicks}</td>
                        <td className="px-4 py-3 text-xs text-green-600">{campaign.ctr}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{isGoogle ? (campaign as any).cost : (campaign as any).spend}</td>
                        <td className="px-4 py-3 text-xs text-purple-600 font-medium">{campaign.conversions}</td>
                        <td className="px-4 py-3 text-xs text-orange-500">{(campaign as any).convRate || (campaign as any).costPerResult}</td>
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
                {(isGoogle ? data.recommendations : metaData.recommendations).map((rec, i) => (
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
                      style={{ backgroundColor: primaryColor }}>
                      Apply
                    </button>
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
                    {["Campaign", "Status", "Budget", "Impressions", "Clicks", "CTR", "Avg CPC", "Cost", "Conversions", "Conv. Rate", "Cost/Conv."].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(isGoogle ? data.campaigns : metaData.campaigns).map((campaign, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-900 hover:underline" style={{ color: primaryColor }}>{campaign.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${campaign.status === "Enabled" || campaign.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}></div>
                          <span className="text-xs text-gray-600">{campaign.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{campaign.budget}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{campaign.impressions}</td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: primaryColor }}>{campaign.clicks}</td>
                      <td className="px-4 py-3 text-xs text-green-600">{campaign.ctr}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{isGoogle ? (campaign as any).avgCpc : (campaign as any).cpm}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{isGoogle ? (campaign as any).cost : (campaign as any).spend}</td>
                      <td className="px-4 py-3 text-xs text-purple-600 font-medium">{campaign.conversions}</td>
                      <td className="px-4 py-3 text-xs text-orange-500">{isGoogle ? (campaign as any).convRate : (campaign as any).ctr}</td>
                      <td className="px-4 py-3 text-xs text-red-500">{(campaign as any).costPerResult || (campaign as any).costPerConv}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900" colSpan={3}>Total</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">{isGoogle ? "66,400" : "1,42,000"}</td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: primaryColor }}>{isGoogle ? "2,540" : "4,580"}</td>
                    <td className="px-4 py-3 text-xs font-bold text-green-600">{isGoogle ? "3.83%" : "3.23%"}</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">—</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">{isGoogle ? "₹45,300" : "₹38,450"}</td>
                    <td className="px-4 py-3 text-xs font-bold text-purple-600">{isGoogle ? "91" : "150"}</td>
                    <td className="px-4 py-3 text-xs font-bold text-orange-500">—</td>
                    <td className="px-4 py-3 text-xs font-bold text-red-500">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ==================== AD GROUPS / AD SETS PAGE ==================== */}
        {activePage === "adgroups" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{isGoogle ? "Ad Groups" : "Ad Sets"}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    {[isGoogle ? "Ad Group" : "Ad Set", "Campaign", "Status", "Impressions", "Clicks", "CTR", "Avg CPC", "Conversions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: isGoogle ? "Luxury Hotels" : "Travel Interest - 25-45", campaign: isGoogle ? "Hotel Booking - Search" : "Hotel Awareness", status: "Enabled", impressions: "8,200", clicks: "620", ctr: "7.56%", cpc: "₹24.19", conversions: "32" },
                    { name: isGoogle ? "Budget Hotels" : "Lookalike - Bookers", campaign: isGoogle ? "Hotel Booking - Search" : "Hotel Awareness", status: "Enabled", impressions: "4,300", clicks: "270", ctr: "6.28%", cpc: "₹18.52", conversions: "13" },
                    { name: isGoogle ? "Hotel Packages" : "Instagram Stories", campaign: isGoogle ? "Brand Awareness" : "Instagram Booking Drive", status: "Enabled", impressions: "22,000", clicks: "580", ctr: "2.64%", cpc: "₹10.34", conversions: "18" },
                    { name: isGoogle ? "Competitor Keywords" : "Retargeting - Visitors", campaign: isGoogle ? "Brand Awareness" : "Retargeting", status: "Paused", impressions: "5,400", clicks: "210", ctr: "3.89%", cpc: "₹15.71", conversions: "8" },
                  ].map((ag, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium hover:underline cursor-pointer" style={{ color: primaryColor }}>{ag.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{ag.campaign}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${ag.status === "Enabled" ? "bg-green-500" : "bg-gray-400"}`}></div>
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

        {/* ==================== KEYWORDS / AUDIENCES PAGE ==================== */}
        {activePage === "keywords" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{isGoogle ? "Keywords" : "Audiences"}</h3>
              <button className="text-xs font-medium px-3 py-1.5 rounded-lg text-white hover:opacity-90"
                style={{ backgroundColor: primaryColor }}>
                + Add {isGoogle ? "Keywords" : "Audience"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    {isGoogle
                      ? ["Keyword", "Match Type", "Ad Group", "Status", "Impressions", "Clicks", "CTR", "Avg CPC", "Conversions", "Quality Score"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                      ))
                      : ["Audience", "Type", "Size", "Campaign", "Status", "Reach", "Impressions", "Clicks", "Conversions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                      ))
                    }
                  </tr>
                </thead>
                <tbody>
                  {isGoogle ? [
                    { keyword: "luxury hotel booking", match: "Exact", adgroup: "Luxury Hotels", status: "Enabled", imp: "3,200", clicks: "280", ctr: "8.75%", cpc: "₹28.57", conv: "18", qs: "9/10" },
                    { keyword: "hotel near me", match: "Broad", adgroup: "Budget Hotels", status: "Enabled", imp: "5,100", clicks: "320", ctr: "6.27%", cpc: "₹20.31", conv: "15", qs: "7/10" },
                    { keyword: "cheap hotel rooms", match: "Phrase", adgroup: "Budget Hotels", status: "Enabled", imp: "2,800", clicks: "180", ctr: "6.43%", cpc: "₹16.67", conv: "8", qs: "6/10" },
                    { keyword: "best hotel deals", match: "Broad", adgroup: "Hotel Packages", status: "Paused", imp: "1,900", clicks: "95", ctr: "5.00%", cpc: "₹15.79", conv: "4", qs: "5/10" },
                    { keyword: "hotel booking online", match: "Exact", adgroup: "Luxury Hotels", status: "Enabled", imp: "4,500", clicks: "360", ctr: "8.00%", cpc: "₹22.22", conv: "22", qs: "8/10" },
                  ].map((kw, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: primaryColor }}>{kw.keyword}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{kw.match}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-600">{kw.adgroup}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${kw.status === "Enabled" ? "bg-green-500" : "bg-gray-400"}`}></div><span className="text-xs text-gray-600">{kw.status}</span></div></td>
                      <td className="px-4 py-3 text-xs text-gray-700">{kw.imp}</td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: primaryColor }}>{kw.clicks}</td>
                      <td className="px-4 py-3 text-xs text-green-600">{kw.ctr}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{kw.cpc}</td>
                      <td className="px-4 py-3 text-xs text-purple-600 font-medium">{kw.conv}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${parseInt(kw.qs) * 10}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-600">{kw.qs}</span>
                        </div>
                      </td>
                    </tr>
                  )) : [
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
                { label: "Monthly Spend", value: isGoogle ? "₹45,230" : "₹38,450", sub: "April 2026", color: "text-gray-900" },
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
                    { date: "Apr 12, 2026", desc: "Auto payment - Daily spend", amount: "₹3,470", status: "Completed" },
                    { date: "Apr 11, 2026", desc: "Auto payment - Daily spend", amount: "₹3,830", status: "Completed" },
                    { date: "Apr 10, 2026", desc: "Auto payment - Daily spend", amount: "₹4,360", status: "Completed" },
                    { date: "Apr 9, 2026", desc: "Auto payment - Daily spend", amount: "₹4,180", status: "Completed" },
                    { date: "Apr 8, 2026", desc: "Auto payment - Daily spend", amount: "₹4,540", status: "Completed" },
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

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-6xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: primaryColor }}>
                {isGoogle ? "G" : "f"}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">New {isGoogle ? "Google" : "Meta"} Campaign</h3>
            </div>
            <div className="space-y-3">
             <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Campaign Name</label>
                  <input type="text" placeholder="e.g. Hotel Summer Sale" value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Campaign Goal</label>
                  <select value={campaignForm.goal} onChange={(e) => setCampaignForm({ ...campaignForm, goal: e.target.value, type: "" })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                   <option value="">Select Goal</option>
                    <option>Leads</option>
                    <option>Website traffic</option>
                    <option>YouTube reach, views, and engagements</option>
                    <option>Local store visits and promotions</option>
                    <option>Create a campaign without guidance</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Campaign Type</label>
                  <select value={campaignForm.type} onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                   <option value="">Select Type</option>
                    {allowedTypes.map(type => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
             {campaignStep === 2 && (
              <>
                {/* Performance Max */}
                {campaignForm.type === "Performance Max" && (
                  <div className="space-y-4">
                     <div className="border border-gray-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Where should people go after clicking your ads?</p>
                      <p className="text-xs text-gray-500 mb-3">Think about the product or service you want to sell and enter the URL you want people to see after clicking your ads.</p>
                      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5">
                        <span className="text-gray-400 mr-2">🔗</span>
                        <input type="text" placeholder="Final URL" className="flex-1 text-sm focus:outline-none" />
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Campaign name</p>
                      <input type="text" defaultValue={`${campaignForm.goal}-Performance Max-1`}
                        className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-64 focus:outline-none" />
                    </div>
                  </div>
                )}

                {/* Search — Leads / Without guidance: Website visits, Store visits */}
               {campaignForm.type === "Search" && (campaignForm.goal === "Leads" || campaignForm.goal === "Create a campaign without guidance") && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Select the ways you'd like to reach your goal ⓘ</p>
                    <div className="space-y-3">

                      {/* Website visits */}
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 accent-blue-600"
                            checked={!!(campaignForm as any).searchGoals?.websiteVisits}
                            onChange={(e) => setCampaignForm({ ...campaignForm, searchGoals: { ...(campaignForm as any).searchGoals, websiteVisits: e.target.checked } } as any)} />
                          <span className="text-sm text-gray-700">Website visits</span>
                        </label>
                        {(campaignForm as any).searchGoals?.websiteVisits && (
                          <div className="ml-6 mt-2 flex items-center border border-gray-300 rounded-lg px-3 py-2.5 w-80">
                            <span className="text-gray-400 mr-2">🔗</span>
                            <input type="text" placeholder="Your business's website" className="flex-1 text-sm focus:outline-none" />
                          </div>
                        )}
                      </div>

                      {/* Phone calls */}
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 accent-blue-600"
                            checked={!!(campaignForm as any).searchGoals?.phoneCalls}
                            onChange={(e) => setCampaignForm({ ...campaignForm, searchGoals: { ...(campaignForm as any).searchGoals, phoneCalls: e.target.checked } } as any)} />
                          <span className="text-sm text-gray-700">Phone calls</span>
                        </label>
                        {(campaignForm as any).searchGoals?.phoneCalls && (
                          <div className="ml-6 mt-2 flex items-center gap-2">
                            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                              <option>India (+91)</option>
                              <option>United States (+1)</option>
                              <option>United Kingdom (+44)</option>
                              <option>Australia (+61)</option>
                            </select>
                            <div className="flex flex-col">
                              <input type="text" placeholder="Phone number"
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-52" />
                              <span className="text-xs text-gray-400 mt-1">Example: 98765 43210</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Store visits */}
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 accent-blue-600"
                            checked={!!(campaignForm as any).searchGoals?.storeVisits}
                            onChange={(e) => setCampaignForm({ ...campaignForm, searchGoals: { ...(campaignForm as any).searchGoals, storeVisits: e.target.checked } } as any)} />
                          <span className="text-sm text-gray-700">Store visits</span>
                        </label>
                        {(campaignForm as any).searchGoals?.storeVisits && (
                          <p className="ml-6 mt-1 text-xs text-gray-500">Enter location on the next step</p>
                        )}
                      </div>

                      {/* Lead form submissions */}
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 accent-blue-600"
                            checked={!!(campaignForm as any).searchGoals?.leadForm}
                            onChange={(e) => setCampaignForm({ ...campaignForm, searchGoals: { ...(campaignForm as any).searchGoals, leadForm: e.target.checked } } as any)} />
                          <span className="text-sm text-gray-700">Lead form submissions</span>
                        </label>
                        {(campaignForm as any).searchGoals?.leadForm && (
                          <p className="ml-6 mt-1 text-xs text-gray-500">Add lead form on the next step</p>
                        )}
                      </div>

                    </div>

                    {/* Campaign name */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Campaign name</p>
                      <input type="text" defaultValue={`${campaignForm.goal}-${campaignForm.type}-1`}
                        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-72 focus:outline-none focus:border-blue-500" />
                    </div>

                  </div>
                )}

                {/* Search — Website Traffic: URL input */}
                {campaignForm.type === "Search" && campaignForm.goal === "Website traffic" && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Select the ways you'd like to reach your goal ⓘ</p>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5">
                      <span className="text-gray-400 mr-2">🔗</span>
                      <input type="text" placeholder="Your business's website"
                        className="flex-1 text-sm focus:outline-none" />
                    </div>
                  </div>
                )}

                {/* Display */}
                {campaignForm.type === "Display" && (
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">This is the web page people will go to after clicking your ad ⓘ</p>
                      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5">
                        <span className="text-gray-400 mr-2">🔗</span>
                        <input type="text" placeholder="Your business's website" className="flex-1 text-sm focus:outline-none" />
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Campaign name</p>
                      <input type="text" defaultValue={`${campaignForm.goal}-Display-1`}
                        className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-64 focus:outline-none" />
                    </div>
                  </div>
                )}

                {/* Video — Sales, Leads, Website Traffic */}
                {campaignForm.type === "Video" && (campaignForm.goal === "Sales" || campaignForm.goal === "Leads" || campaignForm.goal === "Website traffic") && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700">Get more conversions with video ads designed to encourage valuable interactions with your business. <span className="text-blue-600 cursor-pointer hover:underline">Learn more</span></p>
                  </div>
                )}

                {/* Video — Without guidance: Campaign subtype */}
                {campaignForm.type === "Video" && campaignForm.goal === "Create a campaign without guidance" && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Select a campaign subtype</p>
                    <div className="space-y-3">
                      {[
                        { value: "Video views", desc: "Get TrueView views and engagement from people who are more likely to consider your products or brand." },
                        { value: "Efficient reach", desc: "Get the most reach for your budget using bumper, skippable in-stream, in-feed, and Shorts ads.", group: "Video reach" },
                        { value: "Non-skippable reach", desc: "Reach people using bumper, standard non-skippable, and 30-second non-skippable in-stream ads.", group: "Video reach" },
                        { value: "Target frequency", desc: "Reach the same people multiple times using bumper, skippable in-stream, non-skippable in-stream, in-feed, and Shorts ads.", group: "Video reach" },
                        { value: "Drive conversions", desc: "Get more conversions with video ads designed to encourage valuable interactions with your business." },
                        { value: "Ad sequence", desc: "Tell your story by showing ads in a particular sequence to individual viewers." },
                        { value: "Audio reach", desc: "Reach people while they're listening to content on YouTube." },
                        { value: "YouTube subscriptions and engagements", desc: "Get subscriptions and drive engagement on your YouTube channel.", isNew: true },
                      ].map((subtype, i) => (
                        <div key={i}>
                          {subtype.group && i === 1 && <p className="text-xs font-medium text-gray-500 mb-2">Video reach</p>}
                          <label className="flex items-start gap-3 cursor-pointer border border-gray-200 rounded-lg p-3 hover:border-blue-400">
                            <input type="radio" name="subtype" value={subtype.value} defaultChecked={i === 0} className="mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{subtype.value} {subtype.isNew && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1">NEW</span>}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{subtype.desc}</p>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Leads — Performance Max, Search: Leads conversion goals (9 options) */}
                {campaignForm.goal === "Leads" && (campaignForm.type === "Performance Max" || campaignForm.type === "Search") && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Choose your leads conversion goals</p>
                    <p className="text-xs text-gray-500 mb-3">Pick the most important leads goals that you would like to focus on. Based on your selection, Smart Bidding will then optimize for delivering your ads to the right people to meet the goals. <span className="text-blue-600 cursor-pointer hover:underline">Learn more about smart bidding</span></p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        "Form submissions from your ads",
                        "Form submissions from your website",
                        "Phone calls from your ads",
                        "Sign up",
                        ...(showSeeMore ? ["Book appointments", "Quote request", "Get directions", "Outbound click", "Contact"] : [])
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-2 border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-400">
                          <input type="radio" name="leads-goal" />
                          <span className="text-xs font-medium text-gray-900">{item}</span>
                        </label>
                      ))}
                    </div>
                    <button onClick={() => setShowSeeMore(!showSeeMore)} className="text-sm text-blue-600 hover:underline mt-2">
                      {showSeeMore ? "See less" : "See more"}
                    </button>
                  </div>
                )}

                {/* Leads — Display: 7 options */}
                {campaignForm.goal === "Leads" && campaignForm.type === "Display" && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Choose your leads conversion goals</p>
                    <p className="text-xs text-gray-500 mb-3">Pick the most important leads goals that you would like to focus on. Based on your selection, Smart Bidding will then optimize for delivering your ads to the right people to meet the goals. <span className="text-blue-600 cursor-pointer hover:underline">Learn more about smart bidding</span></p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        "Form submissions from your website",
                        "Sign up",
                        "Book appointments",
                        "Quote request",
                        ...(showSeeMore ? ["Get directions", "Outbound click", "Contact"] : [])
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-2 border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-400">
                          <input type="radio" name="leads-goal-display" />
                          <span className="text-xs font-medium text-gray-900">{item}</span>
                        </label>
                      ))}
                    </div>
                    <button onClick={() => setShowSeeMore(!showSeeMore)} className="text-sm text-blue-600 hover:underline mt-2">
                      {showSeeMore ? "See less" : "See more"}
                    </button>
                  </div>
                )}

                {/* Website Traffic — Performance Max, Search, Display: Page view */}
                {campaignForm.goal === "Website traffic" && (campaignForm.type === "Performance Max" || campaignForm.type === "Search" || campaignForm.type === "Display") && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Choose your website traffic conversion goals</p>
                    <p className="text-xs text-gray-500 mb-3">Pick the most important website traffic goals that you would like to focus on. Based on your selection, Smart Bidding will then optimize for delivering your ads to the right people to meet the goals. <span className="text-blue-600 cursor-pointer hover:underline">Learn more about smart bidding</span></p>
                    <div className="grid grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-400">
                        <input type="radio" name="traffic-goal" />
                        <span className="text-xs font-medium text-gray-900">Page view</span>
                      </label>
                    </div>
                  </div>
                )}
                {/* Local store visits + Performance Max */}
                {campaignForm.goal === "Local store visits and promotions" && campaignForm.type === "Performance Max" && (
                  <div className="space-y-4">
                    {/* Conversion goals */}
                    <div className="border border-gray-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Choose your local store visits and promotions conversion goals</p>
                      <p className="text-xs text-gray-500 mb-3">Pick the most important local store visits and promotions goals that you would like to focus on. Based on your selection, Smart Bidding will then optimize for delivering your ads to the right people to meet the goals. <span className="text-blue-600 cursor-pointer hover:underline">Learn more about smart bidding</span></p>
                      <div className="space-y-2">
                        {[
                          { icon: "👥", title: "Contact", desc: "Show your ads to people who are more likely to contact a business like yours" },
                          { icon: "🔷", title: "Directions request", desc: "Show your ads to people who are more likely looking for directions to a business like yours" },
                        ].map((item, i) => (
                          <label key={i} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-400">
                            <span className="text-lg">{item.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.title}</p>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <input type="radio" name="local-goal" />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Campaign feeds */}
                    <div className="border border-gray-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Campaign feeds</p>
                      <p className="text-xs text-gray-500 mb-3">Expand available ad formats, power ad creatives, and improve targeting.</p>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Which store locations should your ads promote?</p>
                      <div className="space-y-2 mb-3">
                        {["Your business locations", "Affiliate locations"].map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="store-location" defaultChecked={i === 0} />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                        className="text-sm text-blue-600 hover:underline font-medium">
                        Link Account
                      </button>

                      {showAdvancedSearch && (
                        <div className="mt-4 border border-gray-200 rounded-xl p-4 space-y-3">
                          <p className="text-sm font-semibold text-gray-900">Choose locations for your account</p>
                          <div className="flex items-center gap-4 mb-3">
                            {["Google Business Profile", "Chain stores", "Google Maps"].map((opt, i) => (
                              <label key={i} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="loc-account"
                                  defaultChecked={i === 0}
                                  onChange={() => setLocationSearchType(opt)} />
                                <span className="text-sm text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>

                          {/* Google Business Profile */}
                          {(locationSearchType === "Location" || locationSearchType === "Google Business Profile") && (
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="bpm-account" defaultChecked />
                                <span className="text-sm text-gray-700">Select a Business Profile Manager account ⓘ</span>
                              </label>
                              <div className="ml-6 flex items-center border border-gray-300 rounded-lg px-3 py-2 w-72">
                                <span className="text-gray-400 mr-2">🔍</span>
                                <input type="text" placeholder="Search by email or profile name"
                                  className="flex-1 text-sm focus:outline-none" />
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="bpm-account" />
                                <span className="text-sm text-gray-700">Request access to another Business Profile Manager account ⓘ</span>
                              </label>
                              <div className="ml-6">
                                <input type="text" placeholder="Email address"
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none" />
                              </div>
                            </div>
                          )}

                          {/* Chain stores */}
                          {locationSearchType === "Chain stores" && (
                            <div className="space-y-2">
                              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                                <span className="text-gray-400 mr-2">🔍</span>
                                <input type="text" placeholder="Search chain stores"
                                  className="flex-1 text-sm focus:outline-none" />
                              </div>
                              <p className="text-xs text-gray-400">Search for chain stores to add locations</p>
                            </div>
                          )}

                          {/* Google Maps */}
                          {locationSearchType === "Google Maps" && (
                            <div className="space-y-2">
                              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                                <span className="text-gray-400 mr-2">🔍</span>
                                <input type="text" placeholder="Search location"
                                  className="flex-1 text-sm focus:outline-none" />
                              </div>
                              <p className="text-xs text-gray-400">Search for locations using Google Ads API</p>
                            </div>
                          )}

                          <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowAdvancedSearch(false)}
                              className="text-sm text-gray-600 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
                            <button className="text-sm text-white px-4 py-2 rounded-lg hover:opacity-90"
                              style={{ backgroundColor: primaryColor }}>Continue</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

               {/* YouTube reach */}
                {campaignForm.goal === "YouTube reach, views, and engagements" && campaignForm.type === "Video" && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Choose a campaign goal</p>
                    <div className="space-y-3">
                      {[
                        { value: "Video views", desc: "Get people to watch your video ads", recommended: true },
                        { value: "Reach", desc: "Reach the maximum number of people" },
                        { value: "YouTube subscriptions and engagements", desc: "Get people to subscribe and engage with your YouTube channel" },
                      ].map((sub, i) => (
                        <label key={i} className="flex items-start gap-3 cursor-pointer border border-gray-200 rounded-lg p-3 hover:border-blue-400">
                          <input type="radio" name="yt-subtype" defaultChecked={i === 0} className="mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {sub.value}
                              {sub.recommended && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-2">Recommended</span>}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{sub.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

               </>
            )}

            {campaignStep === 3 && campaignForm.type === "Display" && (campaignForm.goal === "Leads" || campaignForm.goal === "Website traffic" || campaignForm.goal === "Create a campaign without guidance") && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Campaign settings</h3>
                </div>

                {/* Locations */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Locations</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-gray-500">Select locations for this campaign ⓘ</p>
                    {["All countries and territories", "India", "Enter another location"].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="display-location" value={opt}
                          checked={locationOption === opt}
                          onChange={() => { setLocationOption(opt); setShowAdvancedSearch(false); }} />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}

                    {locationOption === "Enter another location" && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-72">
                            <span className="text-gray-400 mr-2">🔍</span>
                            <input type="text" placeholder="Enter a location to include or exclude"
                              className="flex-1 text-sm focus:outline-none" />
                          </div>
                          <button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                            className="text-sm text-blue-600 hover:underline font-medium">
                            Advanced search
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">For example, a country, city, region, or postal code</p>
                        {showAdvancedSearch && (
                          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
                            <div className="flex items-center gap-4">
                              {["Location", "Radius"].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" name="display-loc-type" value={type}
                                    checked={locationSearchType === type}
                                    onChange={() => setLocationSearchType(type)} />
                                  <span className="text-sm text-gray-700">{type}</span>
                                </label>
                              ))}
                            </div>
                            {locationSearchType === "Location" && (
                              <>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" className="w-4 h-4" />
                                  <span className="text-sm text-gray-700">Add locations in bulk</span>
                                </label>
                                <div className="border border-gray-300 rounded-lg px-3 py-2">
                                  <input type="text" placeholder="Enter a location to include or exclude"
                                    className="w-full text-sm focus:outline-none" />
                                </div>
                                <p className="text-xs text-gray-400">For example, a country, city, region, or postal code</p>
                              </>
                            )}
                            {locationSearchType === "Radius" && (
                              <div className="flex items-center gap-2">
                                <div className="border border-gray-300 rounded-lg px-3 py-2 flex-1">
                                  <input type="text" placeholder="Enter a place name, address or coordinates"
                                    className="w-full text-sm focus:outline-none" />
                                </div>
                                <input type="number" defaultValue={20}
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-16 focus:outline-none" />
                                <select className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none">
                                  <option>mi</option>
                                  <option>km</option>
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <button className="text-sm text-blue-600 hover:underline mt-1 flex items-center gap-1"
                      onClick={() => setShowLocationOptions(!showLocationOptions)}>
                      {showLocationOptions ? "∧" : "∨"} Location options
                    </button>
                    {showLocationOptions && (
                      <div className="space-y-2 mt-1">
                        <p className="text-xs text-gray-500">Include ⓘ</p>
                        {[
                          "Presence or interest: People in, regularly in, or who've shown interest in your included locations (recommended)",
                          "Presence: People in or regularly in your included locations"
                        ].map((opt, i) => (
                          <label key={i} className="flex items-start gap-2 cursor-pointer">
                            <input type="radio" name="display-loc-include" defaultChecked={i === 0} className="mt-0.5" />
                            <span className="text-xs text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Languages</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-gray-500">Select the languages your customers speak. ⓘ</p>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                      <span className="text-gray-400 mr-2">🔍</span>
                      <input type="text" placeholder="Start typing or select a language"
                        className="flex-1 text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        English <button className="ml-1 text-gray-400 hover:text-gray-600">×</button>
                      </span>
                    </div>
                  </div>
                </div>

                {/* EU Political Ads */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">EU political ads</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 flex gap-6">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-gray-700">Does your campaign have European Union political ads?</p>
                      <p className="text-xs text-red-500">Required</p>
                      {["Yes, this campaign has EU political ads", "No, this campaign doesn't have EU political ads"].map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="display-eu-political" />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs">
                      EU regulation requires Google to ask this question. <span className="text-blue-600 cursor-pointer hover:underline">Learn how an EU political ad is defined</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {campaignStep === 3 && campaignForm.type === "Search" && (campaignForm.goal === "Leads" || campaignForm.goal === "Website traffic" || campaignForm.goal === "Create a campaign without guidance") && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Campaign settings</h3>
                  <p className="text-xs text-gray-500 mt-1">To reach the right people, start by defining key settings for your campaign</p>
                </div>

                {/* Networks */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Networks</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 mt-0.5 accent-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Google Search Partners Network (recommended)</p>
                        <p className="text-xs text-gray-500 mt-0.5">Ads can appear near Google Search results and on other <span className="text-blue-600 cursor-pointer hover:underline">Google Search Partners</span> websites when people search for terms that are relevant to your keywords. Search Partners can include hundreds of non-Google websites, Parked Domains, as well as YouTube and other Google sites.</p>
                      </div>
                    </label>
                    <div className="flex items-center justify-between border border-orange-200 bg-orange-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-500">🔍</span>
                        <p className="text-xs text-gray-700"><span className="font-medium">Expand your reach with Google search partners:</span> Reach additional customers on partner sites ⓘ</p>
                      </div>
                      <button className="text-sm text-blue-600 font-medium hover:underline ml-4">Apply</button>
                    </div>
                  </div>
                </div>

                {/* Locations */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Locations</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-gray-500">Select locations for this campaign ⓘ</p>
                    {["All countries and territories", "India", "Custom locations"].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="search-location" value={opt}
                          checked={locationOption === opt}
                          onChange={() => { setLocationOption(opt); setShowAdvancedSearch(false); }} />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}

                    {locationOption === "Custom locations" && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-72">
                            <span className="text-gray-400 mr-2">🔍</span>
                            <input type="text" placeholder="Enter a location to include or exclude"
                              className="flex-1 text-sm focus:outline-none" />
                          </div>
                          <button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                            className="text-sm text-blue-600 hover:underline font-medium">
                            Advanced search
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">For example, a country, city, region, or postal code</p>

                        {showAdvancedSearch && (
                          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
                            <div className="flex items-center gap-4">
                              {["Location", "Radius"].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" name="search-loc-type" value={type}
                                    checked={locationSearchType === type}
                                    onChange={() => setLocationSearchType(type)} />
                                  <span className="text-sm text-gray-700">{type}</span>
                                </label>
                              ))}
                            </div>
                            {locationSearchType === "Location" && (
                              <>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" className="w-4 h-4" />
                                  <span className="text-sm text-gray-700">Add locations in bulk</span>
                                </label>
                                <div className="border border-gray-300 rounded-lg px-3 py-2">
                                  <input type="text" placeholder="Enter a location to include or exclude"
                                    className="w-full text-sm focus:outline-none" />
                                </div>
                                <p className="text-xs text-gray-400">For example, a country, city, region, or postal code</p>
                              </>
                            )}
                            {locationSearchType === "Radius" && (
                              <div className="flex items-center gap-2">
                                <div className="border border-gray-300 rounded-lg px-3 py-2 flex-1">
                                  <input type="text" placeholder="Enter a place name, address or coordinates"
                                    className="w-full text-sm focus:outline-none" />
                                </div>
                                <input type="number" defaultValue={20}
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-16 focus:outline-none" />
                                <select className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none">
                                  <option>mi</option>
                                  <option>km</option>
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <button className="text-sm text-blue-600 hover:underline mt-1 flex items-center gap-1"
                      onClick={() => setShowLocationOptions(!showLocationOptions)}>
                      {showLocationOptions ? "∧" : "∨"} Location options
                    </button>
                    {showLocationOptions && (
                      <div className="space-y-2 mt-1">
                        <p className="text-xs text-gray-500">Include ⓘ</p>
                        {[
                          "Presence or interest: People in, regularly in, or who've shown interest in your included locations (recommended)",
                          "Presence: People in or regularly in your included locations"
                        ].map((opt, i) => (
                          <label key={i} className="flex items-start gap-2 cursor-pointer">
                            <input type="radio" name="search-loc-include" defaultChecked={i === 0} className="mt-0.5" />
                            <span className="text-xs text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Languages</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-gray-500">Select the languages your customers speak. ⓘ</p>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                      <span className="text-gray-400 mr-2">🔍</span>
                      <input type="text" placeholder="Start typing or select a language"
                        className="flex-1 text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        English <button className="ml-1 text-gray-400 hover:text-gray-600">×</button>
                      </span>
                    </div>
                  </div>
                </div>

                {/* EU Political Ads */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">EU political ads</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 flex gap-6">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-gray-700">Does your campaign have European Union political ads?</p>
                      <p className="text-xs text-red-500">Required</p>
                      {["Yes, this campaign has EU political ads", "No, this campaign doesn't have EU political ads"].map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="search-eu-political" />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                      <p className="text-xs text-blue-600 cursor-pointer hover:underline mt-1">Confirm if your campaign has EU political ads</p>
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs">
                      EU regulation requires Google to ask this question. <span className="text-blue-600 cursor-pointer hover:underline">Learn how an EU political ad is defined</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {campaignStep === 3 && campaignForm.type === "Performance Max" && (campaignForm.goal === "Leads" || campaignForm.goal === "Website traffic" || campaignForm.goal === "Create a campaign without guidance") && (
              <div className="space-y-4">

                {/* Bidding */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Bidding</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">What do you want to focus on? ⓘ</p>
                      <select value={bidFocus} onChange={(e) => setBidFocus(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                        <option>Conversions</option>
                        <option>Conversion value</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={targetCPA} onChange={(e) => setTargetCPA(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                      <span className="text-sm text-gray-700">Set a target cost per action (optional)</span>
                    </label>
                    {targetCPA && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Target CPA ⓘ</p>
                        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-40">
                          <span className="text-gray-500 mr-1">₹</span>
                          <input type="number" className="flex-1 text-sm focus:outline-none" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Locations */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 cursor-pointer" onClick={() => setShowLocationOptions(!showLocationOptions)}>
                    <p className="text-sm font-semibold text-gray-900">Locations</p>
                    <span className="text-gray-400">{showLocationOptions ? "∧" : "∨"}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-gray-500">Select locations for this campaign ⓘ</p>
                    {["All countries and territories", "India", "Enter another location"].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="location" value={opt}
                          checked={locationOption === opt}
                          onChange={() => { setLocationOption(opt); setShowAdvancedSearch(false); }} />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}

                    {locationOption === "Enter another location" && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                          <span className="text-gray-400 mr-2">🔍</span>
                          <input type="text" placeholder="Enter a location to include or exclude"
                            className="flex-1 text-sm focus:outline-none" />
                        </div>
                        <p className="text-xs text-gray-400">For example, a country, city, region, or postal code</p>
                        <button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                          className="text-sm text-blue-600 hover:underline">
                          {showAdvancedSearch ? "∧" : "∨"} Advanced search
                        </button>
                        {showAdvancedSearch && (
                          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
                            <div className="flex items-center gap-4">
                              {["Location", "Radius"].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" name="loc-type" value={type}
                                    checked={locationSearchType === type}
                                    onChange={() => setLocationSearchType(type)} />
                                  <span className="text-sm text-gray-700">{type}</span>
                                </label>
                              ))}
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4" />
                              <span className="text-sm text-gray-700">Add locations in bulk</span>
                            </label>
                            <div className="border border-gray-300 rounded-lg px-3 py-2">
                              <input type="text" placeholder="Enter a location to include or exclude"
                                className="w-full text-sm focus:outline-none" />
                            </div>
                            <p className="text-xs text-gray-400">For example, a country, city, region, or postal code</p>
                            <p className="text-xs text-gray-500">Add locations to define your audience for this campaign</p>
                          </div>
                        )}
                      </div>
                    )}

                    <button className="text-sm text-blue-600 hover:underline mt-1"
                      onClick={() => setShowLocationOptions(!showLocationOptions)}>
                      {showLocationOptions ? "∧" : "∨"} Location options
                    </button>
                    {showLocationOptions && (
                      <div className="space-y-2 mt-1">
                        <p className="text-xs text-gray-500">Include ⓘ</p>
                        {[
                          "Presence or interest: People in, regularly in, or who've shown interest in your included locations (recommended)",
                          "Presence: People in or regularly in your included locations"
                        ].map((opt, i) => (
                          <label key={i} className="flex items-start gap-2 cursor-pointer">
                            <input type="radio" name="loc-include" defaultChecked={i === 0} className="mt-0.5" />
                            <span className="text-xs text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Languages</p>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-gray-500">Select the languages your customers speak. ⓘ</p>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                      <span className="text-gray-400 mr-2">🔍</span>
                      <input type="text" placeholder="Start typing or select a language"
                        className="flex-1 text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        English <button className="ml-1 text-gray-400 hover:text-gray-600">×</button>
                      </span>
                    </div>
                  </div>
                </div>

                {/* EU Political Ads */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">EU political ads</p>
                  </div>
                  <div className="p-4 flex gap-6">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-gray-700">Does your campaign have European Union political ads?</p>
                      <p className="text-xs text-red-500">Required</p>
                      {["Yes, this campaign has EU political ads", "No, this campaign doesn't have EU political ads"].map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="eu-political" />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs">
                      EU regulation requires Google to ask this question. <span className="text-blue-600 cursor-pointer hover:underline">Learn how an EU political ad is defined</span>
                    </div>
                  </div>
                </div>

              </div>
           )}
           {campaignStep === 5 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Review Campaign</h3>
                  <p className="text-xs text-gray-500 mt-1">Please review your campaign details before publishing.</p>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Campaign Details</p>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { label: "Campaign Name", value: campaignForm.name || "—" },
                      { label: "Campaign Goal", value: campaignForm.goal || "—" },
                      { label: "Campaign Type", value: campaignForm.type || "—" },
                      { label: "Bidding Focus", value: bidFocus },
                      { label: "Location", value: locationOption },
                      { label: "Language", value: "English" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-sm font-medium text-gray-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Budget</p>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-500">Budget Type</p>
                      <p className="text-sm font-medium text-gray-900">Average daily budget</p>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <p className="text-xs text-gray-500">Daily Budget</p>
                      <p className="text-sm font-medium text-gray-900">₹1,000 (Recommended)</p>
                    </div>
                  </div>
                </div>

                <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                  <p className="text-xs text-orange-700">⚠️ Demo mode — Real API keys milne ke baad live campaigns publish honge</p>
                </div>

              </div>
            )}

           {campaignStep === 4 && campaignForm.type === "Display" && (campaignForm.goal === "Leads" || campaignForm.goal === "Website traffic" || campaignForm.goal === "Create a campaign without guidance") && (
              <div className="space-y-4">

                {/* Budget and Bidding */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Budget and bidding</h3>
                </div>

                {/* Budget */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Budget</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-700 mb-2">Set your average daily budget for this campaign</p>
                      <div className="flex items-center border border-blue-400 rounded-lg px-3 py-2 w-48">
                        <span className="text-gray-500 mr-1">₹</span>
                        <input type="number" className="flex-1 text-sm focus:outline-none" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>The most you'll pay per month is your daily budget times 30.4 (the average number of days in a month). Some days you might spend more or less than your daily budget. <span className="text-blue-600 cursor-pointer hover:underline">Learn more</span></p>
                    </div>
                  </div>
                </div>

                {/* Bidding */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Bidding</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">What do you want to focus on? ⓘ</p>
                      <select value={bidFocus} onChange={(e) => setBidFocus(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                        <optgroup label="Recommended">
                          <option>Conversions</option>
                          <option>Conversion value</option>
                        </optgroup>
                        <optgroup label="Other optimization options">
                          <option>Viewable impressions</option>
                        </optgroup>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Recommended for your campaign goal</p>
                    </div>
                   {/* How do you want to get conversions */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">How do you want to get conversions? ⓘ</p>
                      <select
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        value={campaignForm.targeting}
                        onChange={(e) => {
                          setCampaignForm({...campaignForm, targeting: e.target.value});
                          setShowMoreAssetTypes(false);
                          setTargetCPA(false);
                        }}>
                        <option value="Automatically maximize conversions">Automatically maximize conversions</option>
                        <option value="Manually set bids">Manually set bids</option>
                      </select>
                    </div>

                    {/* Automatically maximize conversions selected */}
                    {campaignForm.targeting !== "Manually set bids" && (
                      <>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={targetCPA} onChange={(e) => setTargetCPA(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                          <span className="text-sm text-gray-700">Set a target cost per action</span>
                        </label>
                        {targetCPA && (
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Target CPA ⓘ</p>
                              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-40">
                                <span className="text-gray-500 mr-1">₹</span>
                                <input type="number" className="flex-1 text-sm focus:outline-none" />
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Pay for ⓘ</p>
                              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                                <option>Interactions</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-between border border-blue-100 bg-blue-50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-500">ℹ️</span>
                                <p className="text-xs text-gray-700">A typical target CPA for a Display campaign is <strong>₹100.00</strong></p>
                              </div>
                              <button className="text-sm text-blue-600 font-medium hover:underline">Apply</button>
                            </div>
                          </div>
                        )}
                        <div className="border border-green-200 bg-green-50 rounded-lg px-3 py-2 flex items-center gap-2">
                          <span className="text-green-600">✅</span>
                          <p className="text-xs text-gray-700">This campaign will use the <strong>Maximize conversions</strong> bid strategy to help you get the most conversions for your budget</p>
                        </div>
                      </>
                    )}

                   {/* Manually set bids selected */}
                    {campaignForm.targeting === "Manually set bids" && (
                      <>
                        <div className="border border-green-200 bg-green-50 rounded-lg px-3 py-2 flex items-center gap-2">
                          <span className="text-green-600">✅</span>
                          <p className="text-xs text-gray-700">Based on the selections, this campaign will use the <strong>Manual CPC</strong> bid strategy</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-3 space-y-3">
                          <p className="text-xs text-gray-500">Select your bid strategy ⓘ</p>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                            value={bidFocus}
                            onChange={(e) => setBidFocus(e.target.value)}>
                            <option>Target CPA</option>
                            <option>Target ROAS</option>
                            <option>Maximize clicks</option>
                            <option>Maximize conversions</option>
                            <option>Maximize conversion value</option>
                            <option>Viewable CPM</option>
                            <option>Manual CPC</option>
                          </select>

                         {/* Target CPA */}
                          {bidFocus === "Target CPA" && (
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-gray-700 mb-1">Target CPA</p>
                                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-48">
                                  <span className="text-gray-500 mr-1">₹</span>
                                  <input type="number" className="flex-1 text-sm focus:outline-none" />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-700 mb-1">Pay for ⓘ</p>
                                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-48">
                                  <option>Interactions</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Target ROAS */}
                          {bidFocus === "Target ROAS" && (
                            <div>
                              <p className="text-xs text-gray-700 mb-1">Target ROAS ⓘ</p>
                              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-48">
                                <input type="number" className="flex-1 text-sm focus:outline-none text-right" />
                                <span className="text-gray-500 ml-1">%</span>
                              </div>
                            </div>
                          )}

                          {/* Maximize clicks */}
                          {bidFocus === "Maximize clicks" && (
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600"
                                  onChange={(e) => setTargetCPA(e.target.checked)} />
                                <span className="text-sm text-gray-700">Set a maximum cost per click bid limit</span>
                              </label>
                              {targetCPA && (
                                <div>
                                  <p className="text-xs text-gray-700 mb-1">Maximum CPC bid limit ⓘ</p>
                                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-48">
                                    <span className="text-gray-500 mr-1">₹</span>
                                    <input type="number" className="flex-1 text-sm focus:outline-none" />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Viewable CPM */}
                          {bidFocus === "Viewable CPM" && (
                            <div>
                              <p className="text-xs text-gray-700 mb-1">Enter your viewable CPM bid for this ad group ⓘ</p>
                              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-48">
                                <span className="text-gray-500 mr-1">₹</span>
                                <input type="number" className="flex-1 text-sm focus:outline-none" />
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Targeting */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Targeting</h3>
                </div>

                {/* Optimized targeting info card */}
                <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Optimized targeting is set up for you</p>
                    <p className="text-xs text-gray-500">Optimized targeting helps you get more conversions by using information such as your landing page and assets. You can opt out or speed up optimization by adding targeting first. <span className="text-blue-600 cursor-pointer hover:underline">Learn more</span></p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-24 h-16 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">📊</div>
                  </div>
                </div>

                {/* Add targeting rows */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
                    <span className="text-blue-600">⚙️</span>
                    <button className="text-sm text-blue-600 font-medium hover:underline">Add targeting</button>
                  </div>

                  {/* Audience Segments */}
                  <div className="border-b border-gray-100">
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => setShowAdditionalSignals(!showAdditionalSignals)}>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Audience Segments</p>
                        <p className="text-xs text-gray-500">Suggest who should see your ads ⓘ</p>
                      </div>
                      <span className="text-gray-400">{showAdditionalSignals ? "∧" : "∨"}</span>
                    </div>
                    {showAdditionalSignals && (
                      <div className="px-4 pb-4">
                        <p className="text-xs text-gray-500 mb-2">Suggest who should see your ads. You can create new segments in <span className="text-blue-600 cursor-pointer hover:underline">Audience Manager.</span> ⓘ</p>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">Edit targeted segments</p>
                            <button className="text-sm text-white font-medium">Done</button>
                          </div>
                          <div className="grid grid-cols-2 divide-x divide-gray-200">
                            <div className="p-3">
                              <div className="flex gap-4 border-b border-gray-200 mb-2">
                                <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">Search</button>
                                <button className="text-sm text-gray-500 pb-1">Browse</button>
                              </div>
                              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 mb-3">
                                <span className="text-gray-400 mr-2">🔍</span>
                                <input type="text" placeholder='Try "foodies"' className="flex-1 text-sm focus:outline-none" />
                              </div>
                              <div className="flex flex-col items-center justify-center py-8 text-center">
                                <span className="text-3xl text-gray-300 mb-2">🔍</span>
                                <p className="text-xs text-gray-400">You'll see recently selected segments and ideas here.</p>
                                <p className="text-xs text-gray-400">Use search to start looking for a segment.</p>
                              </div>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-500">None selected</p>
                                <button className="text-sm text-blue-600 hover:underline">Clear all</button>
                              </div>
                              <p className="text-xs text-gray-400">Select one or more segments to target.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Demographics */}
                  <div className="border-b border-gray-100">
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => setShowYourData(!showYourData)}>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Demographics</p>
                        <p className="text-xs text-gray-500">Suggest people based on age, gender, parental status, or household income ⓘ</p>
                      </div>
                      <span className="text-gray-400">{showYourData ? "∧" : "∨"}</span>
                    </div>
                    {showYourData && (
                      <div className="px-4 pb-4">
                        <p className="text-xs text-gray-500 mb-2">Suggest people based on age, gender, parental status, or household income ⓘ</p>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">Edit targeted demographics</p>
                            <button className="text-sm text-white font-medium">Done</button>
                          </div>
                          <div className="p-3 grid grid-cols-4 gap-4">
                            {[
                              { label: "Gender", options: ["Female", "Male", "Unknown"] },
                              { label: "Age", options: ["18 - 24", "25 - 34", "35 - 44", "45 - 54", "55 - 64", "65+", "Unknown"] },
                              { label: "Parental status", options: ["Not a parent", "Parent", "Unknown"] },
                              { label: "Household income", options: ["Top 10%", "11 - 20%", "21 - 30%", "31 - 40%", "41 - 50%", "Lower 50%", "Unknown"] },
                            ].map((col, i) => (
                              <div key={i}>
                                <p className="text-xs font-medium text-gray-600 mb-2">{col.label}</p>
                                {col.options.map((opt, j) => (
                                  <label key={j} className="flex items-center gap-2 mb-1 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-blue-600" />
                                    <span className="text-xs text-gray-700">{opt}</span>
                                  </label>
                                ))}
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-yellow-200 bg-yellow-50 px-3 py-2 flex items-center gap-2">
                            <span className="text-yellow-500">⚠️</span>
                            <p className="text-xs text-gray-600">Note: Household income targeting is only available in select countries. <span className="text-blue-600 cursor-pointer hover:underline">Learn more</span></p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Keywords */}
                  <div className="border-b border-gray-100">
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => setShowSearchThemes(!showSearchThemes)}>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Keywords</p>
                        <p className="text-xs text-gray-500">Suggest terms related to your products or services to target relevant websites ⓘ</p>
                      </div>
                      <span className="text-gray-400">{showSearchThemes ? "∧" : "∨"}</span>
                    </div>
                    {showSearchThemes && (
                      <div className="px-4 pb-4">
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">Edit targeted keywords</p>
                            <button className="text-sm text-white font-medium">Done</button>
                          </div>
                          <div className="grid grid-cols-2 divide-x divide-gray-200">
                            <div className="p-3">
                              <textarea rows={8} placeholder="Enter or paste keywords, one per line"
                                className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none resize-none" />
                            </div>
                            <div className="p-3">
                              <p className="text-sm font-medium text-gray-900 mb-2">Get keyword ideas</p>
                              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 mb-2">
                                <span className="text-gray-400 mr-2">🔗</span>
                                <input type="text" placeholder="Enter a related website" className="flex-1 text-sm focus:outline-none" />
                              </div>
                              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 mb-3">
                                <span className="text-gray-400 mr-2">🏪</span>
                                <input type="text" placeholder="Enter your product or service" className="flex-1 text-sm focus:outline-none" />
                              </div>
                              <div className="flex flex-col items-center justify-center py-4 text-center">
                                <span className="text-3xl text-gray-300 mb-2">🔍</span>
                                <p className="text-xs text-gray-400 max-w-xs">We only show keyword ideas that are relevant to your business. To get ideas, enter your landing page, a related website, or words or phrases that describe your product or service in the field above.</p>
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-gray-200 p-3 space-y-2">
                            <p className="text-xs font-medium text-gray-600">Keyword setting ⓘ</p>
                            <label className="flex items-start gap-2 cursor-pointer opacity-50">
                              <input type="radio" name="kw-setting" disabled className="mt-0.5" />
                              <span className="text-xs text-gray-500">Audience: Show ads to people likely to be interested in these keywords and also on webpages, apps, and videos related to these keywords</span>
                            </label>
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input type="radio" name="kw-setting" defaultChecked className="mt-0.5" />
                              <span className="text-xs text-gray-700">Content: Only show ads on webpages, apps, and videos related to these keywords</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Placements */}
                  <div>
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => setShowAudienceSignal(!showAudienceSignal)}>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Placements</p>
                        <p className="text-xs text-gray-500">Suggest websites, videos, or apps where you'd like to show your ads ⓘ</p>
                      </div>
                      <span className="text-gray-400">{showAudienceSignal ? "∧" : "∨"}</span>
                    </div>
                    {showAudienceSignal && (
                      <div className="px-4 pb-4">
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">Edit targeted placements</p>
                            <button className="text-sm text-white font-medium">Done</button>
                          </div>
                          <div className="grid grid-cols-2 divide-x divide-gray-200">
                            <div className="p-3">
                              <div className="flex gap-4 border-b border-gray-200 mb-2">
                                <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">Browse</button>
                                <button className="text-sm text-gray-500 pb-1">Enter</button>
                              </div>
                              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 mb-2">
                                <input type="text" placeholder="Search by word, phrase, URL, or video ID" className="flex-1 text-sm focus:outline-none" />
                                <span className="text-gray-400 ml-2">🔍</span>
                              </div>
                              {["Websites", "YouTube channels", "YouTube videos", "Apps", "App categories (141)"].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 px-1">
                                  <span className="text-sm text-gray-700">{item}</span>
                                  <span className="text-gray-400">›</span>
                                </div>
                              ))}
                            </div>
                            <div className="p-3">
                              <p className="text-sm text-gray-500 mb-2">None selected</p>
                              <p className="text-xs text-gray-400">Your ad can appear on any YouTube or Display Network placements that match your other targeting. Add specific placements to narrow your targeting. If a specific website you target has an equivalent app, your ads can also show there.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Create Ad */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create ad</h3>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                  {/* Final URL */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Final URL ⓘ <span className="text-red-500">*</span></p>
                    <input type="text" placeholder="https://www.example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                    <p className="text-xs text-red-400 mt-0.5">Required</p>
                  </div>

                  {/* Row 1: Business name, Images, Logos */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Business name */}
                    <div className="border border-gray-200 rounded-xl p-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">Business name ⓘ</p>
                      <input type="text" placeholder="Business name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-red-400">Required</p>
                        <p className="text-xs text-gray-400">0/25</p>
                      </div>
                    </div>
                    {/* Images */}
                    <div className="border border-gray-200 rounded-xl p-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">Images ⓘ</p>
                      <p className="text-xs text-gray-500 mb-2">Add up to 15 images <span className="text-blue-600 cursor-pointer hover:underline">Learn more</span></p>
                      <div className="flex gap-2 mb-2">
                        <button className="flex items-center gap-1 text-sm text-blue-600 hover:underline">+ Images</button>
                        <button className="flex items-center gap-1 text-sm text-blue-600 hover:underline">🖼️ Generate images</button>
                      </div>
                      <p className="text-xs text-red-400">At least 1 landscape image is required</p>
                      <p className="text-xs text-red-400">At least 1 square image is required</p>
                    </div>
                    {/* Logos */}
                    <div className="border border-gray-200 rounded-xl p-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">Logos ⓘ</p>
                      <p className="text-xs text-gray-500 mb-2">Add up to 5 logos</p>
                      <button className="text-sm text-blue-600 hover:underline">+ Logos</button>
                    </div>
                  </div>

                  {/* Row 2: Videos, Headlines, Long headline */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Videos */}
                    <div className="border border-gray-200 rounded-xl p-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">Videos ⓘ</p>
                      <p className="text-xs text-gray-500 mb-2">Optional (portrait and landscape around 30 seconds work best)</p>
                      <button className="text-sm text-blue-600 hover:underline">+ Videos</button>
                    </div>
                    {/* Headlines */}
                    <div className="border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">Headlines ⓘ</p>
                        <button className="text-xs text-blue-600 hover:underline">More ideas</button>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">Add up to 5 headlines</p>
                      <p className="text-xs text-gray-400 mb-2">Suggested headlines</p>
                      <p className="text-xs text-gray-400 mb-2">🔍 We don't have any suggestions right now.</p>
                      <div className="relative mb-1">
                        <input type="text" placeholder="Headline"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                        <span className="absolute right-2 top-2 text-xs text-gray-400">0/30</span>
                      </div>
                      <p className="text-xs text-red-400 mb-1">Required</p>
                      <button className="text-sm text-blue-600 hover:underline">+ Headline</button>
                    </div>
                    {/* Long headline */}
                    <div className="border border-gray-200 rounded-xl p-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">Long headline ⓘ</p>
                      <div className="relative mb-1">
                        <input type="text" placeholder="Long headline"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                        <span className="absolute right-2 top-2 text-xs text-gray-400">0/90</span>
                      </div>
                      <p className="text-xs text-red-400">Required</p>
                    </div>
                  </div>

                  {/* Descriptions full width */}
                  <div className="border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">Descriptions ⓘ</p>
                      <button className="text-xs text-blue-600 hover:underline">More ideas</button>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Add up to 5 descriptions</p>
                    <p className="text-xs text-gray-400 mb-2">Suggested descriptions</p>
                    <p className="text-xs text-gray-400 mb-2">🔍 We don't have any suggestions right now.</p>
                    <div className="relative mb-1">
                      <input type="text" placeholder="Description"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                      <span className="absolute right-2 top-2 text-xs text-gray-400">0/90</span>
                    </div>
                    <p className="text-xs text-red-400 mb-1">Required</p>
                    <button className="text-sm text-blue-600 hover:underline">+ Description</button>
                  </div>

                  <p className="text-xs text-gray-400">Your ads might not always include all your text and images. Some cropping or shortening may occur in some formats, and either of your custom colors may be used.</p>
                </div>

              </div>
            )}

            {campaignStep === 4 && campaignForm.type === "Search" && (campaignForm.goal === "Leads" || campaignForm.goal === "Website traffic" || campaignForm.goal === "Create a campaign without guidance") && (
              <div className="space-y-4">

                {/* Bidding */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Bidding</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">What do you want to focus on? ⓘ</p>
                      <select value={bidFocus} onChange={(e) => setBidFocus(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                        <optgroup label="Recommended">
                          <option>Conversions</option>
                          <option>Conversion value</option>
                        </optgroup>
                        <optgroup label="Other optimization options">
                          <option>Clicks</option>
                          <option>Impression share</option>
                        </optgroup>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={targetCPA} onChange={(e) => setTargetCPA(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                      <span className="text-sm text-gray-700">Set a target cost per action (optional)</span>
                    </label>
                    {targetCPA && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Target CPA ⓘ</p>
                        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-40">
                          <span className="text-gray-500 mr-1">₹</span>
                          <input type="number" className="flex-1 text-sm focus:outline-none" />
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">Alternative bid strategies like portfolios are available in settings after you create your campaign</p>
                  </div>
                </div>

                {/* Keywords */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Keywords</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Get keyword suggestions (optional)</p>
                      <p className="text-xs text-gray-500 mt-0.5">Google Ads can find keywords for you by scanning a web page or seeing what's working for similar products or services</p>
                    </div>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5">
                      <span className="text-gray-400 mr-2">🔗</span>
                      <input type="text" placeholder="Final URL" className="flex-1 text-sm focus:outline-none" />
                    </div>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5">
                      <span className="text-gray-400 mr-2">🏪</span>
                      <input type="text" placeholder="Enter products or services to advertise" className="flex-1 text-sm focus:outline-none" />
                    </div>
                    <button className="text-sm text-gray-400 cursor-not-allowed">Get keyword suggestions</button>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Enter keywords</p>
                      <p className="text-xs text-gray-500 mt-0.5">Keywords are words or phrases that are used to match your ads with the terms people are searching for ⓘ</p>
                      <textarea rows={6} placeholder="Enter or paste keywords. You can separate each keyword by commas or enter one per line."
                        className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                    </div>
                  </div>
                </div>

                {/* Final URL + Display path */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Final URL ⓘ</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <input type="text" placeholder="Final URL"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none" />
                      <p className="text-xs text-gray-400 mt-1">This will be used to suggest assets for your ad</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Display path ⓘ</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">www.example.com</span>
                        <span className="text-gray-400">/</span>
                        <div className="relative">
                          <input type="text" maxLength={15}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-32" />
                          <span className="absolute right-2 bottom-1 text-xs text-gray-400">0/15</span>
                        </div>
                        <span className="text-gray-400">/</span>
                        <div className="relative">
                          <input type="text" maxLength={15}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-32" />
                          <span className="absolute right-2 bottom-1 text-xs text-gray-400">0/15</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Headlines + Descriptions — ek row mein 2 col */}
                <div className="grid grid-cols-2 gap-4">

                  {/* Headlines */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-bold text-sm">Tr</span>
                        <p className="text-sm font-semibold text-gray-900">Headlines 0/15 ⓘ</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="text-xs text-blue-600 hover:underline">View ideas</button>
                        <span className="text-gray-400">∧</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      {[0,1,2,3,4,5,6].map(i => (
                        <div key={i}>
                          <div className="relative">
                            <input type="text" placeholder="Headline"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                            <span className="absolute right-2 top-2 text-xs text-gray-400">0/30</span>
                          </div>
                          {i < 3 && <p className="text-xs text-red-400">Required</p>}
                        </div>
                      ))}
                      <button className="text-sm text-blue-600 hover:underline">+ Headline</button>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-bold text-sm">Tr</span>
                        <p className="text-sm font-semibold text-gray-900">Descriptions 0/4 ⓘ</p>
                      </div>
                      <span className="text-gray-400">∧</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {[0,1].map(i => (
                        <div key={i}>
                          <div className="relative">
                            <input type="text" placeholder="Description"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                            <span className="absolute right-2 top-2 text-xs text-gray-400">0/90</span>
                          </div>
                          <p className="text-xs text-red-400">Required</p>
                        </div>
                      ))}
                      <button className="text-sm text-blue-600 hover:underline">+ Description</button>
                    </div>
                  </div>

                </div>

                {/* Business name and logos */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Business name and logos</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-3">If you don't add a name or logo, Google will use your URL to add them for you</p>
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <span>🛡️</span> Get access
                    </button>
                  </div>
                </div>

                {/* Sitelinks */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Sitelinks ⓘ</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-3">Add links to your ads to take people to specific pages on your website.</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-400 cursor-pointer">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Sitelink {i}</p>
                            <p className="text-xs text-gray-400">Recommended</p>
                          </div>
                          <button className="text-blue-600 text-lg font-light hover:text-blue-800">+</button>
                        </div>
                      ))}
                    </div>
                    <button className="text-sm text-blue-600 hover:underline">+ Sitelinks</button>
                  </div>
                </div>

                {/* Calls */}
                <div className="border border-red-300 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">📞</span>
                      <p className="text-sm font-semibold text-gray-900">Calls ⓘ</p>
                    </div>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-gray-500">Add a phone number</p>
                    <div className="border border-red-300 bg-red-50 rounded-lg p-3 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">⚠️</span>
                      <p className="text-xs text-red-700">Because you selected <strong>phone calls</strong> as a campaign goal, add a call asset to use with your ads.</p>
                    </div>
                    <button onClick={() => setShowMoreAssetTypes(!showMoreAssetTypes)}
                      className="text-sm text-blue-600 hover:underline">+ Calls</button>
                    {showMoreAssetTypes && (
                      <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                        <p className="text-sm font-medium text-gray-900">Add new call</p>
                        <div className="flex items-start gap-2">
                          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                            <option>India (+91)</option>
                            <option>United States (+1)</option>
                            <option>United Kingdom (+44)</option>
                          </select>
                          <div>
                            <input type="text" placeholder="Phone number"
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-52" />
                            <p className="text-xs text-gray-400 mt-1">Example: 98765 43210</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Budget</h3>
                  <p className="text-xs text-gray-500 mt-1">Decide how much you want to spend.</p>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">ℹ️</span>
                        <p className="text-xs text-gray-600">Your budget type (daily or campaign total) can't be changed once this campaign has started. You can change your budget amount at any time.</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Select budget type</p>
                      <div className="space-y-4">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input type="radio" name="search-budget-type" defaultChecked className="mt-1" />
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Average daily budget</p>
                              <p className="text-xs text-gray-500">Set your average daily budget for this campaign</p>
                            </div>
                            <div className="flex items-center border border-blue-400 rounded-lg px-3 py-2 w-40">
                              <span className="text-gray-500 mr-1">₹</span>
                              <input type="number" className="flex-1 text-sm focus:outline-none" />
                            </div>
                          </div>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input type="radio" name="search-budget-type" className="mt-1" />
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Campaign total budget</p>
                              <p className="text-xs text-gray-500">Set a budget for the duration of your campaign</p>
                            </div>
                            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-40">
                              <span className="text-gray-500 mr-1">₹</span>
                              <input type="number" className="flex-1 text-sm focus:outline-none" />
                            </div>
                            <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 w-72">
                              <div>
                                <p className="text-xs text-gray-700">Start date: June 2, 2026</p>
                                <p className="text-xs text-gray-700">End date: None</p>
                              </div>
                              <button className="text-sm text-blue-600 hover:underline">Edit</button>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 space-y-2">
                      <p>For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much.</p>
                      <button className="text-blue-600 hover:underline text-xs">Learn more about average daily budget</button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {campaignStep === 4 && campaignForm.type === "Performance Max" && (campaignForm.goal === "Leads" || campaignForm.goal === "Website traffic" || campaignForm.goal === "Create a campaign without guidance") && (
              <div className="space-y-4">

                {/* Budget */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white cursor-pointer">
                    <p className="text-sm font-semibold text-gray-900">Budget</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Info box */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">ℹ️</span>
                      <p className="text-xs text-gray-600">Your budget type (daily or campaign total) can't be changed once this campaign has started. You can change your budget amount at any time.</p>
                    </div>

                    <p className="text-sm font-medium text-gray-900">Select budget type</p>

                    {/* Average daily budget */}
                    <div className="space-y-2">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="radio" name="budget-type" defaultChecked className="mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Average daily budget</p>
                          <p className="text-xs text-gray-500">Set your average daily budget for this campaign</p>
                        </div>
                      </label>

                      {/* 4 budget options in one row */}
                      <div className="grid grid-cols-4 gap-3 ml-5">
                        {[
                          { label: "₹500", value: "500" },
                          { label: "₹1,000", value: "1000", recommended: true },
                          { label: "₹2,000", value: "2000" },
                          { label: "Set custom budget", value: "custom" },
                        ].map((opt, i) => (
                          <div key={i} className={`border rounded-xl p-3 cursor-pointer hover:border-blue-400 ${i === 1 ? "border-blue-500" : "border-gray-200"}`}>
                            <div className="flex items-center gap-2">
                              <input type="radio" name="daily-budget" defaultChecked={i === 1} />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                                {opt.recommended && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Recommended</span>}
                              </div>
                            </div>
                            {i === 1 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-500 mb-1">Average daily budget</p>
                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-2">
                                  <div><p className="underline decoration-dotted">Weekly conv.</p><p className="font-bold text-gray-900 text-sm">98</p></div>
                                  <div><p className="underline decoration-dotted">Cost/Conv.</p><p className="font-bold text-gray-900 text-sm">₹325.64</p></div>
                                  <div><p className="underline decoration-dotted">Weekly cost</p><p className="font-bold text-gray-900 text-sm">₹32,205.95</p></div>
                                </div>
                                <p className="text-xs text-gray-500">Recommended because of your campaign settings, such as bidding, targeting and ads, as well as the budgets of similar advertisers.</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 ml-5">For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much. <span className="text-blue-600 cursor-pointer hover:underline">Learn more</span></p>
                    </div>

                    {/* Campaign total budget */}
                    <div className="space-y-2">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="radio" name="budget-type" className="mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Campaign total budget</p>
                          <p className="text-xs text-gray-500">Set a budget for the duration of your campaign</p>
                        </div>
                      </label>
                      <div className="ml-5 space-y-2">
                        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-40">
                          <span className="text-gray-500 mr-1">₹</span>
                          <input type="number" className="flex-1 text-sm focus:outline-none" />
                        </div>
                        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                          <div>
                            <p className="text-xs text-gray-700">Start date: May 31, 2026</p>
                            <p className="text-xs text-gray-700">End date: None</p>
                          </div>
                          <button className="text-sm text-blue-600 hover:underline">Edit</button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Asset Group Header */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Asset group</h3>
                  <p className="text-xs text-gray-500 mt-1">Show high quality ads to the right people. Start by adding your assets, the building blocks of every ad. Google will test different combinations to create high performing ads across the formats and networks that work best for your goals and the audiences you want to reach.</p>
                </div>

                {/* Asset group name */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Asset group name</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4">
                    <input type="text" defaultValue="Asset Group 1"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none" />
                  </div>
                </div>

                {/* Final URL */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Final URL</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">http://ktwebcreations.com</span>
                      <span className="text-gray-400">∨</span>
                    </div>
                  </div>
                </div>

                {/* Assets */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Assets</p>
                    <span className="text-gray-400">∧</span>
                  </div>
                  <div className="p-4 space-y-4">

                    {/* Calls */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <input type="radio" name="calls" />
                          <p className="text-sm font-medium text-gray-900">Calls</p>
                        </div>
                        <span className="text-gray-400">∧</span>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-500 mb-2">Add a phone number</p>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700 mb-2">
                          ⚠️ Because you selected phone calls as a campaign goal, add a call asset to use with your ads.
                        </div>
                        <button className="text-sm text-blue-600 hover:underline">+ Calls</button>
                      </div>
                    </div>

                    {/* Row 1: Headlines + Long headlines */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Headlines */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <input type="radio" name="headlines" />
                            <p className="text-sm font-medium text-gray-900">Headline (0) ⓘ</p>
                          </div>
                          <span className="text-gray-400">∧</span>
                        </div>
                        <div className="p-3 space-y-2">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="relative">
                              <input type="text" placeholder="Headline" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                              <span className="absolute right-2 top-2 text-xs text-gray-400">0/30</span>
                              <p className="text-xs text-red-400">Required</p>
                            </div>
                          ))}
                          <button className="text-sm text-blue-600 hover:underline">+ Headline</button>
                        </div>
                      </div>

                      {/* Long Headlines */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <input type="radio" name="long-headlines" />
                            <p className="text-sm font-medium text-gray-900">Long headlines (0) ⓘ</p>
                          </div>
                          <span className="text-gray-400">∧</span>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="relative">
                            <input type="text" placeholder="Long headline" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                            <span className="absolute right-2 top-2 text-xs text-gray-400">0/40</span>
                          </div>
                          <button className="text-sm text-blue-600 hover:underline">+ Long headline</button>
                        </div>
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <input type="radio" name="descriptions" />
                          <p className="text-sm font-medium text-gray-900">Descriptions (0) ⓘ</p>
                        </div>
                        <span className="text-gray-400">∧</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {[0, 1].map(i => (
                          <div key={i} className="relative">
                            <input type="text" placeholder="Description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                            <span className="absolute right-2 top-2 text-xs text-gray-400">0/90</span>
                            <p className="text-xs text-red-400">Required</p>
                          </div>
                        ))}
                        <button className="text-sm text-blue-600 hover:underline">+ Description</button>
                      </div>
                    </div>

                    {/* Row 2: Images + Logos */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Images */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <input type="radio" name="images" />
                            <p className="text-sm font-medium text-gray-900">Images (0) ⓘ</p>
                          </div>
                          <span className="text-gray-400">∧</span>
                        </div>
                        <div className="p-3 space-y-2">
                          <button className="text-sm text-blue-600 hover:underline">+ Images</button>
                          <p className="text-xs text-gray-500">Suggested Images ⓘ</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-100 rounded-lg h-20 flex items-center justify-center text-xs text-gray-400">Generated</div>
                            <div className="bg-gray-100 rounded-lg h-20 flex items-center justify-center text-xs text-gray-400">Enhanced from URL</div>
                          </div>
                        </div>
                      </div>

                      {/* Logos */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <input type="radio" name="logos" />
                            <p className="text-sm font-medium text-gray-900">Logos (0) ⓘ</p>
                          </div>
                          <span className="text-gray-400">∧</span>
                        </div>
                        <div className="p-3 space-y-2">
                          <button className="text-sm text-blue-600 hover:underline">+ Logos</button>
                          <p className="text-xs text-gray-500">Suggested logos ⓘ</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-100 rounded-lg h-20 flex items-center justify-center text-xs text-gray-400">From your URL</div>
                            <div className="bg-gray-100 rounded-lg h-20 flex items-center justify-center text-xs text-gray-400">From your URL</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Business name, Videos, Sitelinks, Call to action */}
                    <div className="grid grid-cols-4 gap-4">
                      {/* Business name */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <input type="radio" name="business" />
                            <p className="text-xs font-medium text-gray-900">Business name ⓘ</p>
                          </div>
                          <span className="text-gray-400">∨</span>
                        </div>
                      </div>

                     {/* Videos */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <input type="radio" name="videos" />
                            <p className="text-xs font-medium text-gray-900">Videos (0) ⓘ</p>
                          </div>
                          <span className="text-gray-400">∨</span>
                        </div>
                      </div>

                      {/* Sitelinks */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <input type="radio" name="sitelinks" />
                            <p className="text-xs font-medium text-gray-900">Sitelinks ⓘ</p>
                          </div>
                          <span className="text-gray-400">∨</span>
                        </div>
                      </div>

                      {/* Call to action */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4 accent-blue-600" defaultChecked />
                            <p className="text-xs font-medium text-gray-900">Call to action ⓘ</p>
                          </div>
                          <span className="text-gray-400">∨</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Signals */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Signals</h3>
                  <p className="text-xs text-gray-500 mt-1">Signals provide valuable information about the people you want to reach. They help guide who sees your ads on Google Search, YouTube, and more.</p>
                </div>

                {/* Search themes */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 cursor-pointer" onClick={() => setShowSearchThemes(!showSearchThemes)}>
                    <p className="text-sm font-semibold text-gray-900">Search themes</p>
                    <span className="text-gray-400">{showSearchThemes ? "∧" : "∨"}</span>
                  </div>
                  {showSearchThemes && (
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-2">What are some words or phrases people use when searching for your products or services? ⓘ</p>
                      <input type="text" placeholder="Add search themes (up to 50)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    </div>
                  )}
                </div>

                {/* Audience signal */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 cursor-pointer" onClick={() => setShowAudienceSignal(!showAudienceSignal)}>
                    <p className="text-sm font-semibold text-gray-900">Audience signal</p>
                    <span className="text-gray-400">{showAudienceSignal ? "∧" : "∨"}</span>
                  </div>
                  {showAudienceSignal && (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Reach the right customers faster across Google with an audience signal. ⓘ</p>
                        <button className="text-xs text-blue-600 border border-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50">Add saved audience signal</button>
                      </div>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 cursor-pointer" onClick={() => setShowYourData(!showYourData)}>
                          <p className="text-sm font-medium text-gray-900">Your data</p>
                          <span className="text-gray-400">{showYourData ? "∧" : "∨"}</span>
                        </div>
                        {showYourData && (
                          <div className="p-3">
                            <p className="text-xs text-gray-500 mb-2">First-party data can help us reach your customers ⓘ</p>
                            <button className="text-sm text-blue-600 hover:underline">+ New segment</button>
                          </div>
                        )}
                      </div>
                      <div className="border border-gray-200 rounded-xl overflow-hidden cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-3">
                          <span className="text-blue-600">⚙️</span>
                          <p className="text-sm text-blue-600 font-medium">Additional signals</p>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setShowAudienceName(!showAudienceName)}>
                          <p className="text-sm font-medium text-gray-900">Audience name</p>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-400">Add a name for your audience to save it to your library (optional)</span>
                            <span className="text-gray-400">{showAudienceName ? "∧" : "∨"}</span>
                          </div>
                        </div>
                        {showAudienceName && (
                          <div className="p-3 border-t border-gray-200">
                            <input type="text" placeholder="Audience name"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-gray-400">© Google, 2026. <span className="text-blue-600 cursor-pointer hover:underline">Leave feedback</span></p>
                </div>

              </div>
            )}
           </div>
           <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowCreateModal(false); setCampaignStep(1); }}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
              {campaignStep > 1 && (
                <button onClick={() => setCampaignStep(campaignStep - 1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">← Back</button>
              )}
              {campaignStep === 5 ? (
                <button onClick={() => { alert("Campaign published!"); setShowCreateModal(false); setCampaignStep(1); }}
                  className="flex-1 text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 bg-green-600">
                  🚀 Publish Campaign
                </button>
              ) : (
                <button
                  disabled={campaignStep === 1 && (!campaignForm.name || !campaignForm.goal || !campaignForm.type)}
                  onClick={() => setCampaignStep(campaignStep + 1)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    campaignStep === 1 && (!campaignForm.name || !campaignForm.goal || !campaignForm.type)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "text-white hover:opacity-90"
                  }`}
                  style={campaignStep === 1 && (!campaignForm.name || !campaignForm.goal || !campaignForm.type) ? {} : { backgroundColor: primaryColor }}>
                  {campaignStep === 4 ? "Review" : "Continue"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}