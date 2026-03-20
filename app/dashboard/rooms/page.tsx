"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    number: "",
    type: "Standard",
    price: "",
    hotelId: "",
  });

  useEffect(() => {
    fetchHotelAndRooms();
  }, []);

  const fetchHotelAndRooms = async () => {
    try {
      const res = await fetch("/api/hotels");
      const data = await res.json();
      if (data.hotels && data.hotels.length > 0) {
        const hotelId = data.hotels[0].id;
        setForm((f) => ({ ...f, hotelId }));
        const roomsRes = await fetch(`/api/rooms?hotelId=${hotelId}`);
        const roomsData = await roomsRes.json();
        setRooms(roomsData.rooms || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Room add ho gaya!");
      setForm((f) => ({ ...f, number: "", price: "" }));
      setShowForm(false);
      fetchHotelAndRooms();
    } else {
      setMessage("❌ " + data.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">
            Dashboard
          </button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            + Room Add Karo
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-gray-50 text-sm text-center">
            {message}
          </div>
        )}

        {/* Add Room Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Naya Room Add Karo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Room Number</label>
                <input
                  type="text"
                  placeholder="101"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Room Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option>Standard</option>
                  <option>Deluxe</option>
                  <option>Suite</option>
                  <option>Super Deluxe</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Price per Night (₹)</label>
                <input
                  type="number"
                  placeholder="2000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Room Add Karo"}
            </button>
          </div>
        )}

        {/* Rooms List */}
        {rooms.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
            <div className="text-5xl mb-4">🛏️</div>
            <p>Abhi koi room nahi hai</p>
            <p className="text-sm mt-1">Upar button se room add karo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-gray-900">#{room.number}</span>
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Available</span>
                </div>
                <p className="text-gray-600 text-sm mb-1">{room.type}</p>
                <p className="text-blue-600 font-semibold">₹{room.price}/night</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}