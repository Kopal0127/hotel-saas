"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRooms: 0,
    bookingsToday: 0,
    revenueToday: 0,
    totalHotels: 0,
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
        const todayBookings = bookingsData.bookings?.filter((b: any) =>
          new Date(b.createdAt).toDateString() === today
        ) || [];

        const revenueToday = todayBookings.reduce(
          (sum: number, b: any) => sum + parseFloat(b.amount), 0
        );

        setStats({
          totalHotels: hotelsData.hotels.length,
          totalRooms: roomsData.rooms?.length || 0,
          bookingsToday: todayBookings.length,
          revenueToday,
        });

        setRecentBookings(bookingsData.bookings?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Welcome back! 👋</span>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">🏨</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalHotels}</div>
            <div className="text-gray-500 text-sm">Total Hotels</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">🛏️</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalRooms}</div>
            <div className="text-gray-500 text-sm">Total Rooms</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-gray-900">{stats.bookingsToday}</div>
            <div className="text-gray-500 text-sm">Bookings Today</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-gray-900">₹{stats.revenueToday}</div>
            <div className="text-gray-500 text-sm">Revenue Today</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/dashboard/rooms")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <span className="text-2xl">🛏️</span>
              <span className="text-sm font-medium text-blue-700">Room Add Karo</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/bookings")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <span className="text-2xl">📅</span>
              <span className="text-sm font-medium text-green-700">Booking Dekho</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/channels")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <span className="text-2xl">🌐</span>
              <span className="text-sm font-medium text-purple-700">OTA Sync</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/payments")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <span className="text-2xl">💳</span>
              <span className="text-sm font-medium text-green-700">Payments</span>
</button>
                      <button
            onClick={() => router.push("/dashboard/reports")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
              <span className="text-2xl">📊</span>
              <span className="text-sm font-medium text-orange-700">Reports Dekho</span>
            </button>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-4">📭</div>
              <p>Abhi koi booking nahi hai</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Guest</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Room</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Check In</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{booking.guestName}</p>
                        <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">#{booking.roomNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(booking.checkIn).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{booking.amount}</td>
                      <td className="px-4 py-3">
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
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
    </div>
  );
}