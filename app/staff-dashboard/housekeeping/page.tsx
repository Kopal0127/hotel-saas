"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HousekeepingRequest {
  id: string;
  roomNumber: string;
  requestType: string;
  status: string;
  priority: string;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
}

export default function HousekeepingDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<HousekeepingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "IN_PROGRESS" | "DONE">("PENDING");
  const [staffName, setStaffName] = useState("");

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("staffToken");
    const staff = localStorage.getItem("staff");

    if (!token || !staff) {
      router.push("/staff-login");
      return;
    }

    const staffData = JSON.parse(staff);
    setStaffName(staffData.name);

    if (!staffData.roles || !staffData.roles.includes("HOUSEKEEPING")) {
      alert("❌ Access Denied! Housekeeping role nahi hai.");
      router.push("/staff-dashboard");
      return;
    }
  }, [router]);

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const staff = localStorage.getItem("staff");
      if (!staff) return;

      const staffData = JSON.parse(staff);
      const hotelId = staffData.hotelId;
      const token = localStorage.getItem("staffToken");

      const res = await fetch(
        `/api/housekeeping?hotelId=${hotelId}&status=${activeTab}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Update status
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("staffToken");

      const res = await fetch("/api/housekeeping", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        fetchRequests();
      } else {
        alert("❌ Update failed!");
      }
    } catch (error) {
      alert("❌ Error updating status");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staff");
    router.push("/staff-login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🧹 Housekeeping Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {staffName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "PENDING"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🔔 Pending ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("IN_PROGRESS")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "IN_PROGRESS"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🧹 In Progress
          </button>
          <button
            onClick={() => setActiveTab("DONE")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "DONE"
                ? "bg-green-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            ✅ Done
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">
              {activeTab === "PENDING" && "🎉 No pending requests!"}
              {activeTab === "IN_PROGRESS" && "⏳ No rooms being cleaned."}
              {activeTab === "DONE" && "📦 No completed requests yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition text-center"
              >
                <div className="text-3xl mb-2">🛏️</div>
                <h3 className="text-lg font-bold text-gray-800">#{req.roomNumber}</h3>
                <p className="text-sm text-gray-500 mb-1">{req.requestType}</p>

                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                  req.priority === "HIGH"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {req.priority === "HIGH" ? "🔴 High Priority" : "⚪ Normal"}
                </span>

                {req.notes && (
                  <p className="text-xs text-gray-400 mb-2">📝 {req.notes}</p>
                )}

                <p className="text-xs text-gray-400 mb-3">
                  {new Date(req.createdAt).toLocaleTimeString()}
                </p>

                {/* Action Button */}
                {activeTab === "PENDING" && (
                  <button
                    onClick={() => updateStatus(req.id, "IN_PROGRESS")}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition"
                  >
                    🧹 Start Cleaning
                  </button>
                )}
                {activeTab === "IN_PROGRESS" && (
                  <button
                    onClick={() => updateStatus(req.id, "DONE")}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition"
                  >
                    ✅ Mark Done
                  </button>
                )}
                {activeTab === "DONE" && (
                  <div className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg text-center text-sm font-medium">
                    ✅ Completed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}