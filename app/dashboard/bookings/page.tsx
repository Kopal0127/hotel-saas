"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect, useRef } from "react";
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
  const itemsPerPage = 10;
  const [selectedType, setSelectedType] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [showExtraItems, setShowExtraItems] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    roomId: "", guestName: "", guestEmail: "", guestPhone: "",
    checkIn: "", checkOut: "", amount: "",
    notes: "", specialRequests: "",
    paymentMode: "CASH", paymentAmount: "",
    finalPaymentMode: "", finalPaymentAmount: "",
    adults: "1", children: "0", infants: "0",
    source: "WALK_IN",
    extraMattress: "0", extraPillow: "0", extraBedsheet: "0", blanket: "0",
  });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (form.roomId && form.checkIn && form.checkOut) {
      const selectedRoom = rooms.find(r => r.id === form.roomId);
      if (selectedRoom) {
        const nights = Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24));
        if (nights > 0) setForm(prev => ({ ...prev, amount: (selectedRoom.price * nights).toString() }));
      }
    }
  }, [form.roomId, form.checkIn, form.checkOut, rooms]);

  useEffect(() => {
    if (form.finalPaymentMode === "CHECKOUT_PAYMENT" && form.amount && form.paymentAmount) {
      const remaining = parseFloat(form.amount) - parseFloat(form.paymentAmount);
      if (remaining >= 0) setForm(prev => ({ ...prev, finalPaymentAmount: remaining.toString() }));
    }
  }, [form.finalPaymentMode, form.amount, form.paymentAmount]);

  useEffect(() => {
    setSelectedRoomId("");
    setForm(prev => ({ ...prev, roomId: "" }));
  }, [selectedType]);

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

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });
      if (res.ok) {
        showToast(`Status "${newStatus}" ho gaya! ✅`, "success");
        fetchData();
      } else {
        showToast("Status update nahi ho saka!", "error");
      }
    } catch {
      showToast("Kuch galat hua!", "error");
    }
    setOpenActionId(null);
  };

  const roomTypes = [...new Set(rooms.map(r => r.type))];

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
      .map(b => b.roomId);
  };

  const bookedIds = getBookedRoomIds();
  const filteredRoomsByType = selectedType && form.checkIn && form.checkOut
    ? rooms.filter(r => r.type === selectedType && !bookedIds.includes(r.id))
    : selectedType ? rooms.filter(r => r.type === selectedType) : [];

  const validate = () => {
    if (!form.checkIn) { showToast("Check-in date daalo!", "error"); return false; }
    if (!form.checkOut) { showToast("Check-out date daalo!", "error"); return false; }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) { showToast("Check-out, check-in ke baad honi chahiye!", "error"); return false; }
    if (!form.roomId) { showToast("Room select karo!", "error"); return false; }
    if (!form.guestName.trim()) { showToast("Guest naam daalo!", "error"); return false; }
    if (!form.guestEmail.trim()) { showToast("Guest email daalo!", "error"); return false; }
    if (!form.amount || parseFloat(form.amount) <= 0) { showToast("Amount daalo!", "error"); return false; }
    if (!form.paymentAmount || parseFloat(form.paymentAmount) <= 0) { showToast("Payment amount daalo!", "error"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          adults: parseInt(form.adults) || 1,
          children: parseInt(form.children) || 0,
          infants: parseInt(form.infants) || 0,
          source: "WALK_IN",
          guestPhone: form.guestPhone || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Booking ho gayi! ✅", "success");
        setForm({
          roomId: "", guestName: "", guestEmail: "", guestPhone: "",
          checkIn: "", checkOut: "", amount: "",
          notes: "", specialRequests: "",
          paymentMode: "CASH", paymentAmount: "",
          finalPaymentMode: "", finalPaymentAmount: "",
          adults: "1", children: "0", infants: "0", source: "WALK_IN",
          extraMattress: "0", extraPillow: "0", extraBedsheet: "0", blanket: "0",
        });
        setSelectedType(""); setSelectedRoomId("");
        setShowForm(false); setShowFinalPayment(false);
        setShowMoreOptions(false); setShowExtraItems(false);
        fetchData();
      } else {
        showToast(data.error || "Booking nahi ho saki!", "error");
      }
    } catch {
      showToast("Kuch galat hua!", "error");
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) { showToast("Koi booking nahi!", "warning"); return; }
    const csv = [
      ["Booking ID", "Guest Name", "Email", "Phone", "Adults", "Children", "Infants", "Room", "Type", "Check In", "Check Out", "Amount", "Payment", "Source", "Status"],
      ...bookings.map(b => [
        b.id?.slice(0, 8).toUpperCase(),
        b.guestName, b.guestEmail, b.guestPhone || "",
        b.adults || 1, b.children || 0, b.infants || 0,
        `#${b.roomNumber}`, b.roomType,
        new Date(b.checkIn).toLocaleDateString(),
        new Date(b.checkOut).toLocaleDateString(),
        b.amount, b.paymentMode, b.source || "WALK_IN", b.status
      ]),
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bookings.csv"; a.click();
    showToast("CSV download ho gaya! ✅", "success");
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const paymentModeLabel: Record<string, string> = {
    CASH: "💵 Cash", CARD: "💳 Card", UPI: "📱 UPI",
    BANK_TRANSFER: "🏦 Bank", ONLINE: "🌐 Online",
    PARTIAL_CASH: "💵 Partial", PARTIAL_CARD: "💳 Partial",
    PARTIAL_UPI: "📱 Partial", CHECKOUT_PAYMENT: "🏨 Checkout",
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

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    CHECKED_IN: "bg-blue-100 text-blue-700",
    CHECKED_OUT: "bg-gray-100 text-gray-600",
    PENDING: "bg-yellow-100 text-yellow-700",
    UPGRADED: "bg-purple-100 text-purple-700",
  };

  const actionOptions = [
    { value: "CHECKED_IN", label: "✅ Check-in", color: "text-blue-600" },
    { value: "CHECKED_OUT", label: "🚪 Check-out", color: "text-orange-600" },
    { value: "CANCELLED", label: "❌ Cancel", color: "text-red-600" },
    { value: "UPGRADED", label: "⬆️ Upgrade", color: "text-purple-600" },
  ];

  const extraItems = [
    { key: "extraMattress", label: "🛏️ Mattress" },
    { key: "extraPillow", label: "🪆 Pillow" },
    { key: "extraBedsheet", label: "🏳️ Bedsheet" },
    { key: "blanket", label: "🧣 Blanket" },
  ];

  const calculateNights = () => {
    if (form.checkIn && form.checkOut) {
      const nights = Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  const selectedRoomPrice = rooms.find(r => r.id === form.roomId)?.price;
  const remainingAmount = form.amount && form.paymentAmount
    ? parseFloat(form.amount) - parseFloat(form.paymentAmount) : 0;

  const extraSummary = extraItems
    .filter(item => parseInt((form as any)[item.key]) > 0)
    .map(item => `${(form as any)[item.key]} ${item.label}`)
    .join(", ");

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
    { value: "CHECKOUT_PAYMENT", label: "🏨 Checkout Payment (Auto)" },
    { value: "CASH", label: "💵 Cash" },
    { value: "CARD", label: "💳 Card" },
    { value: "UPI", label: "📱 UPI" },
    { value: "BANK_TRANSFER", label: "🏦 Bank Transfer" },
    { value: "ONLINE", label: "🌐 Online" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3 md:gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-full mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Booking Management</h2>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">📥 CSV</button>
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">+ Booking</button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Naya Booking Add Karo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Row 1 — Date, Room Type, Room No */}
              <div className="md:col-span-3">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Check-in → Check-out / Room Type / Room Number
                  {form.checkIn && form.checkOut && (
                    <span className="ml-2 text-xs text-blue-500 font-normal">{calculateNights()} night{calculateNights() > 1 ? "s" : ""}</span>
                  )}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <DatePicker
                      selectsRange
                      startDate={form.checkIn ? new Date(form.checkIn) : null}
                      endDate={form.checkOut ? new Date(form.checkOut) : null}
                      onChange={(dates: [Date | null, Date | null]) => {
                        const [start, end] = dates;
                        setForm({ ...form, checkIn: start ? start.toISOString().split("T")[0] : "", checkOut: end ? end.toISOString().split("T")[0] : "" });
                        setSelectedRoomId(""); setSelectedType("");
                      }}
                      minDate={new Date()}
                      placeholderText="Check-in → Check-out"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                      wrapperClassName="w-full"
                      monthsShown={2}
                      dateFormat="dd/MM/yyyy"
                      isClearable
                    />
                    {form.checkIn && form.checkOut && (
                      <p className="text-xs text-blue-600 mt-1">📅 {new Date(form.checkIn).toLocaleDateString("en-IN")} → {new Date(form.checkOut).toLocaleDateString("en-IN")}</p>
                    )}
                  </div>
                  <div>
                    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
                      disabled={!form.checkIn || !form.checkOut}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100">
                      <option value="">-- Room Type chuno --</option>
                      {roomTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)}
                      disabled={!selectedType || filteredRoomsByType.length === 0}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100">
                      <option value="">-- Room Number chuno --</option>
                      {filteredRoomsByType.map(room => (
                        <option key={room.id} value={room.id}>Room #{room.number} — ₹{room.price}/night</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2 — Guest Name, Email, Phone */}
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Guest Phone</label>
                <input type="tel" placeholder="+91 9999999999" value={form.guestPhone}
                  onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>

              {/* Row 3 — Adults, Children, Infants, Extra Beds (4 columns) */}
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Adults</label>
                  <input type="number" min="1" value={form.adults}
                    onChange={(e) => setForm({ ...form, adults: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Children</label>
                  <input type="number" min="0" value={form.children}
                    onChange={(e) => setForm({ ...form, children: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Infants</label>
                  <input type="number" min="0" value={form.infants}
                    onChange={(e) => setForm({ ...form, infants: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Extra Beds</label>
                  <button type="button"
                    onClick={() => setShowExtraItems(!showExtraItems)}
                    className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                    <span className="truncate">{extraSummary || "Select ▾"}</span>
                    <span className="ml-2">{showExtraItems ? "▲" : "▾"}</span>
                  </button>
                  {showExtraItems && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
                      {extraItems.map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <span className="text-sm text-gray-700">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <button type="button"
                              onClick={() => setForm(prev => ({ ...prev, [item.key]: Math.max(0, (parseInt((prev as any)[item.key]) || 0) - 1).toString() }))}
                              className="w-7 h-7 bg-red-100 text-red-600 rounded-full font-bold hover:bg-red-200 flex items-center justify-center text-sm">−</button>
                            <span className="text-sm font-semibold text-gray-900 w-6 text-center">{(form as any)[item.key] || "0"}</span>
                            <button type="button"
                              onClick={() => setForm(prev => ({ ...prev, [item.key]: ((parseInt((prev as any)[item.key]) || 0) + 1).toString() }))}
                              className="w-7 h-7 bg-green-100 text-green-600 rounded-full font-bold hover:bg-green-200 flex items-center justify-center text-sm">+</button>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => setShowExtraItems(false)}
                        className="w-full mt-2 text-xs text-center text-blue-600 hover:underline">Done ✓</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4 — Amount, Payment Mode, Payment Amount */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Total Amount (₹)
                  {calculateNights() > 0 && form.roomId && (
                    <span className="ml-2 text-xs text-blue-500">{calculateNights()} nights × ₹{selectedRoomPrice}</span>
                  )}
                </label>
                <input type="number" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-blue-50" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Mode</label>
                <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                  {firstPaymentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Amount (₹)</label>
                <input type="number" placeholder="e.g. 2500" value={form.paymentAmount}
                  onChange={(e) => setForm({ ...form, paymentAmount: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                {form.paymentMode.startsWith("PARTIAL") && remainingAmount > 0 && (
                  <p className="text-xs text-orange-500 mt-1">⚠️ Remaining: ₹{remainingAmount}</p>
                )}
              </div>

              <div className="md:col-span-3">
                <button type="button" onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {showMoreOptions ? "▲ Less Options" : "▼ More Options"}
                </button>
              </div>

              {showMoreOptions && (
                <>
                  {!showFinalPayment ? (
                    <div className="md:col-span-3">
                      <button type="button" onClick={() => { setShowFinalPayment(true); setForm({ ...form, finalPaymentMode: "CHECKOUT_PAYMENT" }); }}
                        className="w-full border-2 border-dashed border-blue-300 text-blue-600 rounded-lg px-4 py-3 text-sm hover:bg-blue-50">
                        + Add Final Payment Mode
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">Final Payment Mode</label>
                          <button type="button" onClick={() => { setShowFinalPayment(false); setForm({ ...form, finalPaymentMode: "", finalPaymentAmount: "" }); }}
                            className="text-xs text-red-400 hover:text-red-600">✕ Remove</button>
                        </div>
                        <select value={form.finalPaymentMode} onChange={(e) => setForm({ ...form, finalPaymentMode: e.target.value })}
                          className="w-full border border-blue-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-blue-50">
                          {finalPaymentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Final Payment Amount (₹)</label>
                        <input type="number" value={form.finalPaymentAmount}
                          readOnly={form.finalPaymentMode === "CHECKOUT_PAYMENT"}
                          onChange={(e) => setForm({ ...form, finalPaymentAmount: e.target.value })}
                          className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none ${form.finalPaymentMode === "CHECKOUT_PAYMENT" ? "bg-green-50 border-green-300 text-green-700" : "border-blue-300 bg-blue-50"}`} />
                      </div>
                      <div></div>
                    </>
                  )}
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Special Requests</label>
                    <input type="text" placeholder="Optional" value={form.specialRequests}
                      onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
                    <textarea placeholder="Internal notes" value={form.notes}
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
              <button onClick={() => { setShowForm(false); setShowFinalPayment(false); setShowMoreOptions(false); setSelectedType(""); setSelectedRoomId(""); setShowExtraItems(false); }}
                className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" placeholder="🔍 Guest naam ya email..."
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white" />
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
            <option value="all">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="UPGRADED">Upgraded</option>
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
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Booking ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Guest Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Guests</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Room</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check-in</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check-out</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Source</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedBookings.map((booking) => {
                    const paymentPaid = booking.paymentAmount || 0;
                    const isDue = paymentPaid < booking.amount;
                    const today = new Date().toDateString();
                    const isCheckInToday = new Date(booking.checkIn).toDateString() === today;
                    const isCheckOutToday = new Date(booking.checkOut).toDateString() === today;
                    const adults = booking.adults || 1;
                    const children = booking.children || 0;
                    const infants = booking.infants || 0;

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
                          {booking.guestPhone && <p className="text-xs text-gray-400">📞 {booking.guestPhone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-700">
                            {adults} Adult{adults > 1 ? "s" : ""}
                            {children > 0 ? ` / ${children} Child${children > 1 ? "ren" : ""}` : ""}
                            {infants > 0 ? ` / ${infants} Infant${infants > 1 ? "s" : ""}` : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">#{booking.roomNumber}</p>
                          <p className="text-xs text-gray-400">{booking.roomType}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{new Date(booking.checkIn).toLocaleDateString("en-IN")}</p>
                          {isCheckInToday && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Today</span>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{new Date(booking.checkOut).toLocaleDateString("en-IN")}</p>
                          {isCheckOutToday && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">Today</span>}
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
                          <p className="text-xs text-gray-400 mt-0.5">{paymentModeLabel[booking.paymentMode] || "💵 Cash"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600">{sourceLabel[booking.source] || "🚶 Walk-in"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[booking.status] || "bg-gray-100 text-gray-600"}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 relative">
                          <div ref={openActionId === booking.id ? actionRef : null}>
                            <button
                              onClick={() => setOpenActionId(openActionId === booking.id ? null : booking.id)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                              Action ▾
                            </button>
                            {openActionId === booking.id && (
                              <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-40 overflow-hidden">
                                {actionOptions.map((opt) => (
                                  <button key={opt.value}
                                    onClick={() => handleStatusChange(booking.id, opt.value)}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${opt.color} ${booking.status === opt.value ? "bg-gray-50 font-semibold" : ""}`}>
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100">← Pehle</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded-lg text-sm border ${page === i + 1 ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
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