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
  const [activeTab, setActiveTab] = useState<"details" | "other">("details");

  const [form, setForm] = useState({
    type: "",
    hotelId: "",
    // Room Details
    taxGroup: "",
    sacCode: "",
    defaultAdultStay: "1",
    defaultChildStay: "0",
    defaultInfantStay: "0",
    price: "",
    startNumber: "",
    totalRooms: "",
    extraAdultRate: "0",
    extraChildRate: "0",
    extraInfantRate: "0",
    // Other Details
    maxAdults: "2",
    maxChildren: "0",
    maxInfants: "0",
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
    if (!form.type.trim()) { showToast("Room Type daalo!", "error"); return false; }
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
        setForm({
          type: "", hotelId: form.hotelId,
          taxGroup: "", sacCode: "",
          defaultAdultStay: "1", defaultChildStay: "0", defaultInfantStay: "0",
          price: "", startNumber: "", totalRooms: "",
          extraAdultRate: "0", extraChildRate: "0", extraInfantRate: "0",
          maxAdults: "2", maxChildren: "0", maxInfants: "0",
        });
        setShowForm(false);
        setActiveTab("details");
        fetchHotelAndRooms();
      } else {
        showToast(data.error || "Rooms add nahi ho sake!", "error");
      }
    } catch (error) {
      showToast("Kuch galat hua!", "error");
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

  const groupedRooms = rooms.reduce((acc: any, room) => {
    if (!acc[room.type]) acc[room.type] = [];
    acc[room.type].push(room);
    return acc;
  }, {});

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

  const taxGroups = [
    { value: "", label: "Select Tax Group" },
    { value: "ZERO", label: "Zero Tax Group" },
    { value: "GST_5", label: "GST @ 5%" },
    { value: "GST_12", label: "GST @ 12%" },
    { value: "GST_18", label: "GST @ 18%" },
    { value: "IGST_12", label: "IGST @ 12%" },
    { value: "IGST_18", label: "IGST @ 18%" },
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

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
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

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "details"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                Room Details
              </button>
              <button
                onClick={() => setActiveTab("other")}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "other"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                Other Details
              </button>
            </div>

            {/* Room Details Tab */}
            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Row 1 — Room Type, Tax, SAC Code */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    <span className="text-red-500">*</span> Room Type
                  </label>
                  <input type="text" placeholder="e.g. Standard, Deluxe, Suite"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    <span className="text-red-500">*</span> Tax Group
                  </label>
                  <select value={form.taxGroup}
                    onChange={(e) => setForm({ ...form, taxGroup: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                    {taxGroups.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">HSN/SAC Code</label>
                  <input type="text" placeholder="HSN/SAC code" value={form.sacCode}
                    onChange={(e) => setForm({ ...form, sacCode: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Row 2 — Default Adult, Child, Infant Stay */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    <span className="text-red-500">*</span> Default Adult Stay
                  </label>
                  <input type="number" placeholder="1" value={form.defaultAdultStay}
                    onChange={(e) => setForm({ ...form, defaultAdultStay: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Default Children Stay</label>
                  <input type="number" placeholder="0" value={form.defaultChildStay}
                    onChange={(e) => setForm({ ...form, defaultChildStay: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Default Infant Stay</label>
                  <input type="number" placeholder="0" value={form.defaultInfantStay}
                    onChange={(e) => setForm({ ...form, defaultInfantStay: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Row 3 — Price, Starting Number, Total Rooms */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    <span className="text-red-500">*</span> Price per Night (₹)
                  </label>
                  <input type="number" placeholder="2000" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    <span className="text-red-500">*</span> Starting Room Number
                  </label>
                  <input type="number" placeholder="101" value={form.startNumber}
                    onChange={(e) => setForm({ ...form, startNumber: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    <span className="text-red-500">*</span> No. of Rooms (Total)
                  </label>
                  <input type="number" placeholder="10" value={form.totalRooms}
                    onChange={(e) => setForm({ ...form, totalRooms: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Row 4 — Extra Adult, Child, Infant Rate */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Extra Adult Rate (₹)</label>
                  <input type="number" placeholder="500" value={form.extraAdultRate}
                    onChange={(e) => setForm({ ...form, extraAdultRate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Extra Child Rate (₹)</label>
                  <input type="number" placeholder="100" value={form.extraChildRate}
                    onChange={(e) => setForm({ ...form, extraChildRate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Extra Infant Rate (₹)</label>
                  <input type="number" placeholder="0" value={form.extraInfantRate}
                    onChange={(e) => setForm({ ...form, extraInfantRate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Preview */}
                {previewRooms() && (
                  <div className="md:col-span-3 bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-700">
                      ✅ <b>{form.totalRooms} rooms</b> banenge: <b>{previewRooms()}</b>
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Type: {form.type || "—"} | Price: ₹{form.price || 0}/night
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Other Details Tab */}
            {activeTab === "other" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    <span className="text-red-500">*</span> Max Adults
                  </label>
                  <input type="number" min="1" placeholder="2" value={form.maxAdults}
                    onChange={(e) => setForm({ ...form, maxAdults: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  <p className="text-xs text-gray-400 mt-1">Room mein maximum kitne adults reh sakte hain</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    <span className="text-red-500">*</span> Max Children
                  </label>
                  <input type="number" min="0" placeholder="2" value={form.maxChildren}
                    onChange={(e) => setForm({ ...form, maxChildren: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  <p className="text-xs text-gray-400 mt-1">Room mein maximum kitne children reh sakte hain</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    <span className="text-red-500">*</span> Max Infants
                  </label>
                  <input type="number" min="0" placeholder="1" value={form.maxInfants}
                    onChange={(e) => setForm({ ...form, maxInfants: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  <p className="text-xs text-gray-400 mt-1">Room mein maximum kitne infants reh sakte hain</p>
                </div>

                <div className="md:col-span-3 bg-blue-50 rounded-xl p-4 mt-2">
                  <p className="text-sm font-semibold text-blue-900 mb-2">📋 Summary</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-blue-600">Default Stay</p>
                      <p className="text-gray-700">👤 {form.defaultAdultStay || 0} Adult / 🧒 {form.defaultChildStay || 0} Child / 👶 {form.defaultInfantStay || 0} Infant</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Max Capacity</p>
                      <p className="text-gray-700">👤 {form.maxAdults || 0} Adult / 🧒 {form.maxChildren || 0} Child / 👶 {form.maxInfants || 0} Infant</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Extra Rates</p>
                      <p className="text-gray-700">₹{form.extraAdultRate || 0} / ₹{form.extraChildRate || 0} / ₹{form.extraInfantRate || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {activeTab === "details" && (
                <>
                  <button onClick={() => setActiveTab("other")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
                    Next →
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                    {loading ? "Adding..." : "Save Rooms"}
                  </button>
                </>
              )}
              {activeTab === "other" && (
                <>
                  <button onClick={() => setActiveTab("details")}
                    className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-200">
                    ← Back
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                    {loading ? "Adding..." : "Save Rooms"}
                  </button>
                </>
              )}
              <button onClick={() => { setShowForm(false); setActiveTab("details"); }}
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