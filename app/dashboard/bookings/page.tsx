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
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFinalPayment, setShowFinalPayment] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [openExtraIdx, setOpenExtraIdx] = useState<number | null>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  const [bookingRooms, setBookingRooms] = useState<any[]>([
    { selectedType: "", roomId: "", adults: "1", children: "0", infants: "0",
      extraMattress: "0", extraPillow: "0", extraBedsheet: "0", blanket: "0" }
  ]);

  const [form, setForm] = useState({
    guestName: "", guestEmail: "", guestPhone: "", countryCode: "+91",
    checkIn: "", checkOut: "", amount: "",
    notes: "", specialRequests: "",
    paymentMode: "CASH", paymentAmount: "",
    finalPaymentMode: "", finalPaymentAmount: "",
    source: "WALK_IN",
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
    if (form.checkIn && form.checkOut) {
      const nights = Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24));
      if (nights > 0) {
        const total = bookingRooms.reduce((sum, br) => {
          const r = rooms.find(rm => rm.id === br.roomId);
          return sum + (r ? r.price * nights : 0);
        }, 0);
        if (total > 0) setForm(prev => ({ ...prev, amount: total.toString() }));
      }
    }
  }, [bookingRooms, form.checkIn, form.checkOut, rooms]);

  useEffect(() => {
    if (form.finalPaymentMode === "CHECKOUT_PAYMENT" && form.amount && form.paymentAmount) {
      const remaining = parseFloat(form.amount) - parseFloat(form.paymentAmount);
      if (remaining >= 0) setForm(prev => ({ ...prev, finalPaymentAmount: remaining.toString() }));
    }
  }, [form.finalPaymentMode, form.amount, form.paymentAmount]);

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
        const ordersRes = await fetch(`/api/service-orders?hotelId=${hId}`);
        const ordersData = await ordersRes.json();
        setServiceOrders(ordersData.orders || []);
      }
    } catch (error) {
      showToast("Data load nahi ho saka!", "error");
    }
  };

  // Get pending bill for a booking
  const getPendingBill = (bookingId: string) => {
    return serviceOrders
      .filter(o => o.bookingId === bookingId && o.paymentStatus === "UNPAID")
      .reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  };

  // Get total orders count
  const getOrdersCount = (bookingId: string) => {
    return serviceOrders.filter(o => o.bookingId === bookingId).length;
  };

  // Mark bill as paid
  const handleMarkPaid = async (bookingId: string) => {
    const pendingOrders = serviceOrders.filter(o => o.bookingId === bookingId && o.paymentStatus === "UNPAID");
    if (pendingOrders.length === 0) {
      showToast("Koi pending bill nahi hai!", "warning");
      return;
    }
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
      fetchData();
    } catch {
      showToast("Bill clear nahi ho saka!", "error");
    }
    setOpenActionId(null);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    // Block checkout if pending bill
    if (newStatus === "CHECKED_OUT") {
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

  const getUnavailableRoomIds = () => {
    if (!form.checkIn || !form.checkOut) return [];
    const checkIn = new Date(form.checkIn);
    const checkOut = new Date(form.checkOut);
    const bookedIds = bookings
      .filter(b =>
        (b.status === "CONFIRMED" || b.status === "PENDING" || b.status === "CHECKED_IN") &&
        new Date(b.checkIn) < checkOut &&
        new Date(b.checkOut) > checkIn
      )
      .map(b => b.roomId);
    const alreadySelected = bookingRooms.map(br => br.roomId).filter(Boolean);
    return [...bookedIds, ...alreadySelected];
  };

  const getAvailableRoomsForType = (type: string, currentIdx: number) => {
    if (!type || !form.checkIn || !form.checkOut) return [];
    const unavailable = getUnavailableRoomIds();
    const currentRoomId = bookingRooms[currentIdx]?.roomId;
    return rooms.filter(r =>
      r.type === type &&
      (!unavailable.includes(r.id) || r.id === currentRoomId)
    );
  };

  const updateRoom = (idx: number, field: string, value: string) => {
    setBookingRooms(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "selectedType") {
        updated[idx].roomId = "";
      }
      return updated;
    });
  };

  const addRoom = () => {
    setBookingRooms(prev => [...prev, {
      selectedType: "", roomId: "", adults: "1", children: "0", infants: "0",
      extraMattress: "0", extraPillow: "0", extraBedsheet: "0", blanket: "0"
    }]);
  };

  const removeRoom = (idx: number) => {
    if (bookingRooms.length === 1) {
      showToast("Kam se kam 1 room chahiye!", "warning");
      return;
    }
    setBookingRooms(prev => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    if (!form.checkIn) { showToast("Check-in date daalo!", "error"); return false; }
    if (!form.checkOut) { showToast("Check-out date daalo!", "error"); return false; }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) { showToast("Check-out, check-in ke baad honi chahiye!", "error"); return false; }
    for (let i = 0; i < bookingRooms.length; i++) {
      if (!bookingRooms[i].roomId) {
        showToast(`Room ${i + 1} select karo!`, "error");
        return false;
      }
    }
    if (!form.guestName.trim()) { showToast("Guest naam daalo!", "error"); return false; }
    if (!form.guestEmail.trim()) { showToast("Guest email daalo!", "error"); return false; }
    if (form.guestPhone && form.guestPhone.length !== 10) { showToast("Phone number 10 digits ka hona chahiye!", "error"); return false; }
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
          rooms: bookingRooms.map(br => ({
            roomId: br.roomId,
            adults: parseInt(br.adults) || 1,
            children: parseInt(br.children) || 0,
            infants: parseInt(br.infants) || 0,
            extraMattress: parseInt(br.extraMattress) || 0,
            extraPillow: parseInt(br.extraPillow) || 0,
            extraBedsheet: parseInt(br.extraBedsheet) || 0,
            blanket: parseInt(br.blanket) || 0,
          })),
          source: "WALK_IN",
          guestPhone: form.guestPhone ? `${form.countryCode || "+91"} ${form.guestPhone}` : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Booking ho gayi! ✅", "success");
        setForm({
          guestName: "", guestEmail: "", guestPhone: "", countryCode: "+91",
          checkIn: "", checkOut: "", amount: "",
          notes: "", specialRequests: "",
          paymentMode: "CASH", paymentAmount: "",
          finalPaymentMode: "", finalPaymentAmount: "",
          source: "WALK_IN",
        });
        setBookingRooms([{
          selectedType: "", roomId: "", adults: "1", children: "0", infants: "0",
          extraMattress: "0", extraPillow: "0", extraBedsheet: "0", blanket: "0"
        }]);
        setShowForm(false); setShowFinalPayment(false); setShowMoreOptions(false);
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
      ["Booking ID", "Guest Name", "Email", "Phone", "Rooms", "Check In", "Check Out", "Amount", "Room Service Pending", "Payment", "Source", "Status"],
      ...bookings.map(b => [
        b.id?.slice(0, 8).toUpperCase(),
        b.guestName, b.guestEmail, b.guestPhone || "",
        (b.rooms && b.rooms.length > 0 ? b.rooms.map((r: any) => `#${r.roomNumber}`).join(" | ") : `#${b.roomNumber}`),
        new Date(b.checkIn).toLocaleDateString(),
        new Date(b.checkOut).toLocaleDateString(),
        b.amount, getPendingBill(b.id), b.paymentMode, b.source || "WALK_IN", b.status
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

  const remainingAmount = form.amount && form.paymentAmount
    ? parseFloat(form.amount) - parseFloat(form.paymentAmount) : 0;

  const getExtraSummary = (br: any) => {
    return extraItems
      .filter(item => parseInt(br[item.key]) > 0)
      .map(item => `${br[item.key]} ${item.label.replace(/^.\s/, "")}`)
      .join(", ");
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

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Check-in → Check-out Date
                {form.checkIn && form.checkOut && (
                  <span className="ml-2 text-xs text-blue-500 font-normal">{calculateNights()} night{calculateNights() > 1 ? "s" : ""}</span>
                )}
              </label>
              <DatePicker
                selectsRange
                startDate={form.checkIn ? new Date(form.checkIn) : null}
                endDate={form.checkOut ? new Date(form.checkOut) : null}
                onChange={(dates: [Date | null, Date | null]) => {
                  const [start, end] = dates;
                  setForm({ ...form, checkIn: start ? start.toISOString().split("T")[0] : "", checkOut: end ? end.toISOString().split("T")[0] : "" });
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

            {bookingRooms.map((br, idx) => (
              <div key={idx} className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-blue-700">🛏️ Room {idx + 1}</h4>
                  {bookingRooms.length > 1 && (
                    <button type="button" onClick={() => removeRoom(idx)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium">✕ Remove</button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Room Type</label>
                    <select value={br.selectedType}
                      onChange={(e) => updateRoom(idx, "selectedType", e.target.value)}
                      disabled={!form.checkIn || !form.checkOut}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100 bg-white">
                      <option value="">-- Room Type chuno --</option>
                      {roomTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Room Number</label>
                    <select value={br.roomId}
                      onChange={(e) => updateRoom(idx, "roomId", e.target.value)}
                      disabled={!br.selectedType || getAvailableRoomsForType(br.selectedType, idx).length === 0}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100 bg-white">
                      <option value="">-- Room Number chuno --</option>
                      {getAvailableRoomsForType(br.selectedType, idx).map(room => (
                        <option key={room.id} value={room.id}>Room #{room.number} — ₹{room.price}/night</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Adults</label>
                    <input type="number" min="1" value={br.adults}
                      onChange={(e) => updateRoom(idx, "adults", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Children</label>
                    <input type="number" min="0" value={br.children}
                      onChange={(e) => updateRoom(idx, "children", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Infants</label>
                    <input type="number" min="0" value={br.infants}
                      onChange={(e) => updateRoom(idx, "infants", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white" />
                  </div>
                  <div className="relative">
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Extra Beds</label>
                    <button type="button"
                      onClick={() => setOpenExtraIdx(openExtraIdx === idx ? null : idx)}
                      className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                      <span className="truncate">{getExtraSummary(br) || "Select ▾"}</span>
                      <span className="ml-2">{openExtraIdx === idx ? "▲" : "▾"}</span>
                    </button>
                    {openExtraIdx === idx && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
                        {extraItems.map((item) => (
                          <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <span className="text-sm text-gray-700">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <button type="button"
                                onClick={() => updateRoom(idx, item.key, Math.max(0, (parseInt(br[item.key]) || 0) - 1).toString())}
                                className="w-7 h-7 bg-red-100 text-red-600 rounded-full font-bold hover:bg-red-200 flex items-center justify-center text-sm">−</button>
                              <span className="text-sm font-semibold text-gray-900 w-6 text-center">{br[item.key] || "0"}</span>
                              <button type="button"
                                onClick={() => updateRoom(idx, item.key, ((parseInt(br[item.key]) || 0) + 1).toString())}
                                className="w-7 h-7 bg-green-100 text-green-600 rounded-full font-bold hover:bg-green-200 flex items-center justify-center text-sm">+</button>
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => setOpenExtraIdx(null)}
                          className="w-full mt-2 text-xs text-center text-blue-600 hover:underline">Done ✓</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                <div className="flex gap-2">
                  <select value={form.countryCode || "+91"}
                    onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                    className="border border-gray-200 rounded-lg px-2 py-3 text-sm focus:outline-none focus:border-blue-500 bg-gray-50">
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+86">🇨🇳 +86</option>
                  </select>
                  <input type="tel" placeholder="9999999999" value={form.guestPhone}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 10) setForm({ ...form, guestPhone: val });
                    }}
                    className="flex-1 w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                {form.guestPhone && form.guestPhone.length !== 10 && (
                  <p className="text-xs text-red-500 mt-1">⚠️ 10 digits required</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Total Amount (₹)
                  {calculateNights() > 0 && (
                    <span className="ml-2 text-xs text-blue-500">{calculateNights()} night{calculateNights() > 1 ? "s" : ""}</span>
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
              <div className="flex items-end">
                <button type="button" onClick={addRoom}
                  className="w-full border-2 border-dashed border-blue-400 text-blue-600 rounded-lg px-4 py-3 text-sm hover:bg-blue-50 font-medium">
                  + Add Room
                </button>
              </div>
            </div>

            <div className="mb-4">
              <button type="button" onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                {showMoreOptions ? "▲ Less Options" : "▼ More Options"}
              </button>
            </div>

            {showMoreOptions && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={handleSubmit} disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Adding..." : "Booking Confirm Karo"}
              </button>
              <button onClick={() => {
                setShowForm(false); setShowFinalPayment(false); setShowMoreOptions(false);
                setBookingRooms([{ selectedType: "", roomId: "", adults: "1", children: "0", infants: "0", extraMattress: "0", extraPillow: "0", extraBedsheet: "0", blanket: "0" }]);
              }}
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
              <table className="w-full min-w-[1400px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Booking ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Guest Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rooms & Guests</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check-in</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check-out</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Room Service</th>
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

                    const roomsList = booking.rooms && booking.rooms.length > 0
                      ? booking.rooms
                      : [{ roomNumber: booking.roomNumber, roomType: booking.roomType, adults: booking.adults, children: booking.children, infants: booking.infants }];

                    const pendingBill = getPendingBill(booking.id);
                    const totalOrders = getOrdersCount(booking.id);
                    const isCheckedIn = booking.status === "CHECKED_IN";

                    // Action options based on state
                    const actionOpts: any[] = [];
                    if (pendingBill > 0) {
                      actionOpts.push({ value: "BILL", label: `💰 Pay Bill (₹${pendingBill})`, color: "text-green-600" });
                      actionOpts.push({ value: "CHECKED_OUT", label: "🚪 Check-out", color: "text-gray-400", disabled: true });
                    } else {
                      actionOpts.push({ value: "CHECKED_IN", label: "✅ Check-in", color: "text-blue-600" });
                      actionOpts.push({ value: "CHECKED_OUT", label: "🚪 Check-out", color: "text-orange-600" });
                      actionOpts.push({ value: "CANCELLED", label: "❌ Cancel", color: "text-red-600" });
                      actionOpts.push({ value: "UPGRADED", label: "⬆️ Upgrade", color: "text-purple-600" });
                    }

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
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm text-gray-700">{new Date(booking.checkIn).toLocaleDateString("en-IN")}</p>
                          {isCheckInToday && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Today</span>}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm text-gray-700">{new Date(booking.checkOut).toLocaleDateString("en-IN")}</p>
                          {isCheckOutToday && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">Today</span>}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm font-semibold text-gray-900">₹{booking.amount}</p>
                        </td>
                        {/* Room Service Column */}
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
                          <div ref={openActionId === booking.id ? actionRef : null}>
                            <button
                              onClick={() => setOpenActionId(openActionId === booking.id ? null : booking.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${pendingBill > 0 ? "bg-red-100 hover:bg-red-200 text-red-700" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                              {pendingBill > 0 ? `⚠️ Action (Bill ₹${pendingBill})` : "Action ▾"}
                            </button>
                            {openActionId === booking.id && (
                              <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-52 overflow-hidden">
                                {actionOpts.map((opt) => (
                                  <button key={opt.value}
                                    onClick={() => {
                                      if (opt.disabled) {
                                        showToast(`❌ Pehle bill clear karo! Pending: ₹${pendingBill}`, "error");
                                        return;
                                      }
                                      if (opt.value === "BILL") handleMarkPaid(booking.id);
                                      else handleStatusChange(booking.id, opt.value);
                                    }}
                                    disabled={opt.disabled}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${opt.color} ${booking.status === opt.value ? "bg-gray-50 font-semibold" : ""} ${opt.disabled ? "cursor-not-allowed opacity-50" : ""}`}>
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