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
    taxGroup: "",
    sacCode: "",
    defaultAdultStay: "1",
    defaultChildStay: "0",
    defaultInfantStay: "0",
    price: "",
    startNumber: "",
    totalRooms: "",
   extraMattressRate: "0",
    maxAdults: "2",
    maxChildren: "0",
    maxInfants: "0",
    bedType: "",
    roomSize: "",
    roomView: "",
    extraMattressLimit: "0",
  });

 const [confirm, setConfirm] = useState({ isOpen: false, roomId: "" });
  const [editRoom, setEditRoom] = useState<any>(null);
 const [editForm, setEditForm] = useState({
    type: "", price: "", taxGroup: "", sacCode: "",
    defaultAdultStay: "1", defaultChildStay: "0", defaultInfantStay: "0",
   extraMattressRate: "0",
    bedType: "", roomSize: "", roomView: "", extraMattressLimit: "0",
  });
  const [editLoading, setEditLoading] = useState(false);

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
        extraMattressRate: "0",
          maxAdults: "2", maxChildren: "0", maxInfants: "0",
         bedType: "", roomSize: "", roomView: "", extraMattressLimit: "0",
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
  const handleEditClick = (room: any) => {
    setEditRoom(room);
    setEditForm({
      type: room.type || "",
      price: room.price?.toString() || "",
      taxGroup: room.taxGroup || "",
      sacCode: room.sacCode || "",
      defaultAdultStay: room.defaultAdultStay?.toString() || "1",
      defaultChildStay: room.defaultChildStay?.toString() || "0",
      defaultInfantStay: room.defaultInfantStay?.toString() || "0",
     extraMattressRate: room.extraMattressRate?.toString() || "0",
     bedType: room.bedType || "",
      roomSize: room.roomSize || "",
      roomView: room.roomView || "",
      extraMattressLimit: room.extraMattressLimit?.toString() || "0",
    });
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editRoom.id, ...editForm }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("✅ Room update ho gaya!", "success");
        setEditRoom(null);
        fetchHotelAndRooms();
      } else {
        showToast(data.error || "❌ Update nahi ho saka!", "error");
      }
    } catch (error) {
      showToast("❌ Kuch galat hua!", "error");
    }
    setEditLoading(false);
  };

 const handleDeleteAll = async (rooms: any[]) => {
    if (!window.confirm(`Kya aap "${rooms[0].type}" type ke sab ${rooms.length} rooms delete karna chahte ho?`)) return;
    try {
      const results = await Promise.all(rooms.map(room =>
        fetch(`/api/rooms?id=${room.id}`, { method: "DELETE" }).then(r => r.json())
      ));
      
      const failed = results.filter(r => r.error);
      const success = results.filter(r => !r.error);

     if (success.length > 0) {
        showToast(`✅ ${success.length} rooms delete ho gaye!`, "success");
      }
      if (failed.length > 0 && success.length === 0) {
        showToast(`⚠️ Sab rooms mein bookings linked hain — delete nahi ho sake!`, "warning");
      } else if (failed.length > 0) {
        showToast(`ℹ️ ${failed.length} rooms skip hue — unme bookings hain`, "info");
      }
      fetchHotelAndRooms();
    } catch (error) {
      showToast("❌ Delete nahi ho saka!", "error");
    }
  };

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
          <div className="flex gap-3">
            <button onClick={() => router.push("/dashboard/inventory")}
              className="bg-purple-600 text-white px-3 md:px-5 py-2 rounded-lg text-sm hover:bg-purple-700">
              📦 Stock Inventory
            </button>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-3 md:px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
              + Room Add Karo
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Naya Room Add Karo</h3>

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
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Extra Mattress Rate (₹)</label>
                  <input type="number" placeholder="0" value={form.extraMattressRate}
                    onChange={(e) => setForm({ ...form, extraMattressRate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>

               {/* Row 5 — Bed Type, Room Size, Room View */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Bed Type</label>
                  <select value={form.bedType}
                    onChange={(e) => setForm({ ...form, bedType: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Select Bed Type</option>
                    <option value="King Size Bed">👑 King Size Bed</option>
                    <option value="Queen Size Bed">🛏️ Queen Size Bed</option>
                    <option value="Single Bed">🛏️ Single Bed</option>
                    <option value="Double Bed">🛏️ Double Bed</option>
                    <option value="Twin Bed">🛏️ Twin Bed</option>
                    <option value="Bunk Bed">🛏️ Bunk Bed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Room Size</label>
                  <input type="text" placeholder="e.g. 324 sq. ft." value={form.roomSize}
                    onChange={(e) => setForm({ ...form, roomSize: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Room View</label>
                  <input type="text" placeholder="e.g. City View, Pool View" value={form.roomView}
                    onChange={(e) => setForm({ ...form, roomView: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Extra Mattress Limit</label>
                  <input type="number" placeholder="0" value={form.extraMattressLimit}
                    onChange={(e) => setForm({ ...form, extraMattressLimit: e.target.value })}
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

                       <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                {loading ? "Adding..." : "Save Rooms"}
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
               <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🛏️</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{type}</h3>
                      <p className="text-xs text-gray-500">{typeRooms.length} rooms • ₹{typeRooms[0].price}/night</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                      {typeRooms.length} Rooms
                    </span>
                    <button
                      onClick={() => handleDeleteAll(typeRooms)}
                      className="bg-red-50 text-red-500 text-sm font-medium px-3 py-1 rounded-full hover:bg-red-100 transition"
                    >
                      🗑️ Delete All
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {typeRooms.map((room: any) => (
                     <div key={room.id} className="group relative bg-green-50 border border-green-200 rounded-xl p-3 text-center transition-colors">
                        <div className="text-lg mb-1">🛏️</div>
                        <div className="text-sm font-bold text-gray-800">#{room.number}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{room.type}</div>
                        <div className="text-xs text-green-600 font-medium mt-1">₹{room.price}/night</div>
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => handleEditClick(room)}
                            className="flex-1 text-xs bg-blue-50 text-blue-600 rounded-lg py-1 hover:bg-blue-100"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteClick(room.id)}
                            className="flex-1 text-xs bg-red-50 text-red-500 rounded-lg py-1 hover:bg-red-100"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">💡 Room card pe click karo delete karne ke liye</p>
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

     {/* Edit Modal */}
      {editRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">✏️ Room #{editRoom.number} Edit Karo</h3>
              <button onClick={() => setEditRoom(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Room Type</label>
                <input type="text" value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tax Group</label>
                <select value={editForm.taxGroup}
                  onChange={(e) => setEditForm({ ...editForm, taxGroup: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                  {taxGroups.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">SAC Code</label>
                <input type="text" value={editForm.sacCode}
                  onChange={(e) => setEditForm({ ...editForm, sacCode: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Default Adult Stay</label>
                <input type="number" value={editForm.defaultAdultStay}
                  onChange={(e) => setEditForm({ ...editForm, defaultAdultStay: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Default Child Stay</label>
                <input type="number" value={editForm.defaultChildStay}
                  onChange={(e) => setEditForm({ ...editForm, defaultChildStay: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Default Infant Stay</label>
                <input type="number" value={editForm.defaultInfantStay}
                  onChange={(e) => setEditForm({ ...editForm, defaultInfantStay: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Price per Night (₹)</label>
                <input type="number" value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
             <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Extra Mattress Rate (₹)</label>
                <input type="number" value={editForm.extraMattressRate}
                  onChange={(e) => setEditForm({ ...editForm, extraMattressRate: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Bed Type</label>
                <select value={editForm.bedType}
                  onChange={(e) => setEditForm({ ...editForm, bedType: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Select Bed Type</option>
                  <option value="King Size Bed">👑 King Size Bed</option>
                  <option value="Queen Size Bed">🛏️ Queen Size Bed</option>
                  <option value="Single Bed">🛏️ Single Bed</option>
                  <option value="Double Bed">🛏️ Double Bed</option>
                  <option value="Twin Bed">🛏️ Twin Bed</option>
                  <option value="Bunk Bed">🛏️ Bunk Bed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Room Size</label>
                <input type="text" placeholder="e.g. 324 sq. ft." value={editForm.roomSize}
                  onChange={(e) => setEditForm({ ...editForm, roomSize: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
             <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Room View</label>
                <input type="text" placeholder="e.g. City View" value={editForm.roomView}
                  onChange={(e) => setEditForm({ ...editForm, roomView: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Extra Mattress Limit</label>
                <input type="number" placeholder="0" value={editForm.extraMattressLimit}
                  onChange={(e) => setEditForm({ ...editForm, extraMattressLimit: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleEditSubmit} disabled={editLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {editLoading ? "Saving..." : "✅ Save Changes"}
              </button>
              <button onClick={() => setEditRoom(null)}
                className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}