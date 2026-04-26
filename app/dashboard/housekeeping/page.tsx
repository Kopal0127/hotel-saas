"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";

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

interface Room {
  id: string;
  number: string;
  type: string;
}

export default function HousekeepingPage() {
  useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<HousekeepingRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "IN_PROGRESS" | "DONE">("PENDING");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    roomId: "",
    roomNumber: "",
    requestType: "CLEANING",
    priority: "NORMAL",
    notes: "",
  });

  // Fetch rooms
 const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const hotelsRes = await fetch("/api/hotels");
      const hotelsData = await hotelsRes.json();
      const hotelId = hotelsData.hotels?.[0]?.id;

      const res = await fetch(`/api/rooms?hotelId=${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const hotelsRes = await fetch("/api/hotels");
      const hotelsData = await hotelsRes.json();
      const hotelId = hotelsData.hotels?.[0]?.id;

      const res = await fetch(
        `/api/housekeeping?hotelId=${hotelId}&status=${activeTab}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  // Create request
  const handleSubmit = async () => {
    if (!form.roomId) {
      alert("Room select karo!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const hotelsRes = await fetch("/api/hotels");
      const hotelsData = await hotelsRes.json();
      const hotelId = hotelsData.hotels?.[0]?.id;

      const res = await fetch("/api/housekeeping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
       body: JSON.stringify({
          hotelId,
          roomId: form.roomId,
          roomNumber: form.roomNumber,
          roomType: rooms.find(r => r.id === form.roomId)?.type || "Standard",
          requestType: form.requestType,
          priority: form.priority,
          notes: form.notes,
          source: "MANUAL",
        }),
      });

      if (res.ok) {
        alert("✅ Request create ho gayi!");
        setForm({ roomId: "", roomNumber: "", requestType: "CLEANING", priority: "NORMAL", notes: "" });
        setShowForm(false);
        fetchRequests();
      } else {
        alert("❌ Request create nahi ho saki!");
      }
    } catch (error) {
      alert("❌ Kuch galat hua!");
    }
  };
  // Status update
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/housekeeping", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) fetchRequests();
      else alert("❌ Update failed!");
    } catch {
      alert("❌ Kuch galat hua!");
    }
  };

  // Delete request
  const handleDelete = async (id: string) => {
    if (!confirm("Delete karna chahte ho?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/housekeeping?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchRequests();
      }
    } catch (error) {
      alert("❌ Delete nahi ho saka!");
    }
  };

  const statusColors: any = {
    PENDING: "bg-orange-100 text-orange-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    DONE: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">🧹 Housekeeping</h1>
          <p className="text-sm text-gray-500">Room cleaning requests manage karo</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          + New Request
        </button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🧹 Naya Cleaning Request</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Room Select Karo</label>
              <select
                value={form.roomId}
                onChange={(e) => {
                  const selectedRoom = rooms.find(r => r.id === e.target.value);
                  setForm({
                    ...form,
                    roomId: e.target.value,
                    roomNumber: selectedRoom?.number || "",
                  });
                }}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500"
              >
                <option value="">-- Room chuno --</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room #{room.number} — {room.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Request Type</label>
              <select
                value={form.requestType}
                onChange={(e) => setForm({ ...form, requestType: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500"
              >
                <option value="CLEANING">🧹 Cleaning</option>
                <option value="LAUNDRY">👕 Laundry</option>
                <option value="TOWEL_CHANGE">🛁 Towel Change</option>
                <option value="BEDSHEET_CHANGE">🛏️ Bedsheet Change</option>
                <option value="DEEP_CLEAN">🧽 Deep Clean</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500"
              >
                <option value="NORMAL">⚪ Normal</option>
                <option value="HIGH">🔴 High Priority</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Notes (Optional)</label>
              <input
                type="text"
                placeholder="Koi note? e.g. Extra towels chahiye"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              ✅ Create Request
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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

      {/* Requests Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">
            {activeTab === "PENDING" && "🎉 No pending requests!"}
            {activeTab === "IN_PROGRESS" && "⏳ No rooms being cleaned."}
            {activeTab === "DONE" && "✅ No completed requests yet."}
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
                req.priority === "HIGH" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
              }`}>
                {req.priority === "HIGH" ? "🔴 High Priority" : "⚪ Normal"}
              </span>

              {req.notes && (
                <p className="text-xs text-gray-400 mb-2">📝 {req.notes}</p>
              )}

              <p className="text-xs text-gray-400 mb-3">
                🕐 {new Date(req.createdAt).toLocaleTimeString()}
              </p>

              {req.completedAt && (
                <p className="text-xs text-green-600 mb-2">
                  ✅ {new Date(req.completedAt).toLocaleTimeString()}
                </p>
              )}

             {activeTab === "PENDING" && (
                <button
                  onClick={() => handleStatusUpdate(req.id, "IN_PROGRESS")}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition mb-2"
                >
                  🧹 Start Cleaning
                </button>
              )}
              {activeTab === "IN_PROGRESS" && (
                <button
                  onClick={() => handleStatusUpdate(req.id, "DONE")}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition mb-2"
                >
                  ✅ Mark Done
                </button>
              )}
              <button
                onClick={() => handleDelete(req.id)}
                className="w-full px-4 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 text-sm font-medium transition"
              >
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}