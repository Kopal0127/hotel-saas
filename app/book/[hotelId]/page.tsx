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
  defaultAdultStay: number;
  defaultChildStay: number;
  defaultInfantStay: number;
  extraMattressLimit: number;
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
  infants: number;
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

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [roomGuests, setRoomGuests] = useState<RoomGuest[]>([
    { roomId: "", adults: 2, children: 0, infants: 0, extraMattress: 0 }
  ]);

  const [selectedRooms, setSelectedRooms] = useState<any[]>([]);

  const [guestForm, setGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

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

  // --- ROOMS & GUEST LOGIC UPDATED ---
  const addNewRoom = () => {
    setRoomGuests(prev => [...prev, { roomId: "", adults: 2, children: 0, infants: 0, extraMattress: 0 }]);
  };

  const removeRoom = (index: number) => {
    if (roomGuests.length > 1) {
      setRoomGuests(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateGuestCount = (index: number, field: keyof RoomGuest, value: number) => {
    const updated = [...roomGuests];
    updated[index] = { ...updated[index], [field]: value };
    setRoomGuests(updated);
  };

  const totalGuests = roomGuests.reduce((sum, r) => sum + r.adults + r.children, 0);
  const totalRooms = roomGuests.length;

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
    <div className="min-h-screen bg-gray-50 pb-24">
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
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1 font-bold">CHECK IN</label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1 font-bold">CHECK OUT</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckOut(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <label className="text-xs text-gray-500 block mb-1 font-bold">ROOMS & GUESTS</label>
              <button
                onClick={() => setShowGuestPicker(!showGuestPicker)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white hover:border-blue-400 min-w-[180px] text-left font-medium"
              >
                {totalRooms} Room{totalRooms > 1 ? "s" : ""}, {totalGuests} Guest{totalGuests > 1 ? "s" : ""}
              </button>

              {showGuestPicker && (
                <div className="absolute top-16 left-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-80 p-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <span className="font-bold text-gray-800">Rooms & Guests</span>
                    <button onClick={() => setShowGuestPicker(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>

                  {roomGuests.map((rg, i) => (
                    <div key={i} className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-gray-700">Room {i + 1}</span>
                        {roomGuests.length > 1 && (
                          <button onClick={() => removeRoom(i)} className="text-xs text-red-500 font-medium">Remove</button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* Adults */}
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Adults</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateGuestCount(i, 'adults', Math.max(1, rg.adults - 1))} className="w-8 h-8 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100">—</button>
                            <span className="text-sm font-medium w-4 text-center">{rg.adults}</span>
                            <button disabled className="w-8 h-8 rounded border border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed flex items-center justify-center">+</button>
                          </div>
                        </div>

                        {/* Children */}
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Children (0-12)</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateGuestCount(i, 'children', Math.max(0, rg.children - 1))} className="w-8 h-8 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100">—</button>
                            <span className="text-sm font-medium w-4 text-center">{rg.children}</span>
                            <button disabled className="w-8 h-8 rounded border border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed flex items-center justify-center">+</button>
                          </div>
                        </div>

                        {/* Infants */}
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Infants (0-2)</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateGuestCount(i, 'infants', Math.max(0, rg.infants - 1))} className="w-8 h-8 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100">—</button>
                            <span className="text-sm font-medium w-4 text-center">{rg.infants}</span>
                            <button disabled className="w-8 h-8 rounded border border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed flex items-center justify-center">+</button>
                          </div>
                        </div>

                        {/* Extra Mattress - ENABLED */}
                        <div>
                          <p className="text-[10px] text-blue-600 uppercase font-bold mb-1">Extra Mattress</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateGuestCount(i, 'extraMattress', Math.max(0, rg.extraMattress - 1))} className="w-8 h-8 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100">—</button>
                            <span className="text-sm font-medium w-4 text-center">{rg.extraMattress}</span>
                            <button onClick={() => updateGuestCount(i, 'extraMattress', rg.extraMattress + 1)} className="w-8 h-8 rounded border border-blue-500 text-blue-600 bg-white flex items-center justify-center hover:bg-blue-50">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addNewRoom}
                    className="w-full py-2 mb-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
                  >
                    + Add New Room
                  </button>

                  <button
                    onClick={() => setShowGuestPicker(false)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 h-[38px]"
            >
              {searching ? "Searching..." : "Check Availability"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {step === "rooms" && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Select Room ({totalGuests} Guests)</h2>

            {availableRooms.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border">
                <p className="text-gray-500 text-lg">😔 No rooms available for selected dates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(
                  availableRooms.reduce((acc: any, room) => {
                    if (!acc[room.type]) acc[room.type] = [];
                    acc[room.type].push(room);
                    return acc;
                  }, {})
                ).map(([type, rooms]: any) => (
                  <div key={type} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-4 p-6">
                      <div className="w-full md:w-48 h-36 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {engine?.galleryImages?.[0] ? (
                          <img src={engine.galleryImages[0]} alt={type} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🛏️</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{type}</h3>
                        <p className="text-sm text-gray-500 mt-1">👥 Max {rooms[0].maxAdults} Adults, {rooms[0].maxChildren} Children</p>
                        <p className="text-sm text-gray-500 font-medium text-green-600">{rooms.length} rooms available</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">₹{rooms[0].price}</p>
                        <p className="text-xs text-gray-400">per night</p>
                        <button
                          onClick={() => handleSelectRoom(rooms[0])}
                          className={`mt-3 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                            selectedRooms.find(r => r.id === rooms[0].id)
                              ? "bg-green-500 text-white"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {selectedRooms.find(r => r.id === rooms[0].id) ? "✅ Selected" : "Select Room"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ... Rest of steps (details, payment) same as original ... */}
        {step === "details" && (
           <div className="max-w-2xl mx-auto">
             <h2 className="text-lg font-bold text-gray-800 mb-4">Guest Details</h2>
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <div className="grid grid-cols-1 gap-4">
                 <div>
                   <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
                   <input type="text" placeholder="Full name" value={guestForm.name} onChange={(e) => setGuestForm(prev => ({ ...prev, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                 </div>
                 <div>
                   <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                   <input type="email" placeholder="email@example.com" value={guestForm.email} onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                 </div>
                 <div>
                   <label className="text-sm font-medium text-gray-700 mb-1 block">Phone *</label>
                   <input type="tel" placeholder="10-digit number" value={guestForm.phone} onChange={(e) => setGuestForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                 </div>
               </div>
               <div className="flex gap-3 mt-6">
                 <button onClick={() => setStep("rooms")} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold">Back</button>
                 <button onClick={() => setStep("payment")} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Proceed to Payment</button>
               </div>
             </div>
           </div>
        )}

        {step === "payment" && (
          <div className="max-w-2xl mx-auto text-center py-10">
            <h2 className="text-2xl font-bold mb-4">Ready to Book?</h2>
            <div className="bg-white p-6 rounded-2xl border shadow-sm mb-6">
              <p className="text-3xl font-bold text-blue-600 mb-2">Total: ₹{calculateTotal()}</p>
              <p className="text-gray-500">Secure payment via Razorpay</p>
            </div>
            <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xl" onClick={() => alert("Redirecting to Gateway...")}>Pay Now</button>
          </div>
        )}

        {/* Home/Search View */}
        {step === "search" && (
          <div className="mt-6 space-y-6">
            {engine?.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-lg font-bold mb-3">About {hotel.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{engine.description}</p>
              </div>
            )}
            {engine?.galleryImages && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {engine.galleryImages.slice(0, 4).map((img, i) => (
                   <img key={i} src={img} className="h-32 w-full object-cover rounded-xl" alt="hotel" />
                 ))}
               </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      {selectedRooms.length > 0 && step === "rooms" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-4 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800 text-lg">{selectedRooms.length} Room Selected</p>
              <p className="text-sm text-blue-600 font-bold">Total: ₹{calculateTotal()} ({calculateNights()} Nights)</p>
            </div>
            <button
              onClick={() => setStep("details")}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700"
            >
              Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}