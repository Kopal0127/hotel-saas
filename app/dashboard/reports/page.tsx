'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ReportsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [allPayments, setAllPayments] = useState<any[]>([])
  const [activeReport, setActiveReport] = useState<string | null>(null)
  const [hotelId, setHotelId] = useState("")

  const [filterType, setFilterType] = useState<"date_range" | "monthly">("monthly")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const YEARS = [2024, 2025, 2026, 2027]

  const reportCards = [
    { id: "total_reservation", title: "Total Reservation", desc: "Track your daily, weekly, monthly reservations from all sources.", icon: "📋", color: "bg-blue-50 border-blue-100 hover:bg-blue-100" },
    { id: "cancelled_reservation", title: "Cancelled Reservation", desc: "View all cancelled reservations and extract report with ease.", icon: "❌", color: "bg-red-50 border-red-100 hover:bg-red-100" },
    { id: "outstanding_payments", title: "Outstanding Payments", desc: "View all outstanding reservations and export detailed reports with ease.", icon: "💸", color: "bg-orange-50 border-orange-100 hover:bg-orange-100" },
    { id: "revenue_source", title: "Revenue by Source", desc: "View detailed revenue generated from each booking and sales source.", icon: "💰", color: "bg-yellow-50 border-yellow-100 hover:bg-yellow-100" },
    { id: "revenue_room_type", title: "Revenue by Room Type", desc: "Analyse revenue generated from each room type with detailed insights.", icon: "🏨", color: "bg-purple-50 border-purple-100 hover:bg-purple-100" },
    { id: "occupancy", title: "Occupancy & Daily Sales", desc: "Track your daily rooms occupancy and sales performance with detailed reports.", icon: "📈", color: "bg-cyan-50 border-cyan-100 hover:bg-cyan-100" },
    { id: "payment_received", title: "Payment Received", desc: "View all recorded payments and export detailed reports.", icon: "✅", color: "bg-green-50 border-green-100 hover:bg-green-100" },
    { id: "purchase", title: "Purchase", desc: "View and export all vendor-wise purchase reports.", icon: "🛒", color: "bg-orange-50 border-orange-100 hover:bg-orange-100" },
    { id: "expense", title: "Expense", desc: "View and export all category-wise expense reports.", icon: "🧾", color: "bg-red-50 border-red-100 hover:bg-red-100" },
    { id: "petty_cash", title: "Petty Cash", desc: "View and export all category-wise petty cash transactions.", icon: "💵", color: "bg-yellow-50 border-yellow-100 hover:bg-yellow-100" },
    { id: "invoices", title: "Invoices", desc: "View all invoices and export various reports.", icon: "🧾", color: "bg-cyan-50 border-cyan-100 hover:bg-cyan-100" },
    { id: "taxes", title: "Taxes", desc: "View and track taxes collected from various sources.", icon: "🏛️", color: "bg-gray-50 border-gray-200 hover:bg-gray-100" },
  ]

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const hotels = await fetch('/api/hotels').then(r => r.json())
      const hId = hotels.hotels?.[0]?.id
      setHotelId(hId || "")
      const rooms = await fetch(`/api/rooms?hotelId=${hId}`).then(r => r.json())
      const bookings = await fetch(`/api/bookings?hotelId=${hId}`).then(r => r.json())
      const payments = await fetch('/api/payments').then(r => r.json())
      const bookingsList = bookings.bookings || []
      const paymentsList = payments.payments || []
      const roomsList = rooms.rooms || []
      setAllBookings(bookingsList)
      setAllPayments(paymentsList)
      computeStats(bookingsList, paymentsList, roomsList, "monthly", selectedMonth, selectedYear, "", "")
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function computeStats(
    bookingsList: any[], paymentsList: any[], roomsList: any[],
    type: string, month: number, year: number, from: string, to: string
  ) {
    let filteredBookings = bookingsList
    let filteredPayments = paymentsList

    if (type === "monthly") {
      filteredBookings = bookingsList.filter((b: any) => {
        const d = new Date(b.checkIn)
        return d.getMonth() + 1 === month && d.getFullYear() === year
      })
      filteredPayments = paymentsList.filter((p: any) => {
        const d = new Date(p.createdAt)
        return d.getMonth() + 1 === month && d.getFullYear() === year
      })
    } else if (type === "date_range" && from && to) {
      const fromD = new Date(from)
      const toD = new Date(to)
      toD.setHours(23, 59, 59)
      filteredBookings = bookingsList.filter((b: any) => {
        const d = new Date(b.checkIn)
        return d >= fromD && d <= toD
      })
      filteredPayments = paymentsList.filter((p: any) => {
        const d = new Date(p.createdAt)
        return d >= fromD && d <= toD
      })
    }

    const monthlyRevenue: any = {}
    filteredPayments
      .filter((p: any) => p.status === 'COMPLETED')
      .forEach((p: any) => {
        const m = new Date(p.createdAt).toLocaleString('en-IN', { month: 'short', year: '2-digit' })
        monthlyRevenue[m] = (monthlyRevenue[m] || 0) + p.amount
      })

    const statusCount: any = {}
    filteredBookings.forEach((b: any) => {
      statusCount[b.status] = (statusCount[b.status] || 0) + 1
    })

    const confirmedBookings = filteredBookings.filter((b: any) => b.status === 'CONFIRMED').length
    const occupancyRate = roomsList.length > 0 ? Math.round((confirmedBookings / roomsList.length) * 100) : 0
    const bookingRevenue = filteredBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0)

    setStats({
      totalRevenue: bookingRevenue,
      totalBookings: filteredBookings.length,
      totalRooms: roomsList.length,
      totalPayments: filteredPayments.length,
      confirmedBookings,
      cancelledBookings: filteredBookings.filter((b: any) => b.status === 'CANCELLED').length,
      occupancyRate,
      monthlyRevenue,
      statusCount,
      avgRevenue: filteredBookings.length > 0 ? Math.round(bookingRevenue / filteredBookings.length) : 0,
      filteredBookings,
      filteredPayments,
      roomsList,
    })
  }

  const handleApplyFilter = async () => {
    setLoading(true)
    try {
      const hotels = await fetch('/api/hotels').then(r => r.json())
      const hId = hotels.hotels?.[0]?.id
      const rooms = await fetch(`/api/rooms?hotelId=${hId}`).then(r => r.json())
      computeStats(allBookings, allPayments, rooms.rooms || [], filterType, selectedMonth, selectedYear, fromDate, toDate)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-screen">
      <p className="text-gray-400 text-lg">📊 Loading reports...</p>
    </div>
  )

  if (!stats) return null

  const renderReportDetail = () => {
    const report = reportCards.find(r => r.id === activeReport)
    if (!report) return null

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{report.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{report.title}</h2>
              <p className="text-sm text-gray-500">{report.desc}</p>
            </div>
          </div>
          <button onClick={() => setActiveReport(null)}
            className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-medium">
            ← Back
          </button>
        </div>

        {/* Filter Section — sirf purchase/expense/petty_cash ke liye nahi dikhega */}
        {!["purchase", "expense", "petty_cash"].includes(activeReport || "") && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex gap-3 mb-4">
              <button onClick={() => setFilterType("monthly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === "monthly" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"}`}>
                📅 Monthly
              </button>
              <button onClick={() => setFilterType("date_range")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === "date_range" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"}`}>
                📆 Date Range
              </button>
            </div>
            {filterType === "monthly" && (
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">Month</label>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">Year</label>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <button onClick={handleApplyFilter}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Apply Filter
                </button>
              </div>
            )}
            {filterType === "date_range" && (
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">From Date</label>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">To Date</label>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button onClick={handleApplyFilter}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Apply Filter
                </button>
              </div>
            )}
          </div>
        )}

        {activeReport === "total_reservation" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Reservations", value: stats.totalBookings, icon: "📋" },
                { label: "Confirmed", value: stats.confirmedBookings, icon: "✅" },
                { label: "Cancelled", value: stats.cancelledBookings, icon: "❌" },
                { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: "💰" },
              ].map((c, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <div className="text-xl font-bold text-gray-900">{c.value}</div>
                  <div className="text-xs text-gray-500">{c.label}</div>
                </div>
              ))}
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Guest</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Room</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check-in</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check-out</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.filteredBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{b.guestName}</td>
                    <td className="px-4 py-3 text-gray-600">#{b.roomNumber || b.room?.number}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(b.checkIn).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(b.checkOut).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 font-semibold">₹{b.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        b.status === "CONFIRMED" ? "bg-green-100 text-green-700"
                        : b.status === "CANCELLED" ? "bg-red-100 text-red-700"
                        : b.status === "CHECKED_IN" ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "cancelled_reservation" && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Guest</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Room</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check-in</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.filteredBookings.filter((b: any) => b.status === "CANCELLED").map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{b.guestName}</td>
                  <td className="px-4 py-3 text-gray-600">#{b.roomNumber || b.room?.number}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(b.checkIn).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 font-semibold">₹{b.amount?.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === "occupancy" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Rooms", value: stats.totalRooms, icon: "🛏️" },
                { label: "Occupied", value: stats.confirmedBookings, icon: "🏨" },
                { label: "Occupancy Rate", value: `${stats.occupancyRate}%`, icon: "📈" },
                { label: "Available", value: stats.totalRooms - stats.confirmedBookings, icon: "✅" },
                { label: "Avg Booking Value", value: `₹${stats.avgRevenue.toLocaleString('en-IN')}`, icon: "💰" },
                { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: "💵" },
              ].map((c, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{c.value}</div>
                  <div className="text-sm text-gray-500">{c.label}</div>
                </div>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Daily Sales</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bookings</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.entries(
                  stats.filteredBookings.reduce((acc: any, b: any) => {
                    const date = new Date(b.checkIn).toLocaleDateString('en-IN')
                    if (!acc[date]) acc[date] = { bookings: 0, revenue: 0 }
                    acc[date].bookings += 1
                    acc[date].revenue += b.amount || 0
                    return acc
                  }, {})
                ).map(([date, data]: any, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{date}</td>
                    <td className="px-4 py-3 text-gray-600">{data.bookings}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">₹{data.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "purchase" && <PurchaseReport hotelId={hotelId} />}
        {activeReport === "expense" && <ExpenseReport hotelId={hotelId} />}
        {activeReport === "petty_cash" && <PettyCashReport hotelId={hotelId} />}

        {!["total_reservation", "cancelled_reservation", "occupancy", "purchase", "expense", "petty_cash"].includes(activeReport || "") && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">{report.icon}</div>
            <p className="font-medium text-gray-600">{report.title} Report</p>
            <p className="text-sm mt-2">Yeh feature coming soon hai!</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3 md:gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📊 Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Hotel performance ka complete overview</p>
        </div>

        {activeReport && renderReportDetail()}

        {!activeReport && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: "💰", value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, label: "Total Revenue" },
                { icon: "📅", value: stats.totalBookings, label: "Total Bookings" },
                { icon: "🏨", value: `${stats.occupancyRate}%`, label: "Occupancy Rate" },
                { icon: "📈", value: `₹${stats.avgRevenue.toLocaleString('en-IN')}`, label: "Avg Booking Value" },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-xl border p-5 shadow-sm">
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                  <div className="text-gray-500 text-sm">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportCards.map((report) => (
                <div key={report.id}
                  className={`rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${report.color}`}
                  onClick={() => setActiveReport(report.id)}>
                  <div className="text-3xl mb-3">{report.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">{report.desc}</p>
                  <button className="text-xs bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    View
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PurchaseReport({ hotelId }: { hotelId: string }) {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [form, setForm] = useState({ itemName: "", category: "", date: "", amount: "" });
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (hotelId) fetchPurchases(); }, [hotelId]);

  const fetchPurchases = async (from = "", to = "") => {
    const params = new URLSearchParams({ hotelId });
    if (from && to) { params.set("from", from); params.set("to", to); }
    const res = await fetch(`/api/purchase?${params}`);
    const data = await res.json();
    setPurchases(data.purchases || []);
  };

  const handleAdd = async () => {
    if (!form.itemName || !form.date || !form.amount) return;
    setLoading(true);
    const res = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelId, ...form }),
    });
    if (res.ok) { setForm({ itemName: "", category: "", date: "", amount: "" }); fetchPurchases(); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete karna chahte ho?")) return;
    await fetch(`/api/purchase?id=${id}`, { method: "DELETE" });
    fetchPurchases();
  };

  const filtered = purchases.filter(p => {
    if (!filterFrom && !filterTo) return true;
    const d = new Date(p.date);
    if (filterFrom && d < new Date(filterFrom)) return false;
    if (filterTo && d > new Date(filterTo + "T23:59:59")) return false;
    return true;
  });

  const total = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <input placeholder="Item Name *" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="number" placeholder="Amount *" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <button onClick={handleAdd} disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50">
          + Add
        </button>
      </div>
      <div className="flex gap-3 items-center justify-end mb-4">
        <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <button onClick={() => fetchPurchases(filterFrom, filterTo)}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-800">Filter</button>
        <button onClick={() => { setFilterFrom(""); setFilterTo(""); fetchPurchases(); }}
          className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-200">Clear</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.itemName}</td>
                <td className="px-4 py-3 text-gray-600">{p.category}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(p.date).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3 font-semibold text-green-700">₹{p.amount.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 text-xs">🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold">
              <td colSpan={3} className="px-4 py-3 text-sm text-gray-700">Total</td>
              <td className="px-4 py-3 text-sm text-green-700">₹{total.toLocaleString("en-IN")}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function ExpenseReport({ hotelId }: { hotelId: string }) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [form, setForm] = useState({ itemName: "", category: "", date: "", amount: "" });
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (hotelId) fetchExpenses(); }, [hotelId]);

  const fetchExpenses = async (from = "", to = "") => {
    const params = new URLSearchParams({ hotelId });
    if (from && to) { params.set("from", from); params.set("to", to); }
    const res = await fetch(`/api/expense?${params}`);
    const data = await res.json();
    setExpenses(data.expenses || []);
  };

  const handleAdd = async () => {
    if (!form.itemName || !form.date || !form.amount) return;
    setLoading(true);
    const res = await fetch("/api/expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelId, ...form }),
    });
    if (res.ok) { setForm({ itemName: "", category: "", date: "", amount: "" }); fetchExpenses(); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete karna chahte ho?")) return;
    await fetch(`/api/expense?id=${id}`, { method: "DELETE" });
    fetchExpenses();
  };

  const filtered = expenses.filter(e => {
    if (!filterFrom && !filterTo) return true;
    const d = new Date(e.date);
    if (filterFrom && d < new Date(filterFrom)) return false;
    if (filterTo && d > new Date(filterTo + "T23:59:59")) return false;
    return true;
  });

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <input placeholder="Item Name *" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="number" placeholder="Amount *" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <button onClick={handleAdd} disabled={loading}
          className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-red-700 disabled:opacity-50">
          + Add
        </button>
      </div>
      <div className="flex gap-3 items-center justify-end mb-4">
        <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <button onClick={() => fetchExpenses(filterFrom, filterTo)}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-800">Filter</button>
        <button onClick={() => { setFilterFrom(""); setFilterTo(""); fetchExpenses(); }}
          className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-200">Clear</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{e.itemName}</td>
                <td className="px-4 py-3 text-gray-600">{e.category}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(e.date).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3 font-semibold text-red-700">₹{e.amount.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-600 text-xs">🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold">
              <td colSpan={3} className="px-4 py-3 text-sm text-gray-700">Total</td>
              <td className="px-4 py-3 text-sm text-red-700">₹{total.toLocaleString("en-IN")}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function PettyCashReport({ hotelId }: { hotelId: string }) {
  const [activeTab, setActiveTab] = useState<"IN" | "OUT">("IN");
  const [records, setRecords] = useState<any[]>([]);
  const [formIn, setFormIn] = useState({ name: "", date: "", amount: "" });
  const [formOut, setFormOut] = useState({ name: "", date: "", amount: "" });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const YEARS = [2024, 2025, 2026, 2027];

  useEffect(() => { if (hotelId) fetchRecords(); }, [hotelId, activeTab, selectedMonth, selectedYear]);

  const fetchRecords = async () => {
    const params = new URLSearchParams({ hotelId, type: activeTab, month: String(selectedMonth), year: String(selectedYear) });
    const res = await fetch(`/api/petty-cash?${params}`);
    const data = await res.json();
    setRecords(data.pettyCash || data.entries || []);
  };

  const handleAdd = async () => {
    const form = activeTab === "IN" ? formIn : formOut;
    if (!form.name || !form.date || !form.amount) return;
    setLoading(true);
    const res = await fetch("/api/petty-cash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelId, type: activeTab, name: form.name, date: form.date, amount: form.amount }),
    });
    if (res.ok) {
      if (activeTab === "IN") setFormIn({ name: "", date: "", amount: "" });
      else setFormOut({ name: "", date: "", amount: "" });
      fetchRecords();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete karna chahte ho?")) return;
    await fetch(`/api/petty-cash?id=${id}`, { method: "DELETE" });
    fetchRecords();
  };

  const total = records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("IN")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "IN" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          💵 Petty Cash In
        </button>
        <button onClick={() => setActiveTab("OUT")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "OUT" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          💸 Petty Cash Out
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <input
          placeholder={activeTab === "IN" ? "Name *" : "Expense Name *"}
          value={activeTab === "IN" ? formIn.name : formOut.name}
          onChange={e => activeTab === "IN" ? setFormIn({ ...formIn, name: e.target.value }) : setFormOut({ ...formOut, name: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="date"
          value={activeTab === "IN" ? formIn.date : formOut.date}
          onChange={e => activeTab === "IN" ? setFormIn({ ...formIn, date: e.target.value }) : setFormOut({ ...formOut, date: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="number" placeholder="Amount *"
          value={activeTab === "IN" ? formIn.amount : formOut.amount}
          onChange={e => activeTab === "IN" ? setFormIn({ ...formIn, amount: e.target.value }) : setFormOut({ ...formOut, amount: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <button onClick={handleAdd} disabled={loading}
          className={`text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50 ${activeTab === "IN" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
          + Add
        </button>
      </div>
      <div className="flex gap-3 items-center justify-end mb-4">
        <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{activeTab === "IN" ? "Name" : "Expense Name"}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(r.date).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">₹{r.amount.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 text-xs">🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold">
              <td colSpan={2} className="px-4 py-3 text-sm text-gray-700">Total</td>
              <td className="px-4 py-3 text-sm" style={{ color: activeTab === "IN" ? "#16a34a" : "#dc2626" }}>
                ₹{total.toLocaleString("en-IN")}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}