"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/Toast";
import { useToast } from "@/components/useToast";
import { useAuth } from "@/components/useAuth";

export default function Dashboard() {
  useAuth();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBookings: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const hotelsRes = await fetch("/api/hotels");
      const hotelsData = await hotelsRes.json();

      if (hotelsData.hotels && hotelsData.hotels.length > 0) {
        const hotelId = hotelsData.hotels[0].id;

        const roomsRes = await fetch(`/api/rooms?hotelId=${hotelId}`);
        const roomsData = await roomsRes.json();

        const bookingsRes = await fetch(`/api/bookings?hotelId=${hotelId}`);
        const bookingsData = await bookingsRes.json();

        const today = new Date().toDateString();

        const checkInsToday = bookingsData.bookings?.filter((b: any) =>
          new Date(b.checkIn).toDateString() === today
        ).length || 0;

        const checkOutsToday = bookingsData.bookings?.filter((b: any) =>
          new Date(b.checkOut).toDateString() === today
        ).length || 0;

        setStats({
          totalRooms: roomsData.rooms?.length || 0,
          totalBookings: bookingsData.bookings?.length || 0,
          checkInsToday,
          checkOutsToday,
        });

        setRecentBookings(bookingsData.bookings?.slice(0, 5) || []);
      }
    } catch (error) {
      showToast("Data load nahi ho saka!", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex items-center gap-2 md:gap-4">
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

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* Quick Actions — UPAR */}
        <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-gray-100 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            <button
              onClick={() => router.push("/dashboard/rooms")}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <span className="text-xl md:text-2xl">🛏️</span>
              <span className="text-xs md:text-sm font-medium text-blue-700 text-center">Rooms</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/bookings")}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <span className="text-xl md:text-2xl">📅</span>
              <span className="text-xs md:text-sm font-medium text-green-700 text-center">Bookings</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/channels")}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <span className="text-xl md:text-2xl">🌐</span>
              <span className="text-xs md:text-sm font-medium text-purple-700 text-center">OTA Sync</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/payments")}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <span className="text-xl md:text-2xl">💳</span>
              <span className="text-xs md:text-sm font-medium text-green-700 text-center">Payments</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/reports")}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
              <span className="text-xl md:text-2xl">📊</span>
              <span className="text-xs md:text-sm font-medium text-orange-700 text-center">Reports</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/rates")}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <span className="text-xl md:text-2xl">📅</span>
              <span className="text-xs md:text-sm font-medium text-purple-700 text-center">Rates</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/ads")}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors">
              <span className="text-xl md:text-2xl">📢</span>
              <span className="text-xs md:text-sm font-medium text-yellow-700 text-center">Digital Ads</span>
            </button>
          </div>
        </div>

        {/* Bookings Dashboard — Stats Cards */}
        <div className="mb-6 md:mb-10">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Bookings Dashboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-3 md:mb-6">
            {/* Total Bookings */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="text-2xl md:text-3xl mb-2">📋</div>
              <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
              <div className="text-gray-500 text-xs md:text-sm">Total Bookings</div>
            </div>
            {/* Today's Check-ins */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="text-2xl md:text-3xl mb-2">🏨</div>
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.checkInsToday}</div>
              <div className="text-gray-500 text-xs md:text-sm">Today's Check-ins</div>
            </div>
            {/* Today's Check-outs */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="text-2xl md:text-3xl mb-2">🚪</div>
              <div className="text-xl md:text-2xl font-bold text-orange-500">{stats.checkOutsToday}</div>
              <div className="text-gray-500 text-xs md:text-sm">Today's Check-outs</div>
            </div>
            {/* Total Rooms */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="text-2xl md:text-3xl mb-2">🛏️</div>
              <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalRooms}</div>
              <div className="text-gray-500 text-xs md:text-sm">Total Rooms</div>
            </div>
          </div>

          {/* Second Row — Room Service, Housekeeping, Inventory */}
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="text-2xl md:text-3xl mb-2">🍽️</div>
              <div className="text-xl md:text-2xl font-bold text-yellow-600">Active</div>
              <div className="text-gray-500 text-xs md:text-sm">Room Service</div>
            </div>
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="text-2xl md:text-3xl mb-2">🧹</div>
              <div className="text-xl md:text-2xl font-bold text-teal-600">On Duty</div>
              <div className="text-gray-500 text-xs md:text-sm">Housekeeping</div>
            </div>
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="text-2xl md:text-3xl mb-2">📦</div>
              <div className="text-xl md:text-2xl font-bold text-purple-600">In Stock</div>
              <div className="text-gray-500 text-xs md:text-sm">Inventory</div>
            </div>
          </div>
        </div>

        {/* Recent Bookings — SAME AS BEFORE */}
        <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-gray-400">
              <div className="text-4xl md:text-5xl mb-4">📭</div>
              <p>Abhi koi booking nahi hai</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 md:px-4 py-3 text-xs md:text-sm font-medium text-gray-600">Guest</th>
                    <th className="text-left px-3 md:px-4 py-3 text-xs md:text-sm font-medium text-gray-600">Room</th>
                    <th className="text-left px-3 md:px-4 py-3 text-xs md:text-sm font-medium text-gray-600">Check In</th>
                    <th className="text-left px-3 md:px-4 py-3 text-xs md:text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left px-3 md:px-4 py-3 text-xs md:text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm font-medium text-gray-900">{booking.guestName}</p>
                        <p className="text-xs text-gray-500 hidden md:block">{booking.guestEmail}</p>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-gray-600">#{booking.roomNumber}</td>
                      <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-gray-600">
                        {new Date(booking.checkIn).toLocaleDateString()}
                      </td>
                      <td className="px-3 md:px-4 py-3 text-xs md:text-sm font-medium text-gray-900">₹{booking.amount}</td>
                      <td className="px-3 md:px-4 py-3">
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}