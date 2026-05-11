"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const featureItems = [
  { label: "Hotel Management", icon: "🏨" },
  { label: "Booking Engine", icon: "📅" },
  { label: "Channel Manager", icon: "🌐" },
  { label: "Revenue Management", icon: "📊" },
  { label: "Restaurant Software", icon: "🍽️" },
  { label: "Reports & Analytics", icon: "📋" },
  { label: "Housekeeping & Room Service", icon: "🧹" },
  { label: "Inventory & Maintenance", icon: "🔧" },
  { label: "Staff Login and Attendance", icon: "👥" },
];

const softwareItems = [
  { label: "OTA Channel Manager Software", icon: "🌐" },
  { label: "Property Management System (PMS) Software", icon: "🏨" },
  { label: "Hotel Booking Engine Software", icon: "📅" },
  { label: "Revenue Management Software", icon: "📊" },
  { label: "Restaurant Software", icon: "🍽️" },
];

const aboutItems = [
  { label: "About Company", icon: "🏢" },
  { label: "Why Choose Us", icon: "✅" },
  { label: "Blogs", icon: "📝" },
  { label: "Partner Program", icon: "🤝" },
  { label: "Clients Reviews", icon: "⭐" },
];

const customFeatures = [
  { name: "Hotel Management (PMS)", price: 999 },
  { name: "Booking Engine", price: 499 },
  { name: "Channel Manager", price: 999 },
];

const complementaryFeatures = [
  "Revenue Management",
  "Restaurant Software",
  "Reports & Analytics",
  "Housekeeping & Room Service",
  "Inventory & Maintenance",
  "Staff Login and Attendance",
];

const channelManagerFeatures = [
  "OTA",
  "Metasearch - Aggregators",
];

const allPlanFeatures = [
  "Hotel Management (PMS)",
  "Booking Engine",
  "Channel Manager",
  "Revenue Management",
  "Restaurant Software",
  "Reports & Analytics",
  "Housekeeping & Room Service",
  "Inventory & Maintenance",
  "Staff Login and Attendance",
];

function CustomPlanCard({ onDemo }: { onDemo: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (name: string) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  const total = customFeatures
    .filter(f => selected.includes(f.name))
    .reduce((sum, f) => sum + f.price, 0);

  const hotelAdded = selected.includes("Hotel Management (PMS)");

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex-1 max-w-sm z-10" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
      <div className="relative p-8 text-white text-center" style={{ minHeight: "160px", background: "linear-gradient(to bottom, #2dd4bf, #14b8a6)" }}>
        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none">
          <div className="absolute w-16 h-16 rounded-full bg-white opacity-10" style={{ top: "10px", left: "20px" }}></div>
          <div className="absolute w-8 h-8 rounded-full bg-white opacity-10" style={{ top: "40px", right: "30px" }}></div>
        </div>
        <div className="relative z-10">
          <span className="inline-block border border-white border-opacity-60 text-white text-xs px-5 py-1.5 rounded-full mb-4">Custom Plan</span>
          <p className="text-5xl font-bold mb-1">₹{total.toLocaleString("en-IN")}</p>
          <p className="text-teal-100 text-sm">Customized for you</p>
        </div>
      </div>
      <div className="text-left">
        {customFeatures.map((f, i) => (
          <div key={i}>
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-700">{f.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">₹{f.price}</span>
                <button
                  onClick={() => toggle(f.name)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold transition ${
                    selected.includes(f.name)
                      ? "bg-teal-500 border-teal-500 text-white"
                      : "border-gray-300 text-gray-400 hover:border-teal-400"
                  }`}
                >
                  {selected.includes(f.name) ? "−" : "+"}
                </button>
              </div>
            </div>
         {f.name === "Hotel Management (PMS)" &&
              complementaryFeatures.map((c, j) => (
                <div key={j} className="flex items-center justify-between px-6 py-2 border-b border-gray-50 bg-teal-50">
                  <span className="text-xs text-teal-700">✓ {c}</span>
                  {hotelAdded && <span className="text-xs bg-teal-100 text-teal-600 px-2 py-0.5 rounded-full">Free</span>}
                </div>
              ))
            }
            {f.name === "Channel Manager" &&
              ["OTA", "Metasearch - Aggregators"].map((c, j) => (
                <div key={j} className="flex items-center px-6 py-2 border-b border-gray-50 bg-teal-50">
                  <span className="text-xs text-teal-700">✓ {c}</span>
                </div>
              ))
            }
          </div>
        ))}
      </div>
      <div className="p-6">
        <button onClick={onDemo} className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition">
          Get Custom Quote
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [softwareOpen, setSoftwareOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    fullName: "",
    contactNo: "",
    mailId: "",
    hotelName: "",
    city: "",
    software: "",
    query: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const closeAll = () => {
    setSoftwareOpen(false);
    setAboutOpen(false);
    setFeaturesOpen(false);
  };

  const handleDemoSubmit = () => {
    if (!demoForm.fullName || !demoForm.contactNo || !demoForm.mailId) {
      alert("Full Name, Contact No aur Mail ID required hai!");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setDemoOpen(false);
      setSubmitted(false);
      setDemoForm({ fullName: "", contactNo: "", mailId: "", hotelName: "", city: "", software: "", query: "" });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white" onClick={closeAll}>

      {/* Demo Modal */}
      {demoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setDemoOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Demo Booked!</h3>
                <p className="text-gray-500">Hum aapse jald hi contact karenge.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Free Demo</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Full Name *</label>
                    <input type="text" placeholder="Apna naam daalo" value={demoForm.fullName}
                      onChange={(e) => setDemoForm(p => ({ ...p, fullName: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Contact No *</label>
                    <input type="tel" placeholder="10-digit mobile number" value={demoForm.contactNo}
                      onChange={(e) => setDemoForm(p => ({ ...p, contactNo: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Mail ID *</label>
                    <input type="email" placeholder="apna@email.com" value={demoForm.mailId}
                      onChange={(e) => setDemoForm(p => ({ ...p, mailId: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Hotel Name</label>
                    <input type="text" placeholder="Aapke hotel ka naam" value={demoForm.hotelName}
                      onChange={(e) => setDemoForm(p => ({ ...p, hotelName: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">City</label>
                    <input type="text" placeholder="Aapka shehar" value={demoForm.city}
                      onChange={(e) => setDemoForm(p => ({ ...p, city: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Software</label>
                    <select value={demoForm.software}
                      onChange={(e) => setDemoForm(p => ({ ...p, software: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                      <option value="">Software select karo</option>
                      {softwareItems.map(s => (
                        <option key={s.label} value={s.label}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Ask Your Query</label>
                    <textarea placeholder="Aapka sawaal yahan likhein..." rows={3} value={demoForm.query}
                      onChange={(e) => setDemoForm(p => ({ ...p, query: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
                  </div>
                  <button onClick={handleDemoSubmit}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                    Submit Demo Request
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 sticky top-0 bg-white z-40">
        <h1 className="text-2xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-1 text-gray-600 text-sm items-center">
          <a href="#" className="px-4 py-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Home</a>

          <div className="relative" onMouseEnter={() => { setAboutOpen(true); setSoftwareOpen(false); setFeaturesOpen(false); }} onMouseLeave={() => setAboutOpen(false)}>
            <button
              onClick={() => { setAboutOpen(!aboutOpen); setSoftwareOpen(false); setFeaturesOpen(false); }}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1 ${aboutOpen ? "text-blue-600 bg-blue-50" : "hover:text-blue-600 hover:bg-blue-50"}`}>
              About Us
              <svg className={`w-3 h-3 transition-transform ${aboutOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {aboutOpen && (
              <div className="absolute top-10 left-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 w-52 py-2">
                {aboutItems.map(item => (
                <a key={item.label} href="#features" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                    <span>{item.icon}</span>{item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="relative" onMouseEnter={() => { setSoftwareOpen(true); setAboutOpen(false); setFeaturesOpen(false); }} onMouseLeave={() => setSoftwareOpen(false)}>
            <button
              onClick={() => { setSoftwareOpen(!softwareOpen); setAboutOpen(false); setFeaturesOpen(false); }}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1 ${softwareOpen ? "text-blue-600 bg-blue-50" : "hover:text-blue-600 hover:bg-blue-50"}`}>
              Softwares
              <svg className={`w-3 h-3 transition-transform ${softwareOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {softwareOpen && (
              <div className="absolute top-10 left-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 w-72 py-2">
                {softwareItems.map(item => (
                <a key={item.label} href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-b border-gray-100 last:border-0">
                    <span>{item.icon}</span>{item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href="#pricing" className="px-4 py-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Pricing</a>

          <div className="relative" onMouseEnter={() => { setFeaturesOpen(true); setSoftwareOpen(false); setAboutOpen(false); }} onMouseLeave={() => setFeaturesOpen(false)}>
            <button
              onClick={() => { setFeaturesOpen(!featuresOpen); setSoftwareOpen(false); setAboutOpen(false); }}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1 ${featuresOpen ? "text-blue-600 bg-blue-50" : "hover:text-blue-600 hover:bg-blue-50"}`}>
              Features
              <svg className={`w-3 h-3 transition-transform ${featuresOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {featuresOpen && (
              <div className="absolute top-10 left-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 w-64 py-2">
                {featureItems.map(item => (
                 <a key={item.label} href="#features" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-b border-gray-100 last:border-0">
                    <span>{item.icon}</span>{item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setDemoOpen(true)}
            className="border border-blue-600 text-blue-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">
            Book Demo Now
          </button>
          <button onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-24 px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          🚀 India ka #1 Hotel Management Software
        </div>
        <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Manage Your Hotels<br />
          <span className="text-blue-600">All In One Place</span>
        </h2>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Booking engine, channel manager, OTA sync, Google Hotel Centre —
          sab kuch ek platform pe. Apne hotels ko aaj se smarter banao.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Free Trial Shuru Karo
          </button>
          <button onClick={() => setDemoOpen(true)}
            className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition">
            Book Demo Now
          </button>
        </div>
        <div className="flex gap-8 justify-center mt-12 text-sm text-gray-500">
          <span>✅ No credit card required</span>
          <span>✅ 14-day free trial</span>
          <span>✅ Cancel anytime</span>
        </div>
      </section>

      {/* Software Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Our Softwares</h3>
            <p className="text-gray-500">Hotel management ke liye complete suite</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {softwareItems.map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-blue-50 rounded-2xl p-6 hover:bg-blue-100 transition cursor-pointer border border-blue-100">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{item.label}</h4>
                  <p className="text-sm text-gray-500">Hotel operations ko streamline karo aur revenue badhao.</p>
                </div>
                <div className="ml-auto text-blue-400">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Features</h3>
            <p className="text-gray-500">HotelPro ke saath apna hotel professionally manage karo</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🏨", title: "Hotel Management", desc: "Rooms, staff, housekeeping — sab ek jagah manage karo." },
              { icon: "📅", title: "Booking Engine", desc: "Direct bookings lao, OTA commission bachao." },
              { icon: "🌐", title: "Channel Manager", desc: "MakeMyTrip, Booking.com, Expedia — sab sync ek screen pe." },
              { icon: "📊", title: "Revenue Management", desc: "Smart pricing se revenue maximize karo." },
              { icon: "🍽️", title: "Restaurant Software", desc: "Hotel restaurant ko bhi ek jagah se manage karo." },
              { icon: "📋", title: "Reports & Analytics", desc: "16+ reports — revenue, occupancy, aur bahut kuch." },
              { icon: "🧹", title: "Housekeeping & Room Service", desc: "Housekeeping tasks aur room service ek jagah manage karo." },
              { icon: "🔧", title: "Inventory & Maintenance", desc: "Stock aur maintenance requests track karo easily." },
              { icon: "👥", title: "Staff Login and Attendance", desc: "Staff attendance, roles aur login ek platform pe." },
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h4>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Simple Pricing</h3>
          <p className="text-gray-500 mb-16">Apni zaroorat ke hisaab se plan chuno</p>
          <div className="flex items-end justify-center gap-0">

            {/* Monthly Plan */}
            <div className="bg-white rounded-2xl overflow-hidden flex-1 max-w-sm z-10" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
              <div className="relative p-8 text-white text-center" style={{ minHeight: "160px", background: "linear-gradient(to bottom, #a855f7, #9333ea)" }}>
                <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none">
                  <div className="absolute w-16 h-16 rounded-full bg-white opacity-10" style={{ top: "10px", left: "20px" }}></div>
                  <div className="absolute w-8 h-8 rounded-full bg-white opacity-10" style={{ top: "40px", right: "30px" }}></div>
                </div>
                <div className="relative z-10">
                  <span className="inline-block border border-white border-opacity-60 text-white text-xs px-5 py-1.5 rounded-full mb-4">Monthly Plan</span>
                  <p className="text-5xl font-bold mb-1">₹2,500</p>
                  <p className="text-purple-100 text-sm">Per Month</p>
                </div>
              </div>
              <div className="text-left">
                {allPlanFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3 text-sm text-gray-600 border-b border-gray-100">
                    <span className="text-green-500">✓</span>{f}
                  </div>
                ))}
              </div>
              <div className="p-6">
                <button onClick={() => setDemoOpen(true)} className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition">
                  Choose Monthly
                </button>
              </div>
            </div>

            {/* 3 Months Plan - Middle Elevated */}
            <div className="bg-white rounded-2xl overflow-hidden flex-1 max-w-sm relative z-20" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)", transform: "translateY(-24px)" }}>
              <div className="relative p-8 text-white text-center" style={{ minHeight: "160px", background: "linear-gradient(to bottom, #60a5fa, #3b82f6)" }}>
                <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none">
                  <div className="absolute w-16 h-16 rounded-full bg-white opacity-10" style={{ top: "10px", left: "20px" }}></div>
                  <div className="absolute w-8 h-8 rounded-full bg-white opacity-10" style={{ top: "40px", right: "30px" }}></div>
                </div>
                <div className="relative z-10">
                  <span className="inline-block border border-white border-opacity-60 text-white text-xs px-5 py-1.5 rounded-full mb-4">3 Months Plan</span>
                  <p className="text-5xl font-bold mb-1">₹4,999</p>
                  <p className="text-blue-100 text-sm">Per 3 Months</p>
                </div>
              </div>
              <div className="text-left">
                {allPlanFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3 text-sm text-gray-600 border-b border-gray-100">
                    <span className="text-green-500">✓</span>{f}
                  </div>
                ))}
              </div>
              <div className="p-6">
                <button onClick={() => setDemoOpen(true)} className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition">
                  Choose 3 Months
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">⭐ Most Popular</p>
              </div>
            </div>

            {/* Custom Plan */}
            <CustomPlanCard onDemo={() => setDemoOpen(true)} />

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-blue-600 text-center">
        <h3 className="text-3xl font-bold text-white mb-4">Ready to grow your hotel business?</h3>
        <p className="text-blue-100 mb-8 text-lg">Aaj hi free trial shuru karo — koi credit card nahi chahiye</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/login")}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition">
            Free Trial Shuru Karo
          </button>
          <button onClick={() => setDemoOpen(true)}
            className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition">
            Book Demo Now
          </button>
        </div>
      </section>

     {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 py-12 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h1 className="text-xl font-bold text-white mb-2">HotelPro</h1>
            <p className="text-sm">India ka #1 Hotel Management Software</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Refund Policy</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Contact Details</h4>
            <div className="flex flex-col gap-2 text-sm">
              <p>📞 8855936467</p>
              <p>📍 Shivaji Maharaj Nagar Mo:2, Manmad, Nashik, India - 423104</p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          © 2026 HotelPro. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
