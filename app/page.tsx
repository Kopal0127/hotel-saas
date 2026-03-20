export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-6 text-gray-600 text-sm">
          <a href="#" className="hover:text-blue-600">Features</a>
          <a href="#" className="hover:text-blue-600">Pricing</a>
          <a href="#" className="hover:text-blue-600">Contact</a>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-24 px-8">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Manage Your Hotels<br />
          <span className="text-blue-600">All In One Place</span>
        </h2>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Booking engine, channel manager, OTA sync, Google Hotel Centre — 
          sab kuch ek platform pe. Apne hotels ko aaj se smarter banao.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700">
            Free Trial Shuru Karo
          </button>
          <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg hover:bg-gray-50">
            Demo Dekho
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20 px-8">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-14">
          Kya Milega Aapko?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">🏨</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Hotel Management</h4>
            <p className="text-gray-500">Rooms, staff, housekeeping — sab ek jagah manage karo.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">📅</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Booking Engine</h4>
            <p className="text-gray-500">Direct bookings lao, OTA commission bachao.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">🌐</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Channel Manager</h4>
            <p className="text-gray-500">MakeMyTrip, Booking.com, Expedia — sab sync ek screen pe.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        © 2026 HotelPro. All rights reserved.
      </footer>

    </div>
  );
}