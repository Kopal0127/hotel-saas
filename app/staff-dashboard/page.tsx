"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StaffDashboardPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showFinalPayment, setShowFinalPayment] = useState(false);
  const [form, setForm] = useState({
    roomId: "", guestName: "", guestEmail: "",
    checkIn: "", checkOut: "", amount: "",
    notes: "", specialRequests: "",
    paymentMode: "CASH", paymentAmount: "",
    finalPaymentMode: "", finalPaymentAmount: "",
  });

  useEffect(() => {
   const token = localStorage.getItem("staffToken");
    const staffInfo = localStorage.getItem("staff");
    if (!token || !staffInfo) {
      router.push("/staff-login");
      return;
    }
    setStaff(JSON.parse(staffInfo));
    fetchData(token);
  }, []);

  // Auto amount calculate
  useEffect(() => {
    if (form.roomId && form.checkIn && form.checkOut) {
      const selectedRoom = rooms.find(r => r.id === form.roomId);
      if (selectedRoom) {
        const checkIn = new Date(form.checkIn);
        const checkOut = new Date(form.checkOut);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        if (nights > 0) {
          setForm(prev => ({ ...prev, amount: (selectedRoom.price * nights).toString() }));
        }
      }
    }
  }, [form.roomId, form.checkIn, form.checkOut, rooms]);

  // Auto remaining amount
  useEffect(() => {
    if (form.finalPaymentMode === "CHECKOUT_PAYMENT" && form.amount && form.paymentAmount) {
      const remaining = parseFloat(form.amount) - parseFloat(form.paymentAmount);
      if (remaining >= 0) {
        setForm(prev => ({ ...prev, finalPaymentAmount: remaining.toString() }));
      }
    }
  }, [form.finalPaymentMode, form.amount, form.paymentAmount]);

  const fetchData = async (token: string) => {
    try {
      const staffInfo = JSON.parse(localStorage.getItem("staff") || "{}");
      const hotelId = staffInfo.hotelId;

      const [bookingsRes, roomsRes] = await Promise.all([
        fetch(`/api/bookings?hotelId=${hotelId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/rooms?hotelId=${hotelId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const bookingsData = await bookingsRes.json();
      const roomsData = await roomsRes.json();

      setBookings(bookingsData.bookings || []);
      setRooms(roomsData.rooms || []);
    } catch (error) {
      console.error("Data load nahi hua:", error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staff");
    router.push("/staff-login");
  };

  const handleSubmit = async () => {
    if (!form.roomId) { alert("Room select karo!"); return; }
    if (!form.guestName) { alert("Guest naam daalo!"); return; }
    if (!form.guestEmail) { alert("Guest email daalo!"); return; }
    if (!form.checkIn || !form.checkOut) { alert("Dates daalo!"); return; }
    if (!form.amount) { alert("Amount daalo!"); return; }
    if (!form.paymentAmount) { alert("Payment amount daalo!"); return; }

    setFormLoading(true);
    try {
      const token = localStorage.getItem("staff_token");
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Booking ho gayi!");
        setForm({ roomId: "", guestName: "", guestEmail: "", checkIn: "", checkOut: "", amount: "", notes: "", specialRequests: "", paymentMode: "CASH", paymentAmount: "", finalPaymentMode: "", finalPaymentAmount: "" });
        setShowForm(false);
        setShowFinalPayment(false);
        setShowMoreOptions(false);
        fetchData(localStorage.getItem("staff_token")!);
      } else {
        alert(data.error || "Booking nahi ho saki!");
      }
    } catch (error) {
      alert("Kuch galat hua!");
    }
    setFormLoading(false);
  };

  const filteredBookings = bookings.filter((b) =>
    b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED").length;
  const pendingBookings = bookings.filter(b => b.status === "PENDING").length;

  const calculateNights = () => {
    if (form.checkIn && form.checkOut) {
      const nights = Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  const remainingAmount = form.amount && form.paymentAmount
    ? parseFloat(form.amount) - parseFloat(form.paymentAmount)
    : 0;

  const finalPaymentOptions = [
    { value: "CHECKOUT_PAYMENT", label: "🏨 Checkout Payment (Remaining Auto)" },
    { value: "CASH", label: "💵 Cash" },
    { value: "CARD", label: "💳 Card" },
    { value: "UPI", label: "📱 UPI" },
    { value: "BANK_TRANSFER", label: "🏦 Bank Transfer" },
    { value: "ONLINE", label: "🌐 Online" },
  ];

  const firstPaymentOptions = [
    { value: "CASH", label: "💵 Cash" },
    { value: "CARD", label: "💳 Card" },
    { value: "UPI", label: "📱 UPI" },
    { value: "BANK_TRANSFER", label: "🏦 Bank Transfer" },
    { value: "ONLINE", label: "🌐 Online" },
    { value: "PARTIAL_CASH", label: "💵 Partial Cash" },
    { value: "PARTIAL_CARD", label: "💳 Partial Card" },
    { value: "PARTIAL_UPI", label: "📱 Partial UPI" },
    { value: "PARTIAL_BANK_TRANSFER", label: "🏦 Partial Bank Transfer" },
    { value: "PARTIAL_ONLINE", label: "🌐 Partial Online" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
          <p className="text-xs text-gray-400">Staff Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{staff?.name}</p>
            <p className="text-xs text-gray-400">{staff?.employeeId} • {staff?.hotelName}</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Namaste, {staff?.name}! 👋</h2>
          <p className="text-gray-500 text-sm mt-1">{staff?.hotelName} — Staff Dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{confirmedBookings}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-orange-500">{pendingBookings}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-600">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {["bookings", "rooms", "reports"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}>
              {tab === "bookings" ? "📋 Bookings" : tab === "rooms" ? "🛏️ Rooms" : "📊 Reports"}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <input type="text" placeholder="🔍 Guest naam ya email se search karo..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white mr-3" />
              <button onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                + Booking
              </button>
            </div>

            {/* Booking Form */}
            {showForm && (
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Naya Booking Add Karo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Room Select Karo</label>
                    <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                      <option value="">-- Room chuno --</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>Room #{room.number} — {room.type} — ₹{room.price}/night</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Guest Name</label>
                    <input type="text" placeholder="Guest ka naam" value={form.guestName}
                      onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Guest Email</label>
                    <input type="email" placeholder="guest@email.com" value={form.guestEmail}
                      onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Total Amount (₹)
                      {calculateNights() > 0 && form.roomId && (
                        <span className="ml-2 text-xs text-blue-500 font-normal">
                          {calculateNights()} night{calculateNights() > 1 ? "s" : ""} × ₹{rooms.find(r => r.id === form.roomId)?.price}/night
                        </span>
                      )}
                    </label>
                    <input type="number" placeholder="Auto calculate hoga" value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-blue-50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Check In</label>
                    <input type="date" value={form.checkIn}
                      onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Check Out</label>
                    <input type="date" value={form.checkOut}
                      onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Mode</label>
                    <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                      {firstPaymentOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Amount (₹)</label>
                    <input type="number" placeholder="e.g. 2500" value={form.paymentAmount}
                      onChange={(e) => setForm({ ...form, paymentAmount: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                    {form.paymentMode.startsWith("PARTIAL") && form.amount && form.paymentAmount && remainingAmount > 0 && (
                      <p className="text-xs text-orange-500 mt-1">⚠️ Remaining: ₹{remainingAmount} checkout pe lena hoga</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <button onClick={() => setShowMoreOptions(!showMoreOptions)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium py-1">
                      {showMoreOptions ? "▲ Less Options" : "▼ More Options"}
                    </button>
                  </div>

                  {showMoreOptions && (
                    <>
                      {!showFinalPayment ? (
                        <div className="md:col-span-2">
                          <button onClick={() => { setShowFinalPayment(true); setForm({ ...form, finalPaymentMode: "CHECKOUT_PAYMENT" }); }}
                            className="w-full border-2 border-dashed border-blue-300 text-blue-600 rounded-lg px-4 py-3 text-sm hover:bg-blue-50">
                            + Add Final Payment Mode
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-sm font-medium text-gray-700">Final Payment Mode</label>
                              <button onClick={() => { setShowFinalPayment(false); setForm({ ...form, finalPaymentMode: "", finalPaymentAmount: "" }); }}
                                className="text-xs text-red-400 hover:text-red-600">✕ Remove</button>
                            </div>
                            <select value={form.finalPaymentMode} onChange={(e) => setForm({ ...form, finalPaymentMode: e.target.value })}
                              className="w-full border border-blue-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-blue-50">
                              {finalPaymentOptions.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Final Payment Amount (₹)
                              {form.finalPaymentMode === "CHECKOUT_PAYMENT" && (
                                <span className="ml-2 text-xs text-green-500 font-normal">✅ Auto calculated</span>
                              )}
                            </label>
                            <input type="number" placeholder="e.g. 2500" value={form.finalPaymentAmount}
                              readOnly={form.finalPaymentMode === "CHECKOUT_PAYMENT"}
                              onChange={(e) => setForm({ ...form, finalPaymentAmount: e.target.value })}
                              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none ${
                                form.finalPaymentMode === "CHECKOUT_PAYMENT"
                                  ? "bg-green-50 border-green-300 text-green-700 font-medium"
                                  : "border-blue-300 bg-blue-50"
                              }`} />
                          </div>
                        </>
                      )}
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Special Requests</label>
                        <input type="text" placeholder="Koi special request? (Optional)" value={form.specialRequests}
                          onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Notes (Staff ke liye)</label>
                        <textarea placeholder="Internal notes... (Optional)" value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleSubmit} disabled={formLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                    {formLoading ? "Adding..." : "Booking Confirm Karo"}
                  </button>
                  <button onClick={() => { setShowForm(false); setShowFinalPayment(false); setShowMoreOptions(false); }}
                    className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-200">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Bookings Table */}
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
                <div className="text-5xl mb-4">📭</div>
                <p>Koi booking nahi mili</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Guest</th>
                      <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Room</th>
                      <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Check In</th>
                      <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Check Out</th>
                      <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Amount</th>
                      <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="text-xs font-medium text-gray-900">{booking.guestName}</p>
                          <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600">#{booking.roomNumber}</td>
                        <td className="px-4 py-4 text-xs text-gray-600">{new Date(booking.checkIn).toLocaleDateString()}</td>
                        <td className="px-4 py-4 text-xs text-gray-600">{new Date(booking.checkOut).toLocaleDateString()}</td>
                        <td className="px-4 py-4 text-xs font-medium text-gray-900">₹{booking.amount}</td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            booking.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                            booking.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                            booking.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>{booking.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === "rooms" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms.length === 0 ? (
              <div className="md:col-span-3 bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
                <div className="text-5xl mb-4">🛏️</div>
                <p>Koi room nahi mila</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Room #{room.number}</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{room.type}</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{room.price}<span className="text-sm font-normal text-gray-400">/night</span></p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">📊 Booking Summary</h3>
              <div className="space-y-3">
                {[
                  { label: "Total Bookings", value: bookings.length, color: "text-gray-900" },
                  { label: "Confirmed", value: confirmedBookings, color: "text-green-600" },
                  { label: "Pending", value: pendingBookings, color: "text-orange-500" },
                  { label: "Cancelled", value: bookings.filter(b => b.status === "CANCELLED").length, color: "text-red-500" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className={`font-medium ${item.color}`}>{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                  <span className="font-bold text-purple-600">₹{totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">👤 My Info</h3>
              <div className="space-y-3">
                {[
                  { label: "Name", value: staff?.name },
                  { label: "Employee ID", value: staff?.employeeId || "—" },
                  { label: "Hotel", value: staff?.hotelName },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Role</span>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">STAFF</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}