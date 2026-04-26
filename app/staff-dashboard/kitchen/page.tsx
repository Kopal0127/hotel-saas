"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ServiceOrderItem {
  id: string;
  itemName: string;
  itemCategory: string;
  quantity: number;
  price: number;
}

interface ServiceOrder {
  id: string;
  roomNumber: string;
  guestName: string;
  totalAmount: number;
  kitchenStatus: string;
  paymentStatus: string;
  serviceType: string;
  createdAt: string;
  items: ServiceOrderItem[];
}

export default function KitchenDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "PREPARING" | "DELIVERED">("PENDING");
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

    // Check if KITCHEN role hai
    if (!staffData.roles || !staffData.roles.includes("KITCHEN")) {
      alert("❌ Access Denied! Kitchen role nahi hai.");
      router.push("/staff-dashboard");
      return;
    }
  }, [router]);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("staffToken");
      const staff = localStorage.getItem("staff");
      
      if (!staff) return;
      
      const staffData = JSON.parse(staff);
      const hotelId = staffData.hotelId;

      const res = await fetch(
        `/api/service-orders?hotelId=${hotelId}&kitchenStatus=${activeTab}&serviceType=FOOD`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Update order status
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("staffToken");
      
      const res = await fetch("/api/service-orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          kitchenStatus: newStatus,
          deliveredAt: newStatus === "DELIVERED" ? new Date().toISOString() : undefined,
        }),
      });

      if (res.ok) {
        fetchOrders();
      } else {
        alert("❌ Update failed");
      }
    } catch (error) {
      console.error("Error updating status:", error);
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
            <h1 className="text-2xl font-bold text-gray-800">👨‍🍳 Kitchen Dashboard</h1>
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
            🔔 Pending ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("PREPARING")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "PREPARING"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            👨‍🍳 Preparing
          </button>
          <button
            onClick={() => setActiveTab("DELIVERED")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "DELIVERED"
                ? "bg-green-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            ✅ Delivered
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">
              {activeTab === "PENDING" && "🎉 No pending orders! Kitchen is clear."}
              {activeTab === "PREPARING" && "⏳ No orders in preparation."}
              {activeTab === "DELIVERED" && "📦 No delivered orders yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
               className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      🛏️ Room {order.roomNumber}
                    </h3>
                    <p className="text-sm text-gray-600">Guest: {order.guestName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Order Time: {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{order.totalAmount}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.paymentStatus === "PAID" ? "💰 Paid" : "💵 Due"}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">📋 Order Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-700">
                          {item.quantity}x {item.itemName}
                        </span>
                        <span className="text-gray-500">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {activeTab === "PENDING" && (
                    <button
                      onClick={() => updateStatus(order.id, "PREPARING")}
                      className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition"
                    >
                      👨‍🍳 Start Preparing
                    </button>
                  )}
                  {activeTab === "PREPARING" && (
                    <button
                      onClick={() => updateStatus(order.id, "DELIVERED")}
                      className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition"
                    >
                      ✅ Mark Delivered
                    </button>
                  )}
                  {activeTab === "DELIVERED" && (
                    <div className="flex-1 px-4 py-3 bg-green-100 text-green-700 rounded-lg text-center font-medium">
                      ✅ Delivered at{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleTimeString()
                        : "N/A"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}