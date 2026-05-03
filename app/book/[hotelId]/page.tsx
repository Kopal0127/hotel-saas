"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// --- Types & Interfaces ---
interface Hotel { id: string; name: string; address: string; phone: string; }
interface Room { id: string; type: string; price: number; maxAdults: number; }
interface BookingEngine { description: string; galleryImages: string[]; isActive: boolean; }
interface RoomGuest { adults: number; children: number; infants: number; extraMattress: number; }

export default function PublicBookingPage() {
  const params = useParams();
  const hotelId = params.hotelId as string;

  // States
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [engine, setEngine] = useState<BookingEngine | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [step, setStep] = useState<"search" | "rooms" | "details" | "payment">("search");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  
  // Default: 1 Room with 2 Adults
  const [roomGuests, setRoomGuests] = useState<RoomGuest[]>([
    { adults: 2, children: 0, infants: 0, extraMattress: 0 }
  ]);

  const [selectedRooms, setSelectedRooms] = useState<any[]>([]);

  // --- Calculations for Top Summary Bar ---
  const totalRooms = roomGuests.length;
  const totalAdults = roomGuests.reduce((sum, r) => sum + r.adults, 0);
  const totalChildren = roomGuests.reduce((sum, r) => sum + r.children, 0);
  const totalInfants = roomGuests.reduce((sum, r) => sum + r.infants, 0);
  const totalMattress = roomGuests.reduce((sum, r) => sum + r.extraMattress, 0);

  useEffect(() => {
    fetchHotelData();
  }, [hotelId]);

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
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!checkIn || !checkOut) return alert("Please select check-in and check-out dates.");
    setSearching(true);
    try {
      const res = await fetch(`/api/public/rooms?hotelId=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}`);
      const data = await res.json();
      setAvailableRooms(data.rooms || []);
      setStep("rooms");
    } catch (error) {
      alert("Error searching rooms.");
    } finally {
      setSearching(false);
    }
  };

  // --- Guest Selection Handlers ---
  const addNewRoom = () => {
    setRoomGuests([...roomGuests, { adults: 2, children: 0, infants: 0, extraMattress: 0 }]);
  };

  const removeRoom = (index: number) => {
    if (roomGuests.length > 1) {
      setRoomGuests(roomGuests.filter((_, i) => i !== index));
    }
  };

  const updateCount = (index: number, field: keyof RoomGuest, value: number) => {
    const updated = [...roomGuests];
    updated[index] = { ...updated[index], [field]: value };
    setRoomGuests(updated);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-blue-600">Loading Hotel Engine...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-[#4a5568] text-white p-6 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">{hotel?.name?.toUpperCase() || "HOTEL NAME"}</h1>
          <p className="text-sm opacity-90 mt-1">📍 {hotel?.address || "Hotel Location Address"}</p>
        </div>
      </div>

      {/* Sticky Booking Bar */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto p-4 flex flex-wrap gap-4 items-end">
          
          <div className="flex gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 mb-1">CHECK IN</span>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 mb-1">CHECK OUT</span>
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="relative flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 mb-1">ROOMS & GUESTS</span>
            <button 
              onClick={() => setShowGuestPicker(!showGuestPicker)}
              className="border p-2 rounded-lg text-left bg-white min-w-[280px] hover:border-blue-400 transition-all"
            >
              <div className="font-bold text-gray-800 text-sm">
                {totalRooms} {totalRooms > 1 ? "Rooms" : "Room"}
              </div>
              <div className="text-[11px] text-gray-500 font-medium leading-none mt-1">
                {totalAdults} Adults, {totalChildren} Children, {totalInfants} Infants, {totalMattress} Mattress
              </div>
            </button>

            {/* Guest Picker Popup */}
            {showGuestPicker && (
              <div className="absolute top-16 left-0 bg-white border shadow-2xl rounded-2xl w-[350px] p-4 z-50 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <span className="font-extrabold text-gray-800">Rooms & Guests</span>
                  <button onClick={() => setShowGuestPicker(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                <div className="max-h-[380px] overflow-y-auto pr-2 space-y-4 mb-4">
                  {roomGuests.map((rg, i) => (
                    <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl relative">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-gray-700">Room {i+1}</span>
                        {roomGuests.length > 1 && (
                          <button onClick={() => removeRoom(i)} className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded">Remove</button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        {/* Adults */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Adults</p>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateCount(i, 'adults', Math.max(1, rg.adults - 1))} className="w-8 h-8 border rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-gray-100">—</button>
                            <span className="font-bold text-sm">{rg.adults}</span>
                            <button disabled className="w-8 h-8 border rounded-lg bg-gray-50 text-gray-300 flex items-center justify-center cursor-not-allowed">+</button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Children (0-12)</p>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateCount(i, 'children', Math.max(0, rg.children - 1))} className="w-8 h-8 border rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-gray-100">—</button>
                            <span className="font-bold text-sm">{rg.children}</span>
                            <button disabled className="w-8 h-8 border rounded-lg bg-gray-50 text-gray-300 flex items-center justify-center cursor-not-allowed">+</button>
                          </div>
                        </div>

                        {/* Infants */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Infants (0-2)</p>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateCount(i, 'infants', Math.max(0, rg.infants - 1))} className="w-8 h-8 border rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-gray-100">—</button>
                            <span className="font-bold text-sm">{rg.infants}</span>
                            <button disabled className="w-8 h-8 border rounded-lg bg-gray-50 text-gray-300 flex items-center justify-center cursor-not-allowed">+</button>
                          </div>
                        </div>

                        {/* Extra Mattress - ENABLED */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-blue-600 uppercase">Extra Mattress</p>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateCount(i, 'extraMattress', Math.max(0, rg.extraMattress - 1))} className="w-8 h-8 border rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-gray-100">—</button>
                            <span className="font-bold text-sm">{rg.extraMattress}</span>
                            <button onClick={() => updateCount(i, 'extraMattress', rg.extraMattress + 1)} className="w-8 h-8 border-2 border-blue-500 text-blue-600 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-blue-50">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={addNewRoom} 
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all mb-4"
                >
                  + Add New Room
                </button>

                <button onClick={() => setShowGuestPicker(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-transform">
                  Done
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={handleSearch} 
            disabled={searching}
            className="bg-purple-600 text-white px-8 h-[42px] rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
          >
            {searching ? "Searching..." : "Check Availability"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto p-6">
        {step === "rooms" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Select Your Room</h2>
            {availableRooms.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border text-center text-gray-500">
                No rooms available for the selected criteria. Try changing dates.
              </div>
            ) : (
              availableRooms.map((room) => (
                <div key={room.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl">🛏️</div>
                    <div>
                      <h3 className="font-bold text-2xl text-gray-800">{room.type}</h3>
                      <p className="text-sm text-gray-500 font-medium">👥 Max Capacity: {room.maxAdults} Adults</p>
                      <div className="mt-2 flex gap-2">
                         <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Free Cancellation</span>
                         <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Breakfast Included</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-4xl font-black text-blue-600">₹{room.price}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase mb-4">per night</div>
                    <button className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all">
                      Select
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {step === "search" && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="text-7xl mb-4">🏨</div>
            <p className="text-lg font-medium">Please select dates and guests to search for rooms.</p>
          </div>
        )}
      </div>
    </div>
  );
}