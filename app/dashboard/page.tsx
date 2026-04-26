"use client";
import { useState, useEffect, useRef } from "react";
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
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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

        // Unavailable room IDs — check all rooms in bookingRooms array too
        const unavailableRoomIds = new Set<string>();
        bookingsData.bookings?.forEach((b: any) => {
          const checkIn = new Date(b.checkIn);
          checkIn.setHours(0, 0, 0, 0);
          const isActive = (b.status === "CONFIRMED" && checkIn >= todayDate) || b.status === "CHECKED_IN";
          if (isActive) {
            if (b.rooms && b.rooms.length > 0) {
              b.rooms.forEach((r: any) => unavailableRoomIds.add(r.roomId));
            } else {
              unavailableRoomIds.add(b.roomId);
            }
          }
        });

        const available = roomsData.rooms?.filter(
          (r: any) => !unavailableRoomIds.has(r.id)
        ) || [];

        setAvailableRooms(available);
        setStats({
          totalRooms: available.length,
          totalBookings: bookingsData.bookings?.length || 0,
          checkInsToday,
          checkOutsToday,
        });
        setAllBookings(bookingsData.bookings || []);
        setRecentBookings(bookingsData.bookings?.slice(0, 8) || []);

        const ordersRes = await fetch(`/api/service-orders?hotelId=${hotelId}`);
        const ordersData = await ordersRes.json();
        setServiceOrders(ordersData.orders || []);
      }
    } catch (error) {
      showToast("Data load nahi ho saka!", "error");
    }
  };

  // Pending bill for a booking
  const getPendingBill = (bookingId: string) => {
    return serviceOrders
      .filter(o => o.bookingId === bookingId && o.paymentStatus === "UNPAID")
      .reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  };

  const getOrdersCount = (bookingId: string) => {
    return serviceOrders.filter(o => o.bookingId === bookingId).length;
  };

  const handleMarkPaid = async (bookingId: string) => {
    const pendingOrders = serviceOrders.filter(o => o.bookingId === bookingId && o.paymentStatus === "UNPAID");
    if (pendingOrders.length === 0) { showToast("Koi pending bill nahi hai!", "warning"); return; }
    if (!confirm(`${pendingOrders.length} order(s) ka bill mark paid karna hai?`)) return;
    try {
      await Promise.all(
        pendingOrders.map(o =>
          fetch("/api/service-orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: o.id, paymentStatus: "PAID" }),
          })
        )
      );
      showToast(`✅ ${pendingOrders.length} bill(s) paid! Total: ₹${pendingOrders.reduce((s, o) => s + o.finalAmount, 0)}`, "success");
      fetchStats();
    } catch { showToast("Bill clear nahi ho saka!", "error"); }
    setOpenActionId(null);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    // Block checkout if pending bill (only in checkout tab)
    if (newStatus === "CHECKED_OUT" && activeFilter === "checkout") {
      const pending = getPendingBill(bookingId);
      if (pending > 0) {
        showToast(`❌ Pehle bill clear karo! Pending: ₹${pending}`, "error");
        setOpenActionId(null);
        return;
      }
    }
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });
      if (res.ok) {
        showToast(`Status "${newStatus}" ho gaya! ✅`, "success");
        fetchStats();
      } else {
        showToast("Status update nahi ho saka!", "error");
      }
    } catch {
      showToast("Kuch galat hua!", "error");
    }
    setOpenActionId(null);
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

  const groupedAvailableRooms = availableRooms.reduce((acc: any, room: any) => {
    if (!acc[room.type]) acc[room.type] = [];
    acc[room.type].push(room);
    return acc;
  }, {});

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    CHECKED_IN: "bg-blue-100 text-blue-700",
    CHECKED_OUT: "bg-gray-100 text-gray-600",
    PENDING: "bg-yellow-100 text-yellow-700",
    UPGRADED: "bg-purple-100 text-purple-700",
  };

  const sourceLabel: Record<string, string> = {
    WALK_IN: "🚶 Walk-in",
    BOOKING_COM: "🌐 Booking.com",
    MAKEMYTRIP: "✈️ MakeMyTrip",
    GOOGLE_HOTEL_CENTRE: "🔍 GHC",
    EXPEDIA: "🌍 Expedia",
    AGODA: "🏨 Agoda",
    PHONE: "📞 Phone",
    OTHER: "📋 Other",
  };

  const paymentModeLabel: Record<string, string> = {
    CASH: "💵 Cash", CARD: "💳 Card", UPI: "📱 UPI",
    BANK_TRANSFER: "🏦 Bank", ONLINE: "🌐 Online",
    PARTIAL_CASH: "💵 Partial", PARTIAL_CARD: "💳 Partial",
    PARTIAL_UPI: "📱 Partial", CHECKOUT_PAYMENT: "🏨 Checkout",
  };

  const actionOptions = [
    { value: "CHECKED_IN", label: "✅ Check-in", color: "text-blue-600" },
    { value: "CHECKED_OUT", label: "🚪 Check-out", color: "text-orange-600" },
    { value: "CANCELLED", label: "❌ Cancel", color: "text-red-600" },
    { value: "UPGRADED", label: "⬆️ Upgrade", color: "text-purple-600" },
  ];

  // Booking Table Component (reusable)
  const BookingTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px]">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Booking ID</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Guest Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rooms & Guests</th>
            <th className={`text-left px-4 py-3 text-xs font-semibold uppercase ${activeFilter === "checkin" ? "text-green-600" : "text-gray-500"}`}>Check-in</th>
            <th className={`text-left px-4 py-3 text-xs font-semibold uppercase ${activeFilter === "checkout" ? "text-red-500" : "text-gray-500"}`}>Check-out</th>
           <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
            {activeFilter === "checkout" && (
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Room Service</th>
            )}
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Source</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filteredBookings.map((booking) => {
            const isCheckInToday = new Date(booking.checkIn).toDateString() === today;
            const isCheckOutToday = new Date(booking.checkOut).toDateString() === today;
            const paymentPaid = booking.paymentAmount || 0;
            const totalAmount = parseFloat(booking.amount) || 0;
            const isDue = paymentPaid < totalAmount;

            const roomsList = booking.rooms && booking.rooms.length > 0
              ? booking.rooms
              : [{ roomNumber: booking.roomNumber, roomType: booking.roomType, adults: booking.adults, children: booking.children, infants: booking.infants }];

            return (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 align-top">
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    #{booking.id?.slice(0, 8).toUpperCase()}
                  </span>
                </td>

                <td className="px-4 py-3 align-top">
                  <p className="text-sm font-medium text-gray-900">{booking.guestName}</p>
                  <p className="text-xs text-gray-400">{booking.guestEmail}</p>
                  {booking.guestPhone && <p className="text-xs text-gray-400">📞 {booking.guestPhone}</p>}
                </td>

                {/* Rooms & Guests */}
                <td className="px-4 py-3 align-top">
                  <div className="space-y-1">
                    {roomsList.map((r: any, i: number) => (
                      <div key={i} className="text-xs">
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium text-gray-900">#{r.roomNumber}</span>
                          <span className="text-gray-400">({r.roomType})</span>
                        </span>
                        <span className="text-gray-600 ml-2">
                          {r.adults || 1} Adult{(r.adults || 1) > 1 ? "s" : ""}
                          {(r.children || 0) > 0 ? ` / ${r.children} Child${r.children > 1 ? "ren" : ""}` : ""}
                          {(r.infants || 0) > 0 ? ` / ${r.infants} Infant${r.infants > 1 ? "s" : ""}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>

                <td className={`px-4 py-3 align-top ${activeFilter === "checkin" ? "bg-green-50" : ""}`}>
                  <p className={`text-sm font-medium ${activeFilter === "checkin" ? "text-green-700" : "text-gray-700"}`}>
                    {new Date(booking.checkIn).toLocaleDateString("en-IN")}
                  </p>
                  {isCheckInToday && activeFilter !== "checkin" && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Today</span>
                  )}
                </td>

                <td className={`px-4 py-3 align-top ${activeFilter === "checkout" ? "bg-red-50" : ""}`}>
                  <p className={`text-sm font-medium ${activeFilter === "checkout" ? "text-red-600" : "text-gray-700"}`}>
                    {new Date(booking.checkOut).toLocaleDateString("en-IN")}
                  </p>
                  {isCheckOutToday && activeFilter !== "checkout" && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Today</span>
                  )}
                </td>

                <td className="px-4 py-3 align-top">
                  <p className="text-sm font-semibold text-gray-900">₹{booking.amount}</p>
                </td>

                {/* Room Service Column — sirf checkout tab mein */}
                {activeFilter === "checkout" && (() => {
                  const pendingBill = getPendingBill(booking.id);
                  const totalOrders = getOrdersCount(booking.id);
                  return (
                    <td className="px-4 py-3 align-top">
                      {totalOrders === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : pendingBill > 0 ? (
                        <div>
                          <p className="text-sm font-bold text-red-600">₹{pendingBill}</p>
                          <p className="text-xs text-red-500">Pending</p>
                          <p className="text-xs text-gray-400">{totalOrders} order{totalOrders > 1 ? "s" : ""}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-green-600">✓ Paid</p>
                          <p className="text-xs text-gray-400">{totalOrders} order{totalOrders > 1 ? "s" : ""}</p>
                        </div>
                      )}
                    </td>
                  );
                })()}

                <td className="px-4 py-3 align-top">
                  {isDue ? (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">Due</span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Paid</span>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{paymentModeLabel[booking.paymentMode] || "💵 Cash"}</p>
                </td>

                <td className="px-4 py-3 align-top">
                  <span className="text-xs text-gray-600">{sourceLabel[booking.source] || "🚶 Walk-in"}</span>
                </td>

                <td className="px-4 py-3 align-top">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[booking.status] || "bg-gray-100 text-gray-600"}`}>
                    {booking.status}
                  </span>
                </td>

                <td className="px-4 py-3 relative align-top">
                  {(() => {
                    const pendingBill = activeFilter === "checkout" ? getPendingBill(booking.id) : 0;
                    const showBillAction = activeFilter === "checkout" && pendingBill > 0;
                    const actionOpts: any[] = showBillAction
                      ? [
                          { value: "BILL", label: `💰 Pay Bill (₹${pendingBill})`, color: "text-green-600" },
                          { value: "CHECKED_OUT", label: "🚪 Check-out", color: "text-gray-400", disabled: true },
                        ]
                      : actionOptions;
                    return (
                      <div ref={openActionId === booking.id ? actionRef : null}>
                        <button
                          onClick={() => setOpenActionId(openActionId === booking.id ? null : booking.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showBillAction ? "bg-red-100 hover:bg-red-200 text-red-700" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                        >
                          {showBillAction ? `⚠️ Action (Bill ₹${pendingBill})` : "Action ▾"}
                        </button>
                        {openActionId === booking.id && (
                          <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-52 overflow-hidden">
                            {actionOpts.map((opt) => (
                              <button
                                key={opt.value}
                                disabled={opt.disabled}
                                onClick={() => {
                                  if (opt.disabled) {
                                    showToast(`❌ Pehle bill clear karo! Pending: ₹${pendingBill}`, "error");
                                    return;
                                  }
                                  if (opt.value === "BILL") handleMarkPaid(booking.id);
                                  else handleStatusChange(booking.id, opt.value);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${opt.color} ${booking.status === opt.value ? "bg-gray-50 font-semibold" : ""} ${opt.disabled ? "cursor-not-allowed opacity-50" : ""}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-4">Bookings Dashboard</h2>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div onClick={() => setActiveFilter("all")}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${activeFilter === "all" ? "bg-blue-50 border-blue-300 shadow-sm" : "bg-gray-50 border-gray-100 hover:bg-blue-50 hover:border-blue-200"}`}>
                <div className="text-2xl mb-1">📋</div>
                <div className="text-xl font-bold text-gray-900">{stats.totalBookings}</div>
                <div className="text-gray-500 text-xs">Total Bookings</div>
              </div>
              <div onClick={() => setActiveFilter("checkin")}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${activeFilter === "checkin" ? "bg-green-50 border-green-300 shadow-sm" : "bg-gray-50 border-gray-100 hover:bg-green-50 hover:border-green-200"}`}>
                <div className="text-2xl mb-1">🏨</div>
                <div className="text-xl font-bold text-green-600">{stats.checkInsToday}</div>
                <div className="text-gray-500 text-xs">Today's Check-ins</div>
              </div>
              <div onClick={() => setActiveFilter("checkout")}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${activeFilter === "checkout" ? "bg-red-50 border-red-300 shadow-sm" : "bg-gray-50 border-gray-100 hover:bg-red-50 hover:border-red-200"}`}>
                <div className="text-2xl mb-1">🚪</div>
                <div className="text-xl font-bold text-orange-500">{stats.checkOutsToday}</div>
                <div className="text-gray-500 text-xs">Today's Check-outs</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div onClick={() => setActiveFilter("rooms")}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${activeFilter === "rooms" ? "bg-indigo-50 border-indigo-300 shadow-sm" : "bg-gray-50 border-gray-100 hover:bg-indigo-50 hover:border-indigo-200"}`}>
                <div className="text-2xl mb-1">🛏️</div>
                <div className="text-xl font-bold text-indigo-600">{availableRooms.length}</div>
                <div className="text-gray-500 text-xs">Available Rooms</div>
              </div>
              <div onClick={() => router.push("/dashboard/room-service/checked-in")}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 cursor-pointer hover:bg-yellow-50 hover:border-yellow-200 transition-all">
                <div className="text-2xl mb-1">🍽️</div>
                <div className="text-sm font-bold text-yellow-600">Active</div>
                <div className="text-gray-500 text-xs">Room Service</div>
              </div>
             <div onClick={() => router.push("/dashboard/housekeeping")}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-all">
                <div className="text-2xl mb-1">🧹</div>
                <div className="text-sm font-bold text-teal-600">On Duty</div>
                <div className="text-gray-500 text-xs">Housekeeping</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-2xl mb-1">📦</div>
                <div className="text-sm font-bold text-purple-600">In Stock</div>
                <div className="text-gray-500 text-xs">Inventory</div>
              </div>
            </div>
          </div>

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
              <button onClick={() => router.push("/dashboard/staff")}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors border border-pink-100">
                <span className="text-2xl">👥</span>
                <span className="text-sm font-medium text-pink-700">Staff</span>
              </button>
            </div>
          </div>
        </div>

        {activeFilter === "rooms" ? (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-gray-900">Available Rooms ({availableRooms.length})</h2>
              <button onClick={() => setActiveFilter("recent")}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-medium">
                ← Back
              </button>
            </div>
            {availableRooms.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-5xl mb-3">🛏️</div>
                <p className="font-medium">Koi room available nahi hai</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedAvailableRooms).map(([type, rooms]: any) => (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-gray-700">{type}</span>
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{rooms.length} Available</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {rooms.map((room: any) => (
                        <div key={room.id} className="bg-green-50 border border-green-200 rounded-xl p-3 text-center hover:bg-green-100 transition-colors">
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
                  <button onClick={() => setActiveFilter("recent")}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-medium">
                    ← Back
                  </button>
                )}
                <button onClick={() => router.push("/dashboard/bookings")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium">
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
              <BookingTable />
            )}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}