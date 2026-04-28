"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Hotel {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface Room {
  id: string;
  number: string;
  type: string;
  price: number;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
}

interface BookingEngine {
  description: string;
  amenities: string[];
  nearestAttractions: { name: string; distance: string }[];
  bannerImage: string;
  galleryImages: string[];
  isActive: boolean;
  allowExtraMattress: boolean;
}

interface RoomGuest {
  roomId: string;
  adults: number;
  children: number;
  extraMattress: number;
}

export default function PublicBookingPage() {
  const params = useParams();
  const hotelId = params.hotelId as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [engine, setEngine] = useState<BookingEngine | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [step, setStep] = useState<"search" | "rooms" | "details" | "payment">("search");

  // Search params
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [roomGuests, setRoomGuests] = useState<RoomGuest[]>([
    { roomId: "", adults: 2, children: 0, extraMattress: 0 }
  ]);

  // Selected rooms
  const [selectedRooms, setSelectedRooms] = useState<any[]>([]);

  // Guest details
  const [guestForm, setGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  // Active room tab
  const [activeRoomTab, setActiveRoomTab] = useState<"amenities" | "description" | "photos" | "attractions">("amenities");

  useEffect(() => {
    fetchHotelData();
    fetchAllRooms();
  }, [hotelId]);

  const fetchAllRooms = async () => {
    try {
      const res = await fetch(`/api/public/rooms?hotelId=${hotelId}`);
      const data = await res.json();
      setAvailableRooms(data.rooms || []);
      setStep("rooms");
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHotelData = async () => {
    try {
      const [hotelRes, engineRes] = await Promise.all([
        fetch(`/api/public/hotel?hotelId=${hotelId}`),
        fetch(`/api/booking-engine?hotelId=${hotelId}`),
      ]);

      const hotelData = await hotelRes.json();
      const engineData = await engineRes.json();

      setHotel(hotelData.hotel);
      setEngine(engineData.engine);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

 const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      alert("Check-in aur Check-out date select karo!");
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      alert("Check-out date, Check-in se baad honi chahiye!");
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/public/rooms?hotelId=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}`
      );
      const data = await res.json();
      setAvailableRooms(data.rooms || []);
      setStep("rooms");
    } catch (error) {
      alert("Rooms load nahi ho sake!");
    }
    setSearching(false);
  };

  const handleSelectRoom = (room: Room) => {
    const already = selectedRooms.find(r => r.id === room.id);
    if (already) {
      setSelectedRooms(prev => prev.filter(r => r.id !== room.id));
    } else {
      setSelectedRooms(prev => [...prev, { ...room, adults: 2, children: 0, extraMattress: 0 }]);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return selectedRooms.reduce((sum, r) => sum + (r.price * nights), 0);
  };

 const totalGuests = roomGuests.reduce((sum, r) => sum + r.adults + r.children, 0);
  const totalRooms = roomGuests.length;

// Auto room calculation
  const calculateAutoRooms = (guests: number, room: any) => {
    const maxAdults = room.maxAdults || 2;
    const maxChildren = room.maxChildren || 0;
    const maxInfants = room.maxInfants || 0;
    const baseCapacity = maxAdults + maxChildren + maxInfants;
    const effectiveCapacity = engine?.allowExtraMattress
      ? baseCapacity + 1
      : baseCapacity;
    return Math.ceil(guests / effectiveCapacity);
  };

  // Auto update rooms when guests change
  const updateRoomsFromGuests = (newRoomGuests: RoomGuest[]) => {
    if (availableRooms.length === 0) return newRoomGuests;
    const firstRoom = availableRooms[0];

   let totalRoomsNeeded = 0;
    const maxAdults = firstRoom.maxAdults || 2;
    const maxChildren = firstRoom.maxChildren || 0;

    const totalAdults = newRoomGuests.reduce((sum, r) => sum + r.adults, 0);
    const totalChildren = newRoomGuests.reduce((sum, r) => sum + r.children, 0);
    const totalExtraMattress = newRoomGuests.reduce((sum, r) => sum + r.extraMattress, 0);

    // Total people
    const totalPeople = totalAdults + totalChildren;
    
    // Base capacity per room (adults + children default)
    const baseCapacity = maxAdults + maxChildren;
    
    // Extra people jo ek room ki capacity se zyada hain
    const extraPeople = Math.max(0, totalPeople - baseCapacity);

    // Logic:
    // 1. Agar extra people = 0 → 1 room
    // 2. Agar extra people > 0 AND extra mattress >= extraPeople AND extraPeople <= 1 → 1 room
    // 3. Warna → Math.ceil(totalPeople / baseCapacity) rooms
    if (extraPeople === 0) {
      totalRoomsNeeded = 1;
    } else if (engine?.allowExtraMattress && totalExtraMattress >= extraPeople && extraPeople <= 1) {
      totalRoomsNeeded = 1;
    } else {
      totalRoomsNeeded = Math.ceil(totalPeople / baseCapacity);
    }
    totalRoomsNeeded = Math.max(1, totalRoomsNeeded);

    const currentRooms = newRoomGuests.length;

    if (totalRoomsNeeded > currentRooms) {
      const toAdd = totalRoomsNeeded - currentRooms;
      const added = Array.from({ length: toAdd }, () => ({
        roomId: "", adults: 0, children: 0, extraMattress: 0
      }));
      return [...newRoomGuests, ...added];
    } else if (totalRoomsNeeded < currentRooms) {
      return newRoomGuests.slice(0, totalRoomsNeeded);
    }
    return newRoomGuests;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!hotel || !engine?.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700">🏨 Hotel not found</p>
          <p className="text-gray-500 mt-2">This booking page is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#4a5568] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
              <span className="text-3xl">🏨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{hotel.name.toUpperCase()}</h1>
              <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-300">
                {hotel.address && <span>📍 {hotel.address}</span>}
                {hotel.phone && <span>📞 {hotel.phone}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Check In */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">CHECK IN</label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Check Out */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">CHECK OUT</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckOut(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Rooms & Guests */}
            <div className="relative">
              <label className="text-xs text-gray-500 block mb-1">ROOMS & GUESTS</label>
              <button
                onClick={() => setShowGuestPicker(!showGuestPicker)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white hover:border-blue-400 min-w-[160px] text-left"
              >
                {totalRooms} Room{totalRooms > 1 ? "s" : ""}, {totalGuests} Guest{totalGuests > 1 ? "s" : ""}
              </button>

              {/* Guest Picker Dropdown */}
              {showGuestPicker && (
                <div className="absolute top-16 left-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-80 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-800">Rooms & Guests</span>
                    <button onClick={() => setShowGuestPicker(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>

                  {/* Total Rooms */}
                  <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <span className="text-sm text-gray-700">Total No. of Rooms</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (roomGuests.length > 1) {
                            setRoomGuests(prev => prev.slice(0, -1));
                          }
                        }}
                        className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >—</button>
                      <span className="font-medium">{roomGuests.length}</span>
                      <button
                        onClick={() => setRoomGuests(prev => [...prev, { roomId: "", adults: 2, children: 0, extraMattress: 0 }])}
                        className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >+</button>
                    </div>
                  </div>

                  {/* Per Room */}
                  {roomGuests.map((rg, i) => (
                    <div key={i} className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Room {i + 1}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Adults</p>
                          <div className="flex items-center gap-2">
                           <button onClick={() => {
                              if (rg.adults > 1) {
                                const updated = roomGuests.map((r, idx) => idx === i ? { ...r, adults: r.adults - 1 } : r);
                                setRoomGuests(updateRoomsFromGuests(updated));
                              }
                            }} className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center">—</button>
                            <span>{rg.adults}</span>
                           <button onClick={() => {
                              const updated = roomGuests.map((r, idx) => idx === i ? { ...r, adults: r.adults + 1 } : r);
                              setRoomGuests(updateRoomsFromGuests(updated));
                            }} className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center">+</button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Children (0-12)</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => {
                              if (rg.children > 0) {
                                setRoomGuests(prev => prev.map((r, idx) => idx === i ? { ...r, children: r.children - 1 } : r));
                              }
                            }} className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center">—</button>
                            <span>{rg.children}</span>
                           <button onClick={() => {
                              const updated = roomGuests.map((r, idx) => idx === i ? { ...r, children: r.children + 1 } : r);
                              setRoomGuests(updateRoomsFromGuests(updated));
                            }} className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center">+</button>
                          </div>
                        </div>
                      </div>
                      {/* Extra Mattress */}
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Extra Mattress</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => {
                            if (rg.extraMattress > 0) {
                              const updated = roomGuests.map((r, idx) => idx === i ? { ...r, extraMattress: r.extraMattress - 1 } : r);
                              setRoomGuests(updateRoomsFromGuests(updated));
                            }
                          }} className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center">—</button>
                          <span>{rg.extraMattress}</span>
                        <button onClick={() => {
                            if (rg.extraMattress < 1) {
                              const updated = roomGuests.map((r, idx) => idx === i ? { ...r, extraMattress: r.extraMattress + 1 } : r);
                              setRoomGuests(updateRoomsFromGuests(updated));
                            }
                          }} className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center">+</button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowGuestPicker(false)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Check Availability */}
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              {searching ? "Searching..." : "Check Availability"}
            </button>
          </div>

          {/* Stay info */}
          {checkIn && checkOut && (
            <p className="text-xs text-gray-500 mt-2">
              📅 {new Date(checkIn).toLocaleDateString("en-IN")} → {new Date(checkOut).toLocaleDateString("en-IN")} • {calculateNights()} Night{calculateNights() > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Rooms Section */}
        {step === "rooms" && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Select Room ({totalGuests} Guest{totalGuests > 1 ? "s" : ""})
            </h2>

            {availableRooms.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border">
                <p className="text-gray-500 text-lg">😔 No rooms available for selected dates</p>
                <p className="text-gray-400 text-sm mt-2">Please try different dates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Group by type */}
                {Object.entries(
                  availableRooms.reduce((acc: any, room) => {
                    if (!acc[room.type]) acc[room.type] = [];
                    acc[room.type].push(room);
                    return acc;
                  }, {})
                ).map(([type, rooms]: any) => (
                  <div key={type} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Room Header */}
                    <div className="flex gap-4 p-6">
                      {/* Image */}
                      <div className="w-48 h-36 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {engine?.galleryImages?.[0] ? (
                          <img src={engine.galleryImages[0]} alt={type} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🛏️</div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{type}</h3>
                       <p className="text-sm text-gray-500 mt-1">
                          👥 Max {rooms[0].maxAdults} Adults, {rooms[0].maxChildren} Children
                        </p>
                        <p className="text-sm text-gray-500">{rooms.length} room{rooms.length > 1 ? "s" : ""} available</p>
                        {rooms[0].bedType && <p className="text-sm text-gray-500">🛏️ {rooms[0].bedType}</p>}
                        {rooms[0].roomSize && <p className="text-sm text-gray-500">📐 {rooms[0].roomSize}</p>}
                        {rooms[0].roomView && <p className="text-sm text-gray-500">🪟 {rooms[0].roomView}</p>}
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">₹{rooms[0].price}</p>
                        <p className="text-xs text-gray-400">per night</p>
                        {calculateNights() > 0 && (
                          <p className="text-sm font-medium text-gray-600 mt-1">
                            Total: ₹{rooms[0].price * calculateNights()}
                          </p>
                        )}
                        <button
                          onClick={() => handleSelectRoom(rooms[0])}
                          className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                            selectedRooms.find(r => r.type === type)
                              ? "bg-green-500 text-white"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {selectedRooms.find(r => r.type === type) ? "✅ Selected" : "Select Room"}
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-t border-gray-100">
                      <div className="flex gap-6 px-6 pt-3">
                        {["amenities", "description", "photos", "attractions"].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveRoomTab(tab as any)}
                            className={`text-sm pb-2 capitalize font-medium border-b-2 transition ${
                              activeRoomTab === tab
                                ? "border-purple-600 text-purple-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      <div className="px-6 py-4">
                        {activeRoomTab === "amenities" && (
                          <div className="flex flex-wrap gap-2">
                            {engine?.amenities?.length ? engine.amenities.map(a => (
                              <span key={a} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{a}</span>
                            )) : <p className="text-gray-400 text-sm">No amenities added</p>}
                          </div>
                        )}
                        {activeRoomTab === "description" && (
                          <p className="text-sm text-gray-600">{engine?.description || "No description available"}</p>
                        )}
                        {activeRoomTab === "photos" && (
                          <div className="grid grid-cols-4 gap-3">
                            {engine?.galleryImages?.length ? engine.galleryImages.map((img, i) => (
                              <img key={i} src={img} alt="" className="h-24 w-full object-cover rounded-lg" />
                            )) : <p className="text-gray-400 text-sm">No photos added</p>}
                          </div>
                        )}
                        {activeRoomTab === "attractions" && (
                          <div className="grid grid-cols-2 gap-2">
                            {engine?.nearestAttractions?.length ? engine.nearestAttractions.map((a, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-700">📍 {a.name}</span>
                                <span className="text-gray-400">{a.distance}</span>
                              </div>
                            )) : <p className="text-gray-400 text-sm">No attractions added</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Rooms Summary */}
            {selectedRooms.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">{selectedRooms.length} Room{selectedRooms.length > 1 ? "s" : ""} Selected</p>
                    <p className="text-sm text-gray-500">Total: ₹{calculateTotal()} for {calculateNights()} night{calculateNights() > 1 ? "s" : ""}</p>
                  </div>
                  <button
                    onClick={() => setStep("details")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Guest Details */}
        {step === "details" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Guest Details</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Apna naam daalo"
                    value={guestForm.name}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                  <input
                    type="email"
                    placeholder="apna@email.com"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Special Requests</label>
                  <textarea
                    placeholder="Koi special request? (Optional)"
                    value={guestForm.specialRequests}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <h4 className="font-semibold text-gray-800 mb-3">📋 Booking Summary</h4>
                {selectedRooms.map((room, i) => (
                  <div key={i} className="flex justify-between text-sm mb-2">
                    <span>{room.type} Room</span>
                    <span>₹{room.price} × {calculateNights()} nights = ₹{room.price * calculateNights()}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">₹{calculateTotal()}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep("rooms")}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    if (!guestForm.name || !guestForm.email || !guestForm.phone) {
                      alert("Sab fields bharo!");
                      return;
                    }
                    setStep("payment");
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                >
                  Proceed to Payment →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment */}
        {step === "payment" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Payment</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">📋 Order Summary</h4>
                <p className="text-sm text-gray-600">Guest: {guestForm.name}</p>
                <p className="text-sm text-gray-600">Rooms: {selectedRooms.length}</p>
                <p className="text-sm text-gray-600">Nights: {calculateNights()}</p>
                <p className="text-xl font-bold text-blue-600 mt-2">Total: ₹{calculateTotal()}</p>
              </div>

              <p className="text-sm text-gray-500 text-center mb-4">
                🔒 Secure payment powered by Razorpay
              </p>

              <button
                onClick={() => alert("Razorpay integration coming soon! Real keys needed.")}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700"
              >
                💳 Pay ₹{calculateTotal()}
              </button>

              <button
                onClick={() => setStep("details")}
                className="w-full py-2 mt-3 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Default — Hotel Info */}
        {step === "search" && (
          <div className="mt-6">
            {engine?.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">🏨 About {hotel.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{engine.description}</p>
              </div>
            )}

            {engine?.amenities && engine.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">✨ Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {engine.amenities.map(a => (
                    <span key={a} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full border border-blue-100">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {engine?.galleryImages && engine.galleryImages.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">🖼️ Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {engine.galleryImages.map((img, i) => (
                    <img key={i} src={img} alt="" className="h-40 w-full object-cover rounded-xl" />
                  ))}
                </div>
              </div>
            )}

            {engine?.nearestAttractions && engine.nearestAttractions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3">📍 Nearest Attractions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {engine.nearestAttractions.map((a, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
                      <span className="text-sm text-gray-700">📍 {a.name}</span>
                      <span className="text-sm text-gray-500 font-medium">{a.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}