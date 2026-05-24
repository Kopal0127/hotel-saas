"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ROLE_CONFIG: Record<string, { emoji: string; label: string; path: string; color: string }> = {
  "Housekeeping":       { emoji: "🧹", label: "Housekeeping",       path: "/staff-dashboard/housekeeping",       color: "bg-purple-50 border-purple-200 hover:bg-purple-100" },
  "Kitchen":            { emoji: "👨‍🍳", label: "Kitchen",            path: "/staff-dashboard/kitchen",            color: "bg-orange-50 border-orange-200 hover:bg-orange-100" },
  "ROOM_SERVICE":       { emoji: "🛎️", label: "ROOM_SERVICE",       path: "/staff-dashboard/room-service",       color: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
  "Front Desk":         { emoji: "🏨", label: "Front Desk",         path: "/staff-dashboard/front-desk",         color: "bg-green-50 border-green-200 hover:bg-green-100" },
  "Waiter":             { emoji: "🍽️", label: "Waiter",             path: "/staff-dashboard/waiter",             color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100" },
  "Property Manager":   { emoji: "🏢", label: "Property Manager",   path: "/staff-dashboard/property-manager",   color: "bg-red-50 border-red-200 hover:bg-red-100" },
};

export default function StaffDashboardPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("staffToken");
    const staffInfo = localStorage.getItem("staff");
    if (!token || !staffInfo) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(staffInfo);
    setStaff(parsed);
    setRoles(parsed.roles || []);

    // Sirf 1 role hai toh seedha redirect
    if (parsed.roles?.length === 1) {
      const roleKey = Object.keys(ROLE_CONFIG).find(
  key => key.toLowerCase() === parsed.roles[0].toLowerCase()
);
const config = roleKey ? ROLE_CONFIG[roleKey] : undefined;
      if (config) router.push(config.path);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staff");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
          <p className="text-sm text-gray-500">Staff Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{staff?.name}</p>
            <p className="text-xs text-gray-400">{staff?.hotelName}</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </div>

      {/* Role Cards */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-6 text-center">
          Aaj kaunsa kaam karna hai? 👋
        </h2>

        {roles.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <div className="text-5xl mb-4">⚠️</div>
            <p>Koi role assign nahi kiya gaya. Hotel owner se contact karo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {roles.map((role) => {
             const roleKey = Object.keys(ROLE_CONFIG).find(
             key => key.toLowerCase() === role.toLowerCase()
             );
             const config = roleKey ? ROLE_CONFIG[roleKey] : undefined;
              if (!config) return null;
              return (
                <button key={role}
                  onClick={() => router.push(config.path)}
                  className={`border-2 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all ${config.color}`}>
                  <span className="text-4xl">{config.emoji}</span>
                  <span className="font-semibold text-gray-700">{config.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}