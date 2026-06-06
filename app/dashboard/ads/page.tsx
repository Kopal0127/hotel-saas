"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";

export default function AdsPage() {
  useAuth();
  const router = useRouter();

  const platforms = [
    {
      id: "google",
      name: "Google Ads",
      description: "Search, Display, Video & Performance Max campaigns",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      ),
      color: "#4285F4",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverBorder: "hover:border-blue-400",
      stats: [
        { label: "Impressions", value: "66,400", change: "+12.3%", up: true },
        { label: "Clicks", value: "2,540", change: "+8.7%", up: true },
        { label: "CTR", value: "3.83%", change: "+0.4%", up: true },
        { label: "Cost", value: "₹45,230", change: "+6.2%", up: true },
      ],
      campaigns: 3,
      activeCampaigns: 2,
      route: "/dashboard/ads/google-ads",
      badgeText: "Google Ads",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "meta",
      name: "Meta Ads",
      description: "Facebook, Instagram & Audience Network campaigns",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: "#1877F2",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      hoverBorder: "hover:border-indigo-400",
      stats: [
        { label: "Reach", value: "1,09,500", change: "+18.2%", up: true },
        { label: "Clicks", value: "4,580", change: "+11.3%", up: true },
        { label: "CTR", value: "3.23%", change: "+0.3%", up: true },
        { label: "Spend", value: "₹38,450", change: "+9.1%", up: true },
      ],
      campaigns: 3,
      activeCampaigns: 2,
      route: "/dashboard/ads/meta-ads",
      badgeText: "Meta Ads",
      badgeColor: "bg-indigo-100 text-indigo-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ←
          </button>
          <h1
            className="text-xl font-bold text-blue-600 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            HotelPro
          </h1>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-medium text-gray-600">📢 Digital Ads</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/profile")}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            👤 Profile
          </button>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Digital Advertising</h2>
          <p className="text-sm text-gray-500 mt-1">
            Apne hotel ke Google aur Meta campaigns ek jagah se manage karein
          </p>
        </div>

        {/* Combined Summary Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Combined Overview — Apr 1 to Apr 12, 2026
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Impressions", value: "2,08,400", icon: "👁️" },
              { label: "Total Clicks", value: "7,120", icon: "🖱️" },
              { label: "Total Conversions", value: "241", icon: "🎯" },
              { label: "Total Spend", value: "₹83,680", icon: "💰" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              onClick={() => router.push(platform.route)}
              className={`bg-white rounded-2xl shadow-sm border ${platform.borderColor} ${platform.hoverBorder} cursor-pointer transition-all hover:shadow-md group`}
            >
              {/* Card Header */}
              <div className={`${platform.bgColor} rounded-t-2xl px-6 py-5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  {platform.icon}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{platform.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{platform.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${platform.badgeColor}`}>
                    {platform.activeCampaigns} Active
                  </span>
                  <span className="text-xs text-gray-400">{platform.campaigns} Total</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {platform.stats.map((stat, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-base font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-xs font-medium mt-0.5 ${stat.up ? "text-green-600" : "text-red-500"}`}>
                        {stat.up ? "▲" : "▼"} {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: platform.color }}
                >
                  Open {platform.name} Dashboard →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <p className="text-sm font-semibold text-yellow-800 mb-3">💡 Quick Tips</p>
          <div className="space-y-2">
            {[
              "Google Ads se direct search traffic milti hai — hotel booking intent wale users.",
              "Meta Ads se brand awareness aur remarketing karo — travel planners tak pahuncho.",
              "Dono platforms ek saath chalao 3x conversions ke liye.",
            ].map((tip, i) => (
              <p key={i} className="text-xs text-yellow-700 flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">•</span>
                {tip}
              </p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
