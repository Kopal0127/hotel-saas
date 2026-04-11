"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/Toast";
import { useToast } from "@/components/useToast";
import { useAuth } from "@/components/useAuth";

export default function BookingsPage() {
  useAuth();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFinalPayment, setShowFinalPayment] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedType, setSelectedType] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [form, setForm] = useState({
    roomId: "", guestName: "", guestEmail: "",
    checkIn: "", checkOut: "", amount: "",
    notes: "", specialRequests: "",
    paymentMode: "CASH", paymentAmount: "",
    finalPaymentMode: "", finalPaymentAmount: "",
  });

  useEffect(() => { fetchData(); }, []);

  // ✅ Auto amount calculate
  useEffect(() => {
    if (form.roomId && form.checkIn && form.checkOut) {
      const selectedRoom = rooms.find(r => r.id === form.roomId);
      if (selectedRoom) {
        const nights = Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24));
        if (nights > 0) {
          setForm(prev => ({ ...prev, amount: (selectedRoom.price * nights).toString() }));
        }
      }
    }
  }, [form.roomId, form.checkIn, form.checkOut, rooms]);

  // ✅ Auto remaining amount
  useEffect(() => {
    if (form.finalPaymentMode === "CHECKOUT_PAYMENT" && form.amount && form.paymentAmount) {
      const remaining = parseFloat(form.amount) - parseFloat(form.paymentAmount);
      if (remaining >= 0) setForm(prev => ({ ...prev, finalPaymentAmount: remaining.toString() }));
    }
  }, [form.finalPaymentMode, form.amount, form.paymentAmount]);

  // ✅ Jab type change ho toh roomId reset karo
  useEffect(() => {
    setSelectedRoomId("");
    setForm(prev => ({ ...prev, roomId: "" }));
  }, [selectedType]);

  // ✅ Jab room select ho toh form mein roomId set karo
  useEffect(() => {
    setForm(prev => ({ ...prev, roomId: selectedRoomId }));
  }, [selectedRoomId]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/hotels");
      const data = await res.json();
      if (data.hotels && data.hotels.length > 0) {
        const hId = data.hotels[0].id;
        const roomsRes = await fetch(`/api/rooms?hotelId=${hId}`);
        const roomsData = await roomsRes.json();
        setRooms(roomsData.rooms || []);
        const bookingsRes = await fetch(`/api/bookings?hotelId=${hId}`);
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
      }
    } catch (error) {
      showToast("Data load nahi ho saka!", "error");
    }
  };

  // ✅ Unique room types
  const roomTypes = [...new Set(rooms.map(r => r.type))];

  // ✅ Booked room IDs check — dates ke hisaab se
  const getBookedRoomIds = () => {
    if (!form.checkIn || !form.checkOut) return [];
    const checkIn = new Date(form.checkIn);
    const checkOut = new Date(form.checkOut);
    return bookings
      .filter(b =>
        (b.status === "CONFIRMED" || b.status === "PENDING") &&
        new Date(b.checkIn) < checkOut &&
        new Date(b.checkOut) > checkIn
      )
      .map(b => b.roomId || b.room?.id || b.id);
  };

  // ✅ Available rooms — booked rooms hatao
  const filteredRoomsByType = selectedType && form.checkIn && form.checkOut
    ? rooms.filter(r => r.type === selectedType && !getBookedRoomIds().includes(r.id))
    : selectedType
    ? rooms.filter(r => r.type === selectedType)
    : [];

  const validate = () => {
    if (!form.checkIn) { showToast("Check-in date daalna zaroori hai!", "error"); return false; }
    if (!form.checkOut) { showToast("Check-out date daalna zaroori hai!", "error"); return false; }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) { showToast("Check-out date, check-in ke baad honi chahiye!", "error"); return false; }
    if (!form.roomId) { showToast("Room select karna zaroori hai!", "error"); return false; }
    if (!form.guestName.trim()) { showToast("Guest ka naam daalna zaroori hai!", "error"); return false; }
    if (!form.guestEmail.trim()) { showToast("Guest ka email daalna zaroori hai!", "error"); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.guestEmail)) { showToast("Sahi email daalo!", "error"); return false; }
    if (!form.amount || parseFloat(form.amount) <= 0) { showToast("Amount 0 se zyada honi chahiye!", "error"); return false; }
    if (!form.paymentAmount || parseFloat(form.paymentAmount) <= 0) { showToast("Payment amount daalna zaroori hai!", "error"); return false; }
    const isPartial = form.paymentMode.startsWith("PARTIAL");
    if (isPartial && !showFinalPayment) { showToast("Partial payment select kiya hai — Final Payment Mode bhi add karo!", "warning"); return false; }
    if (isPartial && showFinalPayment && (!form.finalPaymentAmount || parseFloat(form.finalPaymentAmount) <= 0)) { showToast("Final payment amount daalna zaroori hai!", "error"); return false; }
    if (showFinalPayment && !form.finalPaymentMode) { showToast("Final Payment Mode select karo!", "error"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Booking successfully ho gayi! ✅", "success");
        setForm({ roomId: "", guestName: "", guestEmail: "", checkIn: "", checkOut: "", amount: "", notes: "", specialRequests: "", paymentMode: "CASH", paymentAmount: "", finalPaymentMode: "", finalPaymentAmount: "" });
        setSelectedType("");
        setSelectedRoomId("");
        setShowForm(false);
        setShowFinalPayment(false);
        setShowMoreOptions(false);
        fetchData();
      } else {
        showToast(data.error || "Booking nahi ho saki!", "error");
      }
    } catch (error) {
      showToast("Kuch galat hua, dobara try karo!", "error");
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) { showToast("Export karne ke liye koi booking nahi hai!", "warning"); return; }
    const csv = [
      ["Guest Name", "Guest Email", "Room", "Check In", "Check Out", "Total Amount", "Payment Mode", "Payment Amount", "Final Payment Mode", "Final Payment Amount", "Special Requests", "Notes", "Status"],
      ...bookings.map((b) => [b.guestName, b.guestEmail, `#${b.roomNumber}`,
        new Date(b.checkIn).toLocaleDateString(), new Date(b.checkOut).toLocaleDateString(),
        b.amount, b.paymentMode || "CASH", b.paymentAmount || "",
        b.finalPaymentMode || "No", b.finalPaymentAmount || "",
        b.specialRequests || "No Requests", b.notes || "No", b.status]),
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bookings.csv"; a.click();
    showToast("CSV download ho gaya! ✅", "success");
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const paymentModeLabel: Record<string, string> = {
    CASH: "💵 Cash", CARD: "💳 Card", UPI: "📱 UPI",
    BANK_TRANSFER: "🏦 Bank Transfer", ONLINE: "🌐 Online",
    PARTIAL_CASH: "💵 Partial Cash", PARTIAL_CARD: "💳 Partial Card",
    PARTIAL_UPI: "📱 Partial UPI", PARTIAL_BANK_TRANSFER: "🏦 Partial Bank Transfer",
    PARTIAL_ONLINE: "🌐 Partial Online", CHECKOUT_PAYMENT: "🏨 Checkout Payment",
  };

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

  const finalPaymentOptions = [
    { value: "CHECKOUT_PAYMENT", label: "🏨 Checkout Payment (Remaining Auto)" },
    { value: "CASH", label: "💵 Cash" },
    { value: "CARD", label: "💳 Card" },
    { value: "UPI", label: "📱 UPI" },
    { value: "BANK_TRANSFER", label: "🏦 Bank Transfer" },
    { value: "ONLINE", label: "🌐 Online" },
  ];

  const remainingAmount = form.amount && form.paymentAmount
    ? parseFloat(form.amount) - parseFloat(form.paymentAmount) : 0;

  const calculateNights = () => {
    if (form.checkIn && form.checkOut) {
      const nights = Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  const selectedRoomPrice = rooms.find(r => r.id === form.roomId)?.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3 md:gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Booking Management</h2>
          <div className="flex gap-2 md:gap-3">
            <button onClick={handleExportCSV}
              className="bg-green-600 text-white px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm hover:bg-green-700">
              📥 CSV
            </button>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm hover:bg-blue-700">
              + Booking
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Naya Booking Add Karo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* ✅ Check In/Out PEHLE */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Check In</label>
                <input type="date" value={form.checkIn}
                  onChange={(e) => {
                    setForm({ ...form, checkIn: e.target.value });
                    setSelectedRoomId("");
                    setSelectedType("");
                  }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Check Out</label>
                <input type="date" value={form.checkOut}
                  onChange={(e) => {
                    setForm({ ...form, checkOut: e.target.value });
                    setSelectedRoomId("");
                    setSelectedType("");
                  }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>

              {/* ✅ Room Type Dropdown */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Room Type
                  {!form.checkIn || !form.checkOut
                    ? <span className="ml-2 text-xs text-gray-400 font-normal">Pehle dates select karo</span>
                    : null}
                </label>
                <select value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  disabled={!form.checkIn || !form.checkOut}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400">
                  <option value="">-- Room Type chuno --</option>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* ✅ Room Number Dropdown */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Room Number
                  {selectedType && form.checkIn && form.checkOut && filteredRoomsByType.length === 0
                    ? <span className="ml-2 text-xs text-red-500 font-normal">❌ Koi room available nahi!</span>
                    : null}
                </label>
                <select value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  disabled={!selectedType || filteredRoomsByType.length === 0}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400">
                  <option value="">-- Room Number chuno --</option>
                  {filteredRoomsByType.map((room) => (
                    <option key={room.id} value={room.id}>Room #{room.number} — ₹{room.price}/night</option>
                  ))}
                </select>
                {!selectedType && <p className="text-xs text-gray-400 mt-1">Pehle Room Type chuno</p>}
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
                      {calculateNights()} night{calculateNights() > 1 ? "s" : ""} × ₹{selectedRoomPrice}/night
                    </span>
                  )}
                </label>
                <input type="number" placeholder="Auto calculate hoga" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-blue-50" />
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
                          className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 ${
                            form.finalPaymentMode === "CHECKOUT_PAYMENT"
                              ? "bg-green-50 border-green-300 text-green-700 font-medium"
                              : "border-blue-300 bg-blue-50"
                          }`} />
                        {form.finalPaymentMode === "CHECKOUT_PAYMENT" && form.finalPaymentAmount && (
                          <p className="text-xs text-green-600 mt-1">✅ ₹{form.finalPaymentAmount} checkout pe collect karna hai</p>
                        )}
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
              <button onClick={handleSubmit} disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Adding..." : "Booking Confirm Karo"}
              </button>
              <button onClick={() => { setShowForm(false); setShowFinalPayment(false); setShowMoreOptions(false); setSelectedType(""); setSelectedRoomId(""); }}
                className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" placeholder="🔍 Guest naam ya email se search karo..."
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white" />
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p>Koi booking nahi mili</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mb-4">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Guest</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Room</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Check In</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Check Out</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Amount</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Payment</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Final Payment</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Special Requests</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Notes</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="text-xs font-medium text-gray-900">{booking.guestName}</p>
                        <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-600">
                        <p>#{booking.roomNumber}</p>
                        <p className="text-gray-400">{booking.roomType}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-600">{new Date(booking.checkIn).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-xs text-gray-600">{new Date(booking.checkOut).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-xs font-medium text-gray-900">₹{booking.amount}</td>
                      <td className="px-4 py-4 text-xs text-gray-600">
                        <span>{paymentModeLabel[booking.paymentMode] || "💵 Cash"}</span>
                        {booking.paymentAmount && <span className="text-green-600 block">₹{booking.paymentAmount}</span>}
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {booking.finalPaymentMode ? (
                          <span className="text-blue-600">
                            {paymentModeLabel[booking.finalPaymentMode]}
                            {booking.finalPaymentAmount && <span className="text-orange-500 block">₹{booking.finalPaymentAmount} pending</span>}
                          </span>
                        ) : <span className="text-gray-400">No</span>}
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {booking.specialRequests ? <span className="text-blue-600">📝 {booking.specialRequests}</span> : <span className="text-gray-400">No Requests</span>}
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {booking.notes ? <span className="text-gray-700">📋 {booking.notes}</span> : <span className="text-gray-400">No</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{booking.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                  className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100">← Pehle</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded-lg text-sm border ${page === i + 1 ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                  className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100">Agle →</button>
              </div>
            )}
          </>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}