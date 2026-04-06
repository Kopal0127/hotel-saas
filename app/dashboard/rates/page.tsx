"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/useAuth";
import { useToast } from "@/components/useToast";
import { Toast } from "@/components/Toast";

interface Room { id: string; number: string; type: string; price: number; }
interface Channel { id: string; name: string; isConnected: boolean; }
interface RatePlan {
  id: string; channelId: string; roomId: string;
  date: string; price: number; available: number; isBlocked: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function RatesPage() {
  useAuth();
  const { toast, showToast, hideToast } = useToast();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [loading, setLoading] = useState(false);

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkAvailable, setBulkAvailable] = useState("");

  const [editCell, setEditCell] = useState<{ date: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/hotels", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.hotels?.[0]) setHotelId(data.hotels[0].id);
      });
  }, []);

  useEffect(() => {
    if (hotelId) fetchRates();
  }, [hotelId, month, year, selectedRoom]);

  async function fetchRates() {
    setLoading(true);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ hotelId, month: String(month), year: String(year) });
    if (selectedRoom) params.set("roomId", selectedRoom);
    const res = await fetch(`/api/rates?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setRooms(data.rooms || []);
    setChannels(data.channels || []);
    setRatePlans(data.ratePlans || []);
    if (!selectedRoom && data.rooms?.[0]) setSelectedRoom(data.rooms[0].id);
    setLoading(false);
  }

  function getCalendarDays() {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  function dateStr(day: number) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // Sabhi OTAs ka combined view — agar koi bhi OTA pe blocked hai toh blocked dikhao
  function getCombinedRatePlan(day: number) {
    const ds = dateStr(day);
    const plans = ratePlans.filter(
      (r) => r.date.startsWith(ds) && r.roomId === selectedRoom
    );
    if (plans.length === 0) return null;
    // Minimum available across all OTAs
    const minAvail = Math.min(...plans.map(p => p.available));
    // Average price
    const avgPrice = plans.reduce((s, p) => s + p.price, 0) / plans.length;
    // Blocked agar kisi bhi OTA pe blocked ho
    const isBlocked = plans.some(p => p.isBlocked);
    return { price: avgPrice, available: minAvail, isBlocked, count: plans.length };
  }

  function getDefaultPrice() {
    return rooms.find((r) => r.id === selectedRoom)?.price || 0;
  }

  const connectedChannels = channels.filter(c => c.isConnected);

  // Sabhi OTAs pe ek saath update
  async function updateAllOTAs(day: number, updates: { price?: number; available?: number; isBlocked?: boolean }) {
    const token = localStorage.getItem("token");
    const ds = dateStr(day);
    const combined = getCombinedRatePlan(day);

    await Promise.all(
      connectedChannels.map(channel =>
        fetch("/api/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            channelId: channel.id,
            roomId: selectedRoom,
            date: ds,
            price: updates.price ?? combined?.price ?? getDefaultPrice(),
            available: updates.available ?? combined?.available ?? 1,
            isBlocked: updates.isBlocked ?? combined?.isBlocked ?? false,
          }),
        })
      )
    );
  }

  async function toggleBlock(day: number) {
    const combined = getCombinedRatePlan(day);
    await updateAllOTAs(day, { isBlocked: !combined?.isBlocked });
    showToast(combined?.isBlocked ? "Sabhi OTAs pe room khol diya! 🟢" : "Sabhi OTAs pe room band kar diya! 🔴", "success");
    fetchRates();
  }

  async function saveCell(day: number, field: string, value: string) {
    const updates: { price?: number; available?: number } = {};
    if (field === "price") updates.price = parseFloat(value);
    if (field === "available") updates.available = parseInt(value);
    await updateAllOTAs(day, updates);
    setEditCell(null);
    showToast(`Sabhi ${connectedChannels.length} OTAs pe update ho gaya! ✅`, "success");
    fetchRates();
  }

  async function bulkUpdate() {
    if (!selectedDates.length) { showToast("Koi date select nahi ki!", "warning"); return; }
    if (!bulkPrice && !bulkAvailable) { showToast("Price ya available enter karo!", "warning"); return; }
    const token = localStorage.getItem("token");

    await Promise.all(
      connectedChannels.map(channel =>
        fetch("/api/rates", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            channelId: channel.id,
            roomId: selectedRoom,
            dates: selectedDates,
            ...(bulkPrice ? { price: parseFloat(bulkPrice) } : {}),
            ...(bulkAvailable ? { available: parseInt(bulkAvailable) } : {}),
          }),
        })
      )
    );

    showToast(`${selectedDates.length} dates × ${connectedChannels.length} OTAs update ho gayi! 🎉`, "success");
    setSelectedDates([]); setBulkPrice(""); setBulkAvailable(""); setBulkMode(false);
    fetchRates();
  }

  function toggleDateSelect(day: number) {
    const ds = dateStr(day);
    setSelectedDates((prev) => prev.includes(ds) ? prev.filter((d) => d !== ds) : [...prev, ds]);
  }

  function prevMonth() { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }

  const calDays = getCalendarDays();

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📅 Rate & Availability Manager</h1>
          <p className="text-gray-500 text-sm">Ek jagah update karo → Sabhi OTAs pe sync ho jata hai</p>
        </div>
        <button
          onClick={() => { setBulkMode(!bulkMode); setSelectedDates([]); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            bulkMode ? "bg-orange-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {bulkMode ? "✕ Bulk Mode Band Karo" : "✏️ Bulk Edit Mode"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">

        {/* Connected OTAs Status */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Connected OTAs — Sab pe ek saath sync hoga:</p>
          <div className="flex flex-wrap gap-2">
            {channels.length === 0 && (
              <span className="text-xs text-gray-400">Koi OTA connected nahi — pehle Channels page pe connect karo</span>
            )}
            {channels.map(c => (
              <span key={c.id} className={`text-xs px-3 py-1 rounded-full font-medium ${
                c.isConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
              }`}>
                {c.isConnected ? "✅" : "❌"} {c.name.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-xs text-gray-500 font-medium">Room Type</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="block mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>#{r.number} — {r.type}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-lg">‹</button>
            <span className="text-lg font-semibold text-gray-800 w-40 text-center">
              {MONTHS[month - 1]} {year}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-lg">›</button>
          </div>
        </div>

        {/* Bulk Edit Panel */}
        {bulkMode && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs text-orange-700 font-medium">Selected: {selectedDates.length} dates × {connectedChannels.length} OTAs</label>
              <p className="text-xs text-gray-500">Calendar mein dates click karo</p>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium">Bulk Price (₹)</label>
              <input
                type="number" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="e.g. 2500"
                className="block mt-1 border rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium">Bulk Available Rooms</label>
              <input
                type="number" value={bulkAvailable} onChange={(e) => setBulkAvailable(e.target.value)}
                placeholder="e.g. 5"
                className="block mt-1 border rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <button
              onClick={bulkUpdate}
              className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              ✓ Sabhi OTAs pe Update Karo
            </button>
            <button onClick={() => setSelectedDates([])} className="text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
              Clear
            </button>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-800 text-white">
            {DAYS.map((d) => (
              <div key={d} className="text-center py-3 text-sm font-semibold tracking-wide">{d}</div>
            ))}
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-400">
              <div className="text-4xl mb-2">⏳</div>
              <p>Loading rates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="bg-gray-50 border border-gray-100 min-h-[110px]" />;
                const combined = getCombinedRatePlan(day);
                const ds = dateStr(day);
                const isSelected = selectedDates.includes(ds);
                const isBlocked = combined?.isBlocked;
                const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();

                return (
                  <div
                    key={day}
                    onClick={() => bulkMode && toggleDateSelect(day)}
                    className={`border border-gray-100 min-h-[110px] p-2 transition-all ${
                      bulkMode ? "cursor-pointer hover:bg-blue-50" : ""
                    } ${isSelected ? "bg-blue-100 border-blue-400" : ""} ${
                      isBlocked ? "bg-red-50" : ""
                    } ${isToday && !isSelected && !isBlocked ? "bg-yellow-50" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${isToday ? "text-blue-600" : "text-gray-700"} ${isBlocked ? "text-red-500" : ""}`}>
                        {day}
                        {isToday && <span className="ml-1 text-xs bg-blue-600 text-white rounded px-1">Today</span>}
                      </span>
                      {isSelected && <span className="text-blue-500 text-xs">✓</span>}
                    </div>

                    {!bulkMode && (
                      <>
                        {/* Price */}
                        {editCell?.date === ds && editCell?.field === "price" ? (
                          <input
                            autoFocus type="number" value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveCell(day, "price", editValue)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveCell(day, "price", editValue); if (e.key === "Escape") setEditCell(null); }}
                            className="w-full text-xs border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div
                            className="text-sm font-semibold text-green-700 cursor-pointer hover:bg-green-50 rounded px-1"
                            onClick={(e) => { e.stopPropagation(); setEditCell({ date: ds, field: "price" }); setEditValue(String(combined?.price ?? getDefaultPrice())); }}
                            title="Click to edit — sabhi OTAs pe update hoga"
                          >
                            ₹{combined?.price ?? getDefaultPrice()}
                          </div>
                        )}

                        {/* Available */}
                        {editCell?.date === ds && editCell?.field === "available" ? (
                          <input
                            autoFocus type="number" value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveCell(day, "available", editValue)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveCell(day, "available", editValue); if (e.key === "Escape") setEditCell(null); }}
                            className="w-full text-xs border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div
                            className={`text-xs cursor-pointer hover:bg-gray-100 rounded px-1 ${isBlocked ? "text-red-500" : "text-gray-500"}`}
                            onClick={(e) => { e.stopPropagation(); setEditCell({ date: ds, field: "available" }); setEditValue(String(combined?.available ?? 1)); }}
                            title="Click to edit availability"
                          >
                            {isBlocked ? "🚫 Blocked" : `${combined?.available ?? 1} avail`}
                          </div>
                        )}

                        {/* OTAs count badge */}
                        {combined && (
                          <div className="text-xs text-blue-400 px-1">
                            {combined.count} OTA{combined.count > 1 ? "s" : ""}
                          </div>
                        )}

                        {/* Block button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBlock(day); }}
                          className={`mt-1 w-full text-xs py-0.5 rounded transition-colors ${
                            isBlocked ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {isBlocked ? "🔓 Unblock All" : "🔒 Block All"}
                        </button>
                      </>
                    )}

                    {connectedChannels.length === 0 && !bulkMode && (
                      <p className="text-xs text-gray-400 mt-1">OTA connect karo</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 text-xs text-gray-500 bg-white rounded-xl shadow-sm p-4">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 border rounded inline-block"></span> Today</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-50 border rounded inline-block"></span> Blocked (Sabhi OTAs)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 border rounded inline-block"></span> Selected (Bulk)</span>
          <span className="ml-auto">💡 Price click karo → Sabhi OTAs pe update hoga</span>
        </div>
      </div>
    </div>
  );
}