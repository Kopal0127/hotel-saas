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

export default function RoomServiceDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"KITCHEN" | "OTHER">("KITCHEN");
  const [staffName, setStaffName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("staffToken");
    const staff = localStorage.getItem("staff");

    if (!token || !staff) {
      router.push("/staff-login");
      return;
    }

    const staffData = JSON.parse(staff);
    setStaffName(staffData.name);

    if (!staffData.roles || !staffData.roles.map((r: string) => r.toLowerCase()).includes("room_service")) {
      alert("❌ Access Denied! Room Service role nahi hai.");
      router.push("/staff-dashboard");
      return;
    }
  }, [router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("staffToken");
      const staff = localStorage.getItem("staff");
      if (!staff) return;

      const staffData = JSON.parse(staff);
      const hotelId = staffData.hotelId;

      let url = "";
      if (activeTab === "KITCHEN") {
        url = `/api/service-orders?hotelId=${hotelId}&kitchenStatus=PREPARED&serviceType=FOOD`;
      } else {
        url = `/api/service-orders?hotelId=${hotelId}&serviceType=OTHER`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const updateStatus = async (orderId: string) => {
    try {
      const token = localStorage.getItem("staffToken");

      const res = await fetch("/api/service-orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: orderId,
          kitchenStatus: "DELIVERED",
        }),
      });

      if (res.ok) {
        fetchOrders();
      } else {
        const errData = await res.json();
        alert("❌ Update failed: " + (errData.error || "Unknown error"));
      }
    } catch (error) {
      alert("❌ Error updating status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staff");
    router.push("/staff-login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🛎️ Room Service Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {staffName}</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("KITCHEN")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "KITCHEN" ? "bg-orange-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🍽️ Kitchen Orders ({activeTab === "KITCHEN" ? orders.length : ""})
          </button>
          <button
            onClick={() => setActiveTab("OTHER")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "OTHER" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🛎️ Other Services ({activeTab === "OTHER" ? orders.length : ""})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">
              {activeTab === "KITCHEN" && "🎉 No prepared orders yet!"}
              {activeTab === "OTHER" && "🎉 No other service requests!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition text-center">
                <div className="text-3xl mb-2">🛎️</div>
                <h3 className="text-lg font-bold text-gray-800">#{order.roomNumber}</h3>
                <p className="text-sm text-gray-500 mb-1">{order.guestName}</p>
                <p className="text-xs text-gray-400 mb-2">{new Date(order.createdAt).toLocaleTimeString()}</p>

                <div className="bg-white rounded-lg px-3 py-2 mb-2 text-left">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-gray-700 py-0.5">
                      <span>{item.quantity}x {item.itemName}</span>
                      <span className="text-gray-400">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-3 px-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {order.paymentStatus === "PAID" ? "💰 Paid" : "💵 Due"}
                  </span>
                  <span className="text-sm font-bold text-green-600">₹{order.totalAmount}</span>
                </div>

                <button
                  onClick={() => updateStatus(order.id)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition"
                >
                  ✅ Mark Delivered
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}