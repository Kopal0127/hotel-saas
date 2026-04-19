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
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<"recent" | "all" | "checkin" | "checkout" | "rooms">("recent");

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
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        const checkInsToday = bookingsData.bookings?.filter((b: any) =>
          new Date(b.checkIn).toDateString() === today
        ).length || 0;

        const checkOutsToday = bookingsData.bookings?.filter((b: any) =>
          new Date(b.checkOut).toDateString() === today
        ).length || 0;

        // Unavailable rooms:
        // 1. CONFIRMED — guest aane wala hai (aaj ya future checkIn)
        // 2. CHECKED_IN — guest abhi andar hai
        // Available rooms:
        // 1. CANCELLED — booking cancel, room free
        // 2. CHECKED_OUT — guest ja chuka (status manually change hua)
        // 3. Koi booking nahi
        const unavailableRoomIds = new Set(
          bookingsData.bookings
            ?.filter((b: any) => {
              const checkIn = new Date(b.checkIn);
              checkIn.setHours(0, 0, 0, 0);
              return (
                (b.status === "CONFIRMED" && checkIn >= todayDate) ||
                b.status === "CHECKED_IN"
              );
            })
            .map((b: any) => b.roomId) || []
        );

        const available = roomsData.rooms?.filter(
          (r: any) => !unavailableRoomIds.has(r.id)
        ) || [];

        setAvailableRooms(available);

        setStats({
          totalRooms: available.length, // Available rooms count dikhayenge
          totalBookings: bookingsData.bookings?.length || 0,
          checkInsToday,
          checkOutsToday,
        });

        setAllBookings(bookingsData.bookings || []);
        setRecentBookings(bookingsData.bookings?.slice(0, 8) || []);
      }
    } catch (error) {
      showToast("Data load nahi ho saka!", "error");
    }
  };

  const today = new Date().toDateString();

  const getFilteredBookings = () => {
    if (activeFilter === "all") return allBookings;
    if (activeFilter === "checkin") return allBookings.filter((b) => new Date(b.checkIn).toDateString() === today);
    if (activeFilter === "checkout") return allBookings.filter((b) => new Date(b.checkOut).toDateString() === today);
    return recentBookings;
  };

  const getTableTitle = () => {
    if (activeFilter === "all") return `All Bookings (${allBookings.length})`;
    if (activeFilter === "checkin") return `Today's Check-ins (${allBookings.filter((b) => new Date(b.checkIn).toDateString() === today).length})`;
    if (activeFilter === "checkout") return `Today's Check-outs (${allBookings.filter((b) => new Date(b.checkOut).toDateString() === today).length})`;
    return "Recent Bookings";
  };

  const filteredBookings = getFilteredBookings();

  // Group available rooms by type
  const groupedAvailableRooms = availableRooms.reduce((acc: any, room: any) => {
    if (!acc[room.type]) acc[room.type] = [];
    acc[room.type].push(room);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => router.push("/dashboard/profile")} className="text-sm text-gray-600 hover:text-blue-600">
            👤 Profile
          </button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="px-4 md:px-6 py-6">

        {/* TOP ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* LEFT — Bookings Dashboard */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-4">Bookings Dashboard</h2>

            {/* Row 1 — 3 clickable stats */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div
                onClick={() => setActiveFilter("all")}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${activeFilter === "all" ? "bg-blue-50 border-blue-300 shadow-sm" : "bg-gray-50 border-gray-100 hover:bg-blue-50 hover:border-blue-200"}`}>
                <div className="text-2xl mb-1">📋</div>
                <div className="text-xl font-bold text-gray-900">{stats.totalBookings}</div>
                <div className="text-gray-500 text-xs">Total Bookings</div>
              </div>
              <div
                onClick={() => setActiveFilter("checkin")}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${activeFilter === "checkin" ? "bg-green-50 border-green-300 shadow-sm" : "bg-gray-50 border-gray-100 hover:bg-green-50 hover:border-green-200"}`}>
                <div className="text-2xl mb-1">🏨</div>
                <div className="text-xl font-bold text-green-600">{stats.checkInsToday}</div>
                <div className="text-gray-500 text-xs">Today's Check-ins</div>
              </div>
              <div
                onClick={() => setActiveFilter("checkout")}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${activeFilter === "checkout" ? "bg-red-50 border-red-300 shadow-sm" : "bg-gray-50 border-gray-100 hover:bg-red-50 hover:border-red-200"}`}>
                <div className="text-2xl mb-1">🚪</div>
                <div className="text-xl font-bold text-orange-500">{stats.checkOutsToday}</div>
                <div className="text-gray-500 text-xs">Today's Check-outs</div>
              </div>
            </div>

            {/* Row 2 — Available Rooms (clickable) + Room Service + Housekeeping */}
            <div className="grid grid-cols-3 gap-3">
              <div
                onClick={() => setActiveFilter("rooms")}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${activeFilter === "rooms" ? "bg-indigo-50 border-indigo-300 shadow-sm" : "bg-gray-50 border-gray-100 hover:bg-indigo-50 hover:border-indigo-200"}`}>
                <div className="text-2xl mb-1">🛏️</div>
                <div className="text-xl font-bold text-indigo-600">{availableRooms.length}</div>
                <div className="text-gray-500 text-xs">Available Rooms</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-2xl mb-1">🍽️</div>
                <div className="text-sm font-bold text-yellow-600">Active</div>
                <div className="text-gray-500 text-xs">Room Service</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-2xl mb-1">🧹</div>
                <div className="text-sm font-bold text-teal-600">On Duty</div>
                <div className="text-gray-500 text-xs">Housekeeping</div>
              </div>
            </div>

            {/* Row 3 — Inventory */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-2xl mb-1">📦</div>
                <div className="text-sm font-bold text-purple-600">In Stock</div>
                <div className="text-gray-500 text-xs">Inventory</div>
              </div>
            </div>
          </div>

          {/* RIGHT — Quick Actions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => router.push("/dashboard/rooms")}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100">
                <span className="text-2xl">🛏️</span>
                <span className="text-sm font-medium text-blue-700">Rooms</span>
              </button>
              <button onClick={() => router.push("/dashboard/bookings")}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors border border-green-100">
                <span className="text-2xl">📅</span>
                <span className="text-sm font-medium text-green-700">Bookings</span>
              </button>
              <button onClick={() => router.push("/dashboard/channels")}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-100">
                <span className="text-2xl">🌐</span>
                <span className="text-sm font-medium text-purple-700">OTA Sync</span>
              </button>
              <button onClick={() => router.push("/dashboard/payments")}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-cyan-50 hover:bg-cyan-100 transition-colors border border-cyan-100">
                <span className="text-2xl">💳</span>
                <span className="text-sm font-medium text-cyan-700">Payments</span>
              </button>
              <button onClick={() => router.push("/dashboard/reports")}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-100">
                <span className="text-2xl">📊</span>
                <span className="text-sm font-medium text-orange-700">Reports</span>
              </button>
              <button onClick={() => router.push("/dashboard/rates")}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors border border-yellow-100">
                <span className="text-2xl">🏷️</span>
                <span className="text-sm font-medium text-yellow-700">Rates</span>
              </button>
              <button onClick={() => router.push("/dashboard/ads")}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors border border-red-100">
                <span className="text-2xl">📢</span>
                <span className="text-sm font-medium text-red-700">Digital Ads</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM — Available Rooms OR Bookings Table */}
        {activeFilter === "rooms" ? (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-gray-900">
                Available Rooms ({availableRooms.length})
              </h2>
              <button
                onClick={() => setActiveFilter("recent")}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ← Back
              </button>
            </div>

            {availableRooms.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-5xl mb-3">🛏️</div>
                <p className="font-medium">Koi room available nahi hai</p>
                <p className="text-sm mt-1">Sabhi rooms booked hain!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedAvailableRooms).map(([type, rooms]: any) => (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-gray-700">{type}</span>
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {rooms.length} Available
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {rooms.map((room: any) => (
                        <div key={room.id}
                          className="bg-green-50 border border-green-200 rounded-xl p-3 text-center hover:bg-green-100 transition-colors">
                          <div className="text-lg mb-1">🛏️</div>
                          <div className="text-sm font-bold text-gray-800">#{room.number}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{room.type}</div>
                          <div className="text-xs text-green-600 font-medium mt-1">₹{room.price}/night</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">{getTableTitle()}</h2>
              <div className="flex gap-2">
                {activeFilter !== "recent" && (
                  <button
                    onClick={() => setActiveFilter("recent")}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={() => router.push("/dashboard/bookings")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All →
                </button>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p>Koi booking nahi mili</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest Name</th>
                      <th className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider ${activeFilter === "checkin" ? "text-green-600" : "text-gray-500"}`}>Check-in</th>
                      <th className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider ${activeFilter === "checkout" ? "text-red-500" : "text-gray-500"}`}>Check-out</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.map((booking) => {
                      const isCheckInToday = new Date(booking.checkIn).toDateString() === today;
                      const isCheckOutToday = new Date(booking.checkOut).toDateString() === today;
                      const paymentPaid = booking.paymentAmount || 0;
                      const totalAmount = parseFloat(booking.amount) || 0;
                      const isDue = paymentPaid < totalAmount;

                      return (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              #{booking.id?.slice(0, 8).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{booking.guestName}</p>
                            <p className="text-xs text-gray-400">{booking.guestEmail}</p>
                          </td>
                          <td className={`px-4 py-3 ${activeFilter === "checkin" ? "bg-green-50" : ""}`}>
                            <p className={`text-sm font-medium ${activeFilter === "checkin" ? "text-green-700" : "text-gray-700"}`}>
                              {new Date(booking.checkIn).toLocaleDateString("en-IN")}
                            </p>
                            {isCheckInToday && activeFilter !== "checkin" && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Today</span>
                            )}
                          </td>
                          <td className={`px-4 py-3 ${activeFilter === "checkout" ? "bg-red-50" : ""}`}>
                            <p className={`text-sm font-medium ${activeFilter === "checkout" ? "text-red-600" : "text-gray-700"}`}>
                              {new Date(booking.checkOut).toLocaleDateString("en-IN")}
                            </p>
                            {isCheckOutToday && activeFilter !== "checkout" && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Today</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-900">₹{booking.amount}</p>
                          </td>
                          <td className="px-4 py-3">
                            {isDue ? (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">Due</span>
                            ) : (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Paid</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              booking.status === "CONFIRMED" ? "bg-green-100 text-green-700"
                              : booking.status === "CHECKED_IN" ? "bg-blue-100 text-blue-700"
                              : booking.status === "CHECKED_OUT" ? "bg-gray-100 text-gray-600"
                              : booking.status === "CANCELLED" ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => router.push("/dashboard/bookings")}
                              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}