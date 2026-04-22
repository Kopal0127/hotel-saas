"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/Toast";
import { useToast } from "@/components/useToast";
import { useAuth } from "@/components/useAuth";

export default function CheckedInRoomsPage() {
  useAuth();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [checkedInRooms, setCheckedInRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckedInRooms();
  }, []);

  const fetchCheckedInRooms = async () => {
    setLoading(true);
    try {
      const hotelsRes = await fetch("/api/hotels");
      const hotelsData = await hotelsRes.json();
      if (!hotelsData.hotels?.[0]?.id) return;

      const hotelId = hotelsData.hotels[0].id;
      const res = await fetch(`/api/bookings?hotelId=${hotelId}`);
      const data = await res.json();

      const checkedIn = (data.bookings || [])
        .filter((b: any) => b.status === "CHECKED_IN")
        .map((b: any) => ({
          id: b.id,
          roomNumber: b.roomNumber,
          roomType: b.roomType,
          guestName: b.guestName,
          guestEmail: b.guestEmail,
          guestPhone: b.guestPhone,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          adults: b.adults || 1,
          children: b.children || 0,
          infants: b.infants || 0,
        }));

      setCheckedInRooms(checkedIn);
    } catch (error) {
      showToast("Data load nahi ho saka!", "error");
    }
    setLoading(false);
  };

  const handleRoomClick = (roomId: string) => {
    router.push(`/dashboard/room-service?roomId=${roomId}`);
  };

  // Group by room type
  const groupedRooms = checkedInRooms.reduce((acc: any, room: any) => {
    if (!acc[room.roomType]) acc[room.roomType] = [];
    acc[room.roomType].push(room);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3 md:gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">🛎️ Room Service — Checked-in Rooms</h2>
            <p className="text-gray-500 text-sm mt-1">Koi bhi room select karo order lene ke liye</p>
          </div>
          <button onClick={() => router.push("/dashboard/room-service")}
            className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 font-medium">
            Skip → Go to POS
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
            ⏳ Loading...
          </div>
        ) : checkedInRooms.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
            <div className="text-5xl mb-4">🏨</div>
            <p className="font-medium">Koi checked-in room nahi hai</p>
            <p className="text-sm mt-1">Pehle Bookings mein jaake kisi booking ko Check-in karo!</p>
            <button onClick={() => router.push("/dashboard/bookings")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Go to Bookings
            </button>
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
                      <p className="text-xs text-gray-500">{typeRooms.length} checked-in room{typeRooms.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                    {typeRooms.length} Rooms
                  </span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {typeRooms.map((room: any) => (
                      <div key={room.id}
                        onClick={() => handleRoomClick(room.id)}
                        className="bg-green-50 border border-green-200 rounded-xl p-4 text-center hover:bg-green-100 hover:border-green-400 hover:shadow-md cursor-pointer transition-all">
                        <div className="text-2xl mb-2">🛏️</div>
                        <div className="text-sm font-bold text-gray-900">#{room.roomNumber}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{room.roomType}</div>
                        <div className="border-t border-green-200 my-2"></div>
                        <div className="text-xs font-medium text-gray-700 truncate">{room.guestName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {room.adults} Adult{room.adults > 1 ? "s" : ""}
                          {room.children > 0 ? ` / ${room.children} C` : ""}
                          {room.infants > 0 ? ` / ${room.infants} I` : ""}
                        </div>
                        <div className="text-xs text-blue-600 font-medium mt-2">Tap to order →</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}