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

  const [filterType, setFilterType] = useState<"date_range" | "monthly">("monthly")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const YEARS = [2024, 2025, 2026, 2027]

  const reportCards = [
    { id: "total_reservation", title: "Total Reservation", desc: "Track your daily, weekly, monthly reservations from all sources.", icon: "📋", color: "bg-blue-50 border-blue-100 hover:bg-blue-100" },
    { id: "room_reservations", title: "Room Reservations", desc: "View & track your room wise reservations from different sources.", icon: "🛏️", color: "bg-green-50 border-green-100 hover:bg-green-100" },
    { id: "cancelled_reservation", title: "Cancelled Reservation", desc: "View all cancelled reservations and extract report with ease.", icon: "❌", color: "bg-red-50 border-red-100 hover:bg-red-100" },
    { id: "outstanding_payments", title: "Outstanding Payments", desc: "View all outstanding reservations and export detailed reports with ease.", icon: "💸", color: "bg-orange-50 border-orange-100 hover:bg-orange-100" },
    { id: "revenue_source", title: "Revenue by Source", desc: "View detailed revenue generated from each booking and sales source.", icon: "💰", color: "bg-yellow-50 border-yellow-100 hover:bg-yellow-100" },
    { id: "revenue_room_type", title: "Revenue by Room Type", desc: "Analyse revenue generated from each room type with detailed insights.", icon: "🏨", color: "bg-purple-50 border-purple-100 hover:bg-purple-100" },
    { id: "occupancy", title: "Occupancy", desc: "Track your daily rooms occupancy and generate detailed reports with ease.", icon: "📈", color: "bg-cyan-50 border-cyan-100 hover:bg-cyan-100" },
    { id: "daily_sales", title: "Daily Sales", desc: "Track and analyse sales performance from all sources and export detailed reports.", icon: "📊", color: "bg-indigo-50 border-indigo-100 hover:bg-indigo-100" },
    { id: "payment_received", title: "Payment Received", desc: "View all recorded payments and export detailed reports.", icon: "✅", color: "bg-green-50 border-green-100 hover:bg-green-100" },
    { id: "daily_payments", title: "Daily Payments", desc: "Analyse daily, weekly, monthly payment mode from different payment mode and extract report.", icon: "💳", color: "bg-blue-50 border-blue-100 hover:bg-blue-100" },
    { id: "purchase", title: "Purchase", desc: "View and export all vendor-wise purchase reports.", icon: "🛒", color: "bg-orange-50 border-orange-100 hover:bg-orange-100" },
    { id: "expense", title: "Expense", desc: "View and export all category-wise expense reports.", icon: "🧾", color: "bg-red-50 border-red-100 hover:bg-red-100" },
    { id: "petty_cash", title: "Petty Cash", desc: "View and export all category-wise petty cash transactions.", icon: "💵", color: "bg-yellow-50 border-yellow-100 hover:bg-yellow-100" },
    { id: "product_wise", title: "Product Wise", desc: "View and track your most selling products and categories.", icon: "📦", color: "bg-purple-50 border-purple-100 hover:bg-purple-100" },
    { id: "invoices", title: "Invoices", desc: "View all invoices and export various reports like sales, payment, product wise, order ticket & shift reports.", icon: "🧾", color: "bg-cyan-50 border-cyan-100 hover:bg-cyan-100" },
    { id: "taxes", title: "Taxes", desc: "View and track taxes collected from various sources.", icon: "🏛️", color: "bg-gray-50 border-gray-200 hover:bg-gray-100" },
  ]

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const hotels = await fetch('/api/hotels').then(r => r.json())
      const hotelId = hotels.hotels?.[0]?.id
      const rooms = await fetch(`/api/rooms?hotelId=${hotelId}`).then(r => r.json())
      const bookings = await fetch(`/api/bookings?hotelId=${hotelId}`).then(r => r.json())
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
      const hotelId = hotels.hotels?.[0]?.id
      const rooms = await fetch(`/api/rooms?hotelId=${hotelId}`).then(r => r.json())
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

  const maxRevenue = Math.max(...Object.values(stats.monthlyRevenue as any).map(Number), 1)

  // Report detail view
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
          <button
            onClick={() => setActiveReport(null)}
            className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-medium"
          >
            ← Back
          </button>
        </div>

        {/* Filter Section */}
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

        {/* Report Data */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
        )}

        {/* Default view for other reports */}
        {!["total_reservation", "cancelled_reservation", "occupancy"].includes(activeReport || "") && (
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

        {/* Report Detail View */}
        {activeReport && renderReportDetail()}

        {/* Report Cards Grid */}
        {!activeReport && (
          <>
            {/* KPI Cards */}
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

            {/* All Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportCards.map((report) => (
                <div
                  key={report.id}
                  className={`rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${report.color}`}
                  onClick={() => setActiveReport(report.id)}
                >
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