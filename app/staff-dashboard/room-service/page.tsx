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
  const [recentOrders, setRecentOrders] = useState<ServiceOrder[]>([]);
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

      if (activeTab === "KITCHEN") {
        const [foodRes, drinksRes] = await Promise.all([
          fetch(`/api/service-orders?hotelId=${hotelId}&kitchenStatus=PREPARED&serviceType=FOOD`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/service-orders?hotelId=${hotelId}&kitchenStatus=PREPARED&serviceType=DRINKS`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const foodData = foodRes.ok ? await foodRes.json() : { orders: [] };
        const drinksData = drinksRes.ok ? await drinksRes.json() : { orders: [] };
        const combined = [...(foodData.orders || []), ...(drinksData.orders || [])];
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(combined);
      } else {
       const res = await fetch(`/api/service-orders?hotelId=${hotelId}&serviceType=OTHER&kitchenStatus=PENDING`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem("staffToken");
      const staff = localStorage.getItem("staff");
      if (!staff) return;

      const staffData = JSON.parse(staff);
      const hotelId = staffData.hotelId;

      const [foodRes, drinksRes, otherRes] = await Promise.all([
        fetch(`/api/service-orders?hotelId=${hotelId}&serviceType=FOOD`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/service-orders?hotelId=${hotelId}&serviceType=DRINKS`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/service-orders?hotelId=${hotelId}&serviceType=OTHER`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const foodData = foodRes.ok ? await foodRes.json() : { orders: [] };
      const drinksData = drinksRes.ok ? await drinksRes.json() : { orders: [] };
      const otherData = otherRes.ok ? await otherRes.json() : { orders: [] };
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const combined = [...(foodData.orders || []), ...(drinksData.orders || []), ...(otherData.orders || [])].filter((o: ServiceOrder) =>
        new Date(o.createdAt) >= sevenDaysAgo
      );
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentOrders(combined);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRecentOrders();
    const interval = setInterval(() => {
      fetchOrders();
      fetchRecentOrders();
    }, 30000);
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
        fetchRecentOrders();
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
         <div className="flex gap-3">
            <button onClick={() => router.push("/staff-dashboard")} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              ← Back to Roles
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              🚪 Logout
            </button>
          </div>
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

        {/* Recent Orders */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">📋 Recent Orders (Last 7 Days)</h2>
          {recentOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-400">Koi recent orders nahi hain.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Room</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Guest</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Items</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">#{order.roomNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.guestName}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {order.items.map(i => `${i.quantity}x ${i.itemName}`).join(", ")}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">₹{order.totalAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.kitchenStatus === "DELIVERED" ? "bg-green-100 text-green-700" :
                          order.kitchenStatus === "PREPARED" ? "bg-blue-100 text-blue-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          {order.kitchenStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}