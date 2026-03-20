"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [form, setForm] = useState({
    roomId: "",
    guestName: "",
    guestEmail: "",
    checkIn: "",
    checkOut: "",
    amount: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch("/api/hotels");
    const data = await res.json();
    if (data.hotels && data.hotels.length > 0) {
      const hId = data.hotels[0].id;
      setHotelId(hId);
      const roomsRes = await fetch(`/api/rooms?hotelId=${hId}`);
      const roomsData = await roomsRes.json();
      setRooms(roomsData.rooms || []);
      const bookingsRes = await fetch(`/api/bookings?hotelId=${hId}`);
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData.bookings || []);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Booking ho gayi!");
      setShowForm(false);
      fetchData();
    } else {
      setMessage("❌ " + data.error);
    }
    setLoading(false);
  };

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

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-gray-50 text-sm text-center">{message}</div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Naya Booking Add Karo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Room Select Karo</label>
                <select
                  value={form.roomId}
                  onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Room chuno --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room #{room.number} — {room.type} — ₹{room.price}/night
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Guest Name</label>
                <input
                  type="text"
                  placeholder="Guest ka naam"
                  value={form.guestName}
                  onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Guest Email</label>
                <input
                  type="email"
                  placeholder="guest@email.com"
                  value={form.guestEmail}
                  onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Total Amount (₹)</label>
                <input
                  type="number"
                  placeholder="5000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Check In</label>
                <input
                  type="date"
                  value={form.checkIn}
                  onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Check Out</label>
                <input
                  type="date"
                  value={form.checkOut}
                  onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Booking Confirm Karo"}
            </button>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p>Abhi koi booking nahi hai</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{booking.guestName}</p>
                      <p className="text-xs text-gray-500">{booking.guestEmail}</p>
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
        )}
      </div>
    </div>
  );
}