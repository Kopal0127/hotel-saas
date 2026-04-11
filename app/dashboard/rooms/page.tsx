"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/Toast";
import { useToast } from "@/components/useToast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/components/useAuth";

export default function RoomsPage() {
  useAuth();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [rooms, setRooms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "Standard",
    price: "",
    hotelId: "",
    startNumber: "",
    totalRooms: "",
  });
  const [confirm, setConfirm] = useState({ isOpen: false, roomId: "" });

  useEffect(() => { fetchHotelAndRooms(); }, []);

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
      showToast("Rooms load nahi ho sake!", "error");
    }
  };

  const validate = () => {
    if (!form.startNumber) { showToast("Starting room number daalo!", "error"); return false; }
    if (!form.totalRooms || parseInt(form.totalRooms) <= 0) { showToast("Total rooms 0 se zyada honi chahiye!", "error"); return false; }
    if (!form.price || parseFloat(form.price) <= 0) { showToast("Price 0 se zyada honi chahiye!", "error"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Rooms add ho gaye! ✅", "success");
        setForm((f) => ({ ...f, startNumber: "", totalRooms: "", price: "" }));
        setShowForm(false);
        fetchHotelAndRooms();
      } else {
        showToast(data.error || "Rooms add nahi ho sake!", "error");
      }
    } catch (error) {
      showToast("Kuch galat hua, dobara try karo!", "error");
    }
    setLoading(false);
  };

  const handleDeleteClick = (roomId: string) => { setConfirm({ isOpen: true, roomId }); };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`/api/rooms?id=${confirm.roomId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Room delete ho gaya! ✅", "success");
        fetchHotelAndRooms();
      } else {
        showToast("Room delete nahi ho saka!", "error");
      }
    } catch (error) {
      showToast("Kuch galat hua!", "error");
    }
    setConfirm({ isOpen: false, roomId: "" });
  };

  // Rooms ko type ke hisaab se group karo
  const groupedRooms = rooms.reduce((acc: any, room) => {
    if (!acc[room.type]) acc[room.type] = [];
    acc[room.type].push(room);
    return acc;
  }, {});

  // Preview: room numbers jo banenge
  const previewRooms = () => {
    if (!form.startNumber || !form.totalRooms) return "";
    const start = parseInt(form.startNumber);
    const total = parseInt(form.totalRooms);
    if (isNaN(start) || isNaN(total) || total <= 0) return "";
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => start + i).join(", ");
    }
    return `${start}, ${start + 1}, ${start + 2} ... ${start + total - 1}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3 md:gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Room Management</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-3 md:px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Room Add Karo
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Naya Room Add Karo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Room Type</label>
                <input
                  type="text"
                  placeholder="e.g. Standard, Deluxe, Suite"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Price per Night (₹)</label>
                <input type="number" placeholder="2000" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Starting Room Number
                </label>
                <input type="number" placeholder="101" value={form.startNumber}
                  onChange={(e) => setForm({ ...form, startNumber: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  No. of Rooms (Total)
                </label>
                <input type="number" placeholder="10" value={form.totalRooms}
                  onChange={(e) => setForm({ ...form, totalRooms: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>

              {/* Preview */}
              {previewRooms() && (
                <div className="md:col-span-2 bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-700">
                    ✅ <b>{form.totalRooms} rooms</b> banenge: <b>{previewRooms()}</b>
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Type: {form.type} | Price: ₹{form.price}/night
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleSubmit} disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Adding..." : "Rooms Add Karo"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
            <div className="text-5xl mb-4">🛏️</div>
            <p>Abhi koi room nahi hai</p>
            <p className="text-sm mt-1">Upar button se rooms add karo!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedRooms).map(([type, typeRooms]: any) => (
              <div key={type} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Type Header */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🛏️</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{type}</h3>
                      <p className="text-xs text-gray-500">{typeRooms.length} rooms • ₹{typeRooms[0].price}/night</p>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                    {typeRooms.length} Rooms
                  </span>
                </div>

                {/* Room Numbers Grid */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {typeRooms.map((room: any) => (
                      <div key={room.id} className="group relative">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:border-red-200 cursor-pointer transition-colors"
                          onClick={() => handleDeleteClick(room.id)}>
                          #{room.number}
                          <span className="hidden group-hover:inline ml-1 text-red-500 text-xs">🗑️</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">💡 Room number pe click karo delete karne ke liye</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirm.isOpen}
        title="Room Delete Karo?"
        message="Yeh action undo nahi ho sakta! Kya aap sure hain?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirm({ isOpen: false, roomId: "" })}
        isDangerous={true}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}