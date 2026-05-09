"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";
import { Toast } from "@/components/Toast";
import { useToast } from "@/components/useToast";

const DEFAULT_AMENITIES = [
  "🌐 Free WiFi", "❄️ AC", "📺 TV", "🅿️ Parking", "🍳 Breakfast",
  "🏊 Swimming Pool", "💪 Gym", "🛎️ Room Service", "🧹 Housekeeping",
  "☕ Tea/Coffee Maker", "🔒 Safe", "🛁 Bathtub"
];

export default function BookingEnginePage() {
  useAuth();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [hotelId, setHotelId] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "amenities" | "attractions" | "photos" | "cancellation">("general");
  const [uploading, setUploading] = useState(false);

  const [engine, setEngine] = useState({
    description: "",
    amenities: [] as string[],
    nearestAttractions: [] as { name: string; distance: string }[],
    bannerImage: "",
    galleryImages: [] as string[],
    isActive: true,
    allowExtraMattress: false,
    cancellationPolicies: [] as string[],
  });

  const [newAttraction, setNewAttraction] = useState({ name: "", distance: "" });
  const [customAmenity, setCustomAmenity] = useState("");
  const [newPolicy, setNewPolicy] = useState("");
  const [bookingLink, setBookingLink] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/hotels");
      const data = await res.json();
      if (data.hotels && data.hotels.length > 0) {
        const hId = data.hotels[0].id;
        setHotelId(hId);
        setHotelName(data.hotels[0].name);
        const roomsRes = await fetch(`/api/rooms?hotelId=${hId}`);
        const roomsData = await roomsRes.json();
        setRooms(roomsData.rooms || []);
        setBookingLink(`${window.location.origin}/book/${hId}`);
        const engineRes = await fetch(`/api/booking-engine?hotelId=${hId}`);
        const engineData = await engineRes.json();
        if (engineData.engine) {
          setEngine({
            description: engineData.engine.description || "",
            amenities: engineData.engine.amenities || [],
            nearestAttractions: engineData.engine.nearestAttractions || [],
            bannerImage: engineData.engine.bannerImage || "",
            galleryImages: engineData.engine.galleryImages || [],
            isActive: engineData.engine.isActive ?? true,
            allowExtraMattress: engineData.engine.allowExtraMattress ?? false,
            cancellationPolicies: engineData.engine.cancellationPolicies || [],
          });
        }
      }
    } catch (error) {
      showToast("Data load nahi ho saka!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/booking-engine", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId, ...engine }),
      });
      if (res.ok) {
        showToast("✅ Save ho gaya!", "success");
      } else {
        showToast("❌ Save nahi ho saka!", "error");
      }
    } catch {
      showToast("❌ Error!", "error");
    }
    setSaving(false);
  };

  const toggleAmenity = (amenity: string) => {
    setEngine(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addCustomAmenity = () => {
    if (!customAmenity.trim()) return;
    setEngine(prev => ({ ...prev, amenities: [...prev.amenities, customAmenity] }));
    setCustomAmenity("");
  };

  const addAttraction = () => {
    if (!newAttraction.name || !newAttraction.distance) return;
    setEngine(prev => ({
      ...prev,
      nearestAttractions: [...prev.nearestAttractions, newAttraction],
    }));
    setNewAttraction({ name: "", distance: "" });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(bookingLink);
    showToast("✅ Link copy ho gaya!", "success");
  };

  const refreshRooms = async () => {
    const roomsRes = await fetch(`/api/rooms?hotelId=${hotelId}`);
    const roomsData = await roomsRes.json();
    setRooms(roomsData.rooms || []);
  };

  const handleRoomPhotoUpload = async (file: File, selectedRoom: any) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `hotel_${hotelId}_room_${selectedRoom.id}`);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        const newPhotos = [...(selectedRoom.photos || []), data.url];
        await fetch("/api/rooms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedRoom.id, ...selectedRoom, photos: newPhotos }),
        });
        await refreshRooms();
        showToast("✅ Photo upload ho gaya!", "success");
      }
    } catch { showToast("❌ Upload error!", "error"); }
    setUploading(false);
  };

  const handleSetMainPhoto = async (url: string, selectedRoom: any) => {
    await fetch("/api/rooms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedRoom.id, ...selectedRoom, mainPhoto: url }),
    });
    await refreshRooms();
    showToast("✅ Main photo set ho gaya!", "success");
  };

  const handleDeletePhoto = async (url: string, selectedRoom: any) => {
    const newPhotos = (selectedRoom.photos || []).filter((p: string) => p !== url);
    const newMain = selectedRoom.mainPhoto === url ? "" : selectedRoom.mainPhoto;
    await fetch("/api/rooms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedRoom.id, ...selectedRoom, photos: newPhotos, mainPhoto: newMain }),
    });
    await refreshRooms();
    showToast("✅ Photo delete ho gaya!", "success");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const selectedRoom = rooms.find(r => r.type === selectedRoomId);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">← Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🌐 Booking Engine</h2>
            <p className="text-sm text-gray-500 mt-1">{hotelName} ka public booking page manage karo</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600">Active</span>
              <button
                onClick={() => setEngine(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`w-10 h-5 rounded-full transition-colors ${engine.isActive ? "bg-green-500" : "bg-gray-300"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${engine.isActive ? "translate-x-5" : "translate-x-0"}`}></div>
              </button>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
              {saving ? "Saving..." : "💾 Save"}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-blue-800 mb-2">🔗 Booking Page Link:</p>
          <div className="flex gap-3 items-center">
            <input type="text" value={bookingLink} readOnly
              className="flex-1 bg-white border border-blue-200 rounded-lg px-4 py-2 text-sm text-gray-600" />
            <button onClick={copyLink} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium">📋 Copy Link</button>
            <button onClick={() => window.open(bookingLink, "_blank")} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-medium">👁️ Preview</button>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-blue-700 mb-1">📌 Website pe embed karne ke liye:</p>
            <code className="text-xs bg-white border border-blue-200 rounded p-2 block text-gray-600 overflow-x-auto">
              {`<iframe src="${bookingLink}" width="100%" height="700px" frameborder="0"></iframe>`}
            </code>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "general", label: "🏨 General" },
            { key: "amenities", label: "✨ Amenities" },
            { key: "attractions", label: "📍 Attractions" },
            { key: "photos", label: "🖼️ Photos" },
            { key: "cancellation", label: "📋 Cancellation Policy" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.key ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "general" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🏨 Hotel Description</h3>
            <textarea
              placeholder="Hotel ki description likho jo guests ko dikhe..."
              value={engine.description}
              onChange={(e) => setEngine(prev => ({ ...prev, description: e.target.value }))}
              rows={6}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-400 mt-2">{engine.description.length} characters</p>
          </div>
        )}

        {activeTab === "amenities" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">✨ Hotel Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {DEFAULT_AMENITIES.map((amenity) => (
                <div key={amenity} onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${engine.amenities.includes(amenity) ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${engine.amenities.includes(amenity) ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                    {engine.amenities.includes(amenity) && <span className="text-white text-xs">✓</span>}
                  </span>
                  <span className="text-sm">{amenity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">+ Custom Amenity Add Karo:</p>
              <div className="flex gap-3">
                <input type="text" placeholder="e.g. 🎮 Gaming Room" value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
                <button onClick={addCustomAmenity} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Add</button>
              </div>
              {engine.amenities.filter(a => !DEFAULT_AMENITIES.includes(a)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {engine.amenities.filter(a => !DEFAULT_AMENITIES.includes(a)).map((a) => (
                    <span key={a} className="bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1">
                      {a}
                      <button onClick={() => toggleAmenity(a)} className="text-purple-400 hover:text-red-500">✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-4">{engine.amenities.length} amenities selected</p>
          </div>
        )}

        {activeTab === "attractions" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Nearest Attractions</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Place Name</label>
                <input type="text" placeholder="e.g. Pune Airport" value={newAttraction.name}
                  onChange={(e) => setNewAttraction(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Distance</label>
                <input type="text" placeholder="e.g. 15 km" value={newAttraction.distance}
                  onChange={(e) => setNewAttraction(prev => ({ ...prev, distance: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <button onClick={addAttraction} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 mb-6">+ Add Attraction</button>
            {engine.nearestAttractions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Koi attraction nahi add kiya</p>
            ) : (
              <div className="space-y-2">
                {engine.nearestAttractions.map((attr, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">📍 {attr.name}</p>
                      <p className="text-xs text-gray-500">{attr.distance}</p>
                    </div>
                    <button onClick={() => setEngine(prev => ({ ...prev, nearestAttractions: prev.nearestAttractions.filter((_, idx) => idx !== i) }))}
                      className="text-red-400 hover:text-red-600 text-sm">🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "photos" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🛏️ Room Select Karo</h3>
              <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                <option value="">-- Room chuno --</option>
                {[...new Map(rooms.map(r => [r.type, r])).values()].map((room: any) => (
                  <option key={room.type} value={room.type}>{room.type}</option>
                ))}
              </select>
            </div>

            {selectedRoom && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🖼️ {selectedRoomId} Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {(selectedRoom.photos || []).map((img: string, i: number) => (
                    <div key={i} className={`relative rounded-xl overflow-hidden border-2 ${selectedRoom.mainPhoto === img ? "border-blue-500" : "border-transparent"}`}>
                      <img src={img} alt={`Room ${i}`} className="w-full h-32 object-cover" />
                      {selectedRoom.mainPhoto === img && (
                        <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">⭐ Main</span>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 flex gap-1 p-1">
                        <button onClick={() => handleSetMainPhoto(img, selectedRoom)}
                          className="flex-1 text-xs text-white bg-blue-500 rounded py-0.5 hover:bg-blue-600">⭐ Main</button>
                        <button onClick={() => handleDeletePhoto(img, selectedRoom)}
                          className="flex-1 text-xs text-white bg-red-500 rounded py-0.5 hover:bg-red-600">🗑️</button>
                      </div>
                    </div>
                  ))}
                  <label className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                    <div className="text-2xl mb-1">+</div>
                    <p className="text-xs text-gray-500">Add Photo</p>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleRoomPhotoUpload(file, selectedRoom); }} />
                  </label>
                </div>
                {uploading && <p className="text-sm text-blue-600 text-center">⏳ Uploading...</p>}
                <p className="text-xs text-gray-400">{(selectedRoom.photos || []).length} photos added</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "cancellation" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Cancellation Policy</h3>
            <div className="flex gap-3 mb-6">
              <input type="text" placeholder="e.g. Free cancellation 24 hours before check-in"
                value={newPolicy} onChange={(e) => setNewPolicy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newPolicy.trim()) {
                    setEngine(prev => ({ ...prev, cancellationPolicies: [...prev.cancellationPolicies, newPolicy.trim()] }));
                    setNewPolicy("");
                  }
                }}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              <button onClick={() => {
                if (!newPolicy.trim()) return;
                setEngine(prev => ({ ...prev, cancellationPolicies: [...prev.cancellationPolicies, newPolicy.trim()] }));
                setNewPolicy("");
              }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Add</button>
            </div>
            {engine.cancellationPolicies.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Koi policy nahi add ki</p>
            ) : (
              <div className="space-y-2">
                {engine.cancellationPolicies.map((policy, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <p className="text-sm text-gray-700">📌 {policy}</p>
                    <button onClick={() => setEngine(prev => ({ ...prev, cancellationPolicies: prev.cancellationPolicies.filter((_, idx) => idx !== i) }))}
                      className="text-red-400 hover:text-red-600 text-sm ml-3">🗑️</button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-4">{engine.cancellationPolicies.length} policies added</p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}