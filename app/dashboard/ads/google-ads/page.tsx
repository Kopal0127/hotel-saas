"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";

// ==================== GOOGLE ADS DATA ====================
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

export default function GoogleAdsPage() {
  useAuth();
  const router = useRouter();
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
  const [directBidStrategy, setDirectBidStrategy] = useState("Target CPA");
  const [showVideoSettings, setShowVideoSettings] = useState<string | null>(null);
  const [videoDeviceType, setVideoDeviceType] = useState("all");
  const [selectedOS, setSelectedOS] = useState<string[]>([]);
  const [showOSPopup, setShowOSPopup] = useState(false);
  const [showDeviceModelsPopup, setShowDeviceModelsPopup] = useState(false);
  const [selectedDeviceModels, setSelectedDeviceModels] = useState<string[]>([]);
  const [expandedDeviceSections, setExpandedDeviceSections] = useState<string[]>([]);
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

  const primaryColor = "#4285F4";
  const data = OVERVIEW_DATA;
  const maxClicks = Math.max(...data.chartData.map(d => d.clicks));

  const goalTypeMap: Record<string, string[]> = {
    "Leads": ["Performance Max", "Search", "Display", "Video"],
    "Website traffic": ["Performance Max", "Search", "Display", "Video"],
    "YouTube reach, views, and engagements": ["Video"],
    "Local store visits and promotions": ["Performance Max"],
    "Create a campaign without guidance": ["Performance Max", "Search", "Display", "Video"],
  };
  const allowedTypes = campaignForm.goal ? goalTypeMap[campaignForm.goal] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-blue-600 cursor-pointer" onClick={() => router.push("/dashboard")}>HotelPro</h1>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4285F4]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
            </svg>
            <span className="text-xs font-medium text-white">Google Ads</span>
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
          { key: "adgroups", label: "Ad Groups" },
          { key: "keywords", label: "Keywords" },
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
               activePage === "adgroups" ? "Ad Groups" :
               activePage === "keywords" ? "Keywords" : "Billing"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Demo Data • {data.dateRange}</p>
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
              {Object.entries(data.summary).map(([key, stat]) => (
                <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs mt-1 font-medium ${stat.up ? "text-green-600" : "text-red-500"}`}>
                    {stat.up ? "▲" : "▼"} {stat.change} vs prev period
                  </p>
                </div>
              ))}
            </div>

            {/* Chart */}
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
                      style={{ height: `${(d.clicks / maxClicks) * 100}%`, backgroundColor: primaryColor, minHeight: "4px" }}></div>
                    <span className="text-xs text-gray-400 hidden md:block" style={{ fontSize: "9px" }}>{d.date.split(" ")[1]}</span>
                  </div>
                ))}
              </div>
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
                      {["Campaign", "Status", "Budget", "Impressions", "Clicks", "CTR", "Cost", "Conversions", "Conv. Rate"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map((campaign, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">{campaign.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            campaign.status === "Enabled" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>{campaign.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{campaign.budget}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{campaign.impressions}</td>
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: primaryColor }}>{campaign.clicks}</td>
                        <td className="px-4 py-3 text-xs text-green-600">{campaign.ctr}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{campaign.cost}</td>
                        <td className="px-4 py-3 text-xs text-purple-600 font-medium">{campaign.conversions}</td>
                        <td className="px-4 py-3 text-xs text-orange-500">{campaign.convRate}</td>
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
                {data.recommendations.map((rec, i) => (
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
                    {["Campaign", "Status", "Budget", "Impressions", "Clicks", "CTR", "Avg CPC", "Cost", "Conversions", "Conv. Rate", "Cost/Conv."].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((campaign, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium hover:underline" style={{ color: primaryColor }}>{campaign.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${campaign.status === "Enabled" ? "bg-green-500" : "bg-gray-400"}`}></div>
                          <span className="text-xs text-gray-600">{campaign.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{campaign.budget}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{campaign.impressions}</td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: primaryColor }}>{campaign.clicks}</td>
                      <td className="px-4 py-3 text-xs text-green-600">{campaign.ctr}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{campaign.avgCpc}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{campaign.cost}</td>
                      <td className="px-4 py-3 text-xs text-purple-600 font-medium">{campaign.conversions}</td>
                      <td className="px-4 py-3 text-xs text-orange-500">{campaign.convRate}</td>
                      <td className="px-4 py-3 text-xs text-red-500">{campaign.costPerConv}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900" colSpan={3}>Total</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">66,400</td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: primaryColor }}>2,540</td>
                    <td className="px-4 py-3 text-xs font-bold text-green-600">3.83%</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">—</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">₹45,300</td>
                    <td className="px-4 py-3 text-xs font-bold text-purple-600">91</td>
                    <td className="px-4 py-3 text-xs font-bold text-orange-500">—</td>
                    <td className="px-4 py-3 text-xs font-bold text-red-500">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ==================== AD GROUPS PAGE ==================== */}
        {activePage === "adgroups" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Ad Groups</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    {["Ad Group", "Campaign", "Status", "Impressions", "Clicks", "CTR", "Avg CPC", "Conversions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Luxury Hotels", campaign: "Hotel Booking - Search", status: "Enabled", impressions: "8,200", clicks: "620", ctr: "7.56%", cpc: "₹24.19", conversions: "32" },
                    { name: "Budget Hotels", campaign: "Hotel Booking - Search", status: "Enabled", impressions: "4,300", clicks: "270", ctr: "6.28%", cpc: "₹18.52", conversions: "13" },
                    { name: "Hotel Packages", campaign: "Brand Awareness", status: "Enabled", impressions: "22,000", clicks: "580", ctr: "2.64%", cpc: "₹10.34", conversions: "18" },
                    { name: "Competitor Keywords", campaign: "Brand Awareness", status: "Paused", impressions: "5,400", clicks: "210", ctr: "3.89%", cpc: "₹15.71", conversions: "8" },
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

        {/* ==================== KEYWORDS PAGE ==================== */}
        {activePage === "keywords" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Keywords</h3>
              <button className="text-xs font-medium px-3 py-1.5 rounded-lg text-white hover:opacity-90"
                style={{ backgroundColor: primaryColor }}>
                + Add Keywords
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    {["Keyword", "Match Type", "Ad Group", "Status", "Impressions", "Clicks", "CTR", "Avg CPC", "Conversions", "Quality Score"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
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
                { label: "Monthly Spend", value: "₹45,230", sub: "April 2026", color: "text-gray-900" },
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

      {/* ==================== CREATE GOOGLE CAMPAIGN MODAL ==================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-6xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: primaryColor }}>G</div>
              <h3 className="text-lg font-semibold text-gray-900">New Google Campaign</h3>
            </div>
            <div className="space-y-3">
              {campaignStep === 1 ? (
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
              ) : null}

              {/* Step indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                {[1,2,3,4,5].map(s => (
                  <div key={s} className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    campaignStep === s ? "text-white" : campaignStep > s ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                  }`} style={campaignStep === s ? { backgroundColor: primaryColor } : {}}>
                    {campaignStep > s ? "✓" : s}
                  </div>
                ))}
                <span className="ml-2">Step {campaignStep} of 5</span>
              </div>

              {campaignStep > 1 && campaignStep < 5 && (
                <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                  <p className="text-xs text-orange-700">ℹ️ Step {campaignStep} — Campaign settings, targeting aur budget configure karein</p>
                </div>
              )}

              {campaignStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Review Campaign</h3>
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
                  <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                    <p className="text-xs text-orange-700">⚠️ Demo mode — Real API keys milne ke baad live campaigns publish honge</p>
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
