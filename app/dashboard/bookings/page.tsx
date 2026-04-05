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
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [form, setForm] = useState({
    roomId: "",
    guestName: "",
    guestEmail: "",
    checkIn: "",
    checkOut: "",
    amount: "",
    notes: "",
    specialRequests: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

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

  const validate = () => {
    if (!form.roomId) { showToast("Room select karna zaroori hai!", "error"); return false; }
    if (!form.guestName.trim()) { showToast("Guest ka naam daalna zaroori hai!", "error"); return false; }
    if (!form.guestEmail.trim()) { showToast("Guest ka email daalna zaroori hai!", "error"); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.guestEmail)) { showToast("Sahi email daalo!", "error"); return false; }
    if (!form.checkIn) { showToast("Check-in date daalna zaroori hai!", "error"); return false; }
    if (!form.checkOut) { showToast("Check-out date daalna zaroori hai!", "error"); return false; }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) { showToast("Check-out date, check-in ke baad honi chahiye!", "error"); return false; }
    if (!form.amount || parseFloat(form.amount) <= 0) { showToast("Amount 0 se zyada honi chahiye!", "error"); return false; }
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
        setForm({ roomId: "", guestName: "", guestEmail: "", checkIn: "", checkOut: "", amount: "", notes: "", specialRequests: "" });
        setShowForm(false);
        fetchData();
      } else {
        showToast(data.error || "Booking nahi ho saki!", "error");
      }
    } catch (error) {
      showToast("Kuch galat hua, dobara try karo!", "error");
    }
    setLoading(false);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            + Naya Booking
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Total Amount (₹)</label>
                <input type="number" placeholder="5000" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
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
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Special Requests</label>
                <input type="text" placeholder="Koi special request? (Optional)"
                  value={form.specialRequests}
                  onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Notes (Staff ke liye)</label>
                <textarea placeholder="Internal notes... (Optional)"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSubmit} disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Adding..." : "Booking Confirm Karo"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <input type="text" placeholder="🔍 Guest naam ya email se search karo..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white" />
          <select value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Guest</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Room</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Check In</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Check Out</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{booking.guestName}</p>
                        <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                        {booking.specialRequests && (
                          <p className="text-xs text-blue-500 mt-1">📝 {booking.specialRequests}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">#{booking.roomNumber} — {booking.roomType}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(booking.checkIn).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(booking.checkOut).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{booking.amount}</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">{booking.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                  className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100">
                  ← Pehle
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded-lg text-sm border ${page === i + 1 ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                  className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100">
                  Agle →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}