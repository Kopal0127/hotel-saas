'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ReportsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [allPayments, setAllPayments] = useState<any[]>([])

  // ✅ Filters
  const [filterType, setFilterType] = useState<"date_range" | "monthly">("monthly")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const YEARS = [2024, 2025, 2026, 2027]

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
    } catch (e) {
      console.error(e)
    }
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

    const totalRevenue = filteredPayments
      .filter((p: any) => p.status === 'COMPLETED')
      .reduce((sum: number, p: any) => sum + p.amount, 0)

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

    // ✅ Booking amount se revenue calculate karo
    const bookingRevenue = filteredBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0)

    setStats({
      totalRevenue: bookingRevenue,
      totalBookings: filteredBookings.length,
      totalRooms: roomsList.length,
      totalPayments: filteredPayments.length,
      confirmedBookings,
      occupancyRate,
      monthlyRevenue,
      statusCount,
      avgRevenue: filteredBookings.length > 0 ? Math.round(bookingRevenue / filteredBookings.length) : 0,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Navbar with Dashboard button */}
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3 md:gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📊 Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Hotel performance ka complete overview</p>
        </div>

        {/* ✅ Filter Section */}
        <div className="bg-white rounded-xl border p-5 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">🔍 Filter Karo</h2>
          
          {/* Filter Type Toggle */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setFilterType("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === "monthly" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              📅 Monthly
            </button>
            <button
              onClick={() => setFilterType("date_range")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === "date_range" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              📆 Date Range
            </button>
          </div>

          {/* Monthly Filter */}
          {filterType === "monthly" && (
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Month</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Year</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleApplyFilter}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
                Apply Filter
              </button>
            </div>
          )}

          {/* Date Range Filter */}
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

          {/* Active Filter Info */}
          <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
            {filterType === "monthly"
              ? `📅 Showing: ${MONTHS[selectedMonth - 1]} ${selectedYear}`
              : fromDate && toDate
                ? `📆 Showing: ${new Date(fromDate).toLocaleDateString('en-IN')} to ${new Date(toDate).toLocaleDateString('en-IN')}`
                : "📆 Date range select karo"}
          </div>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">💹 Revenue Breakdown</h2>
            {Object.keys(stats.monthlyRevenue).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Is period mein koi revenue nahi hai</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.monthlyRevenue).map(([month, revenue]: any) => (
                  <div key={month}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{month}</span>
                      <span className="font-medium">₹{revenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${(revenue / maxRevenue) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Status */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">📋 Booking Status</h2>
            {Object.keys(stats.statusCount).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Is period mein koi booking nahi hai</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.statusCount).map(([status, count]: any) => {
                  const colors: any = {
                    CONFIRMED: 'bg-green-500', PENDING: 'bg-yellow-500',
                    CANCELLED: 'bg-red-500', COMPLETED: 'bg-blue-500',
                  }
                  const total = Object.values(stats.statusCount).reduce((a: any, b: any) => a + b, 0) as number
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{status}</span>
                        <span className="font-medium">{count} ({Math.round((count / total) * 100)}%)</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-3">
                        <div className={`${colors[status] || 'bg-gray-500'} h-3 rounded-full`}
                          style={{ width: `${(count / total) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">📊 Summary Report</h2>
          <table className="w-full">
            <tbody>
              {[
                { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: '💰' },
                { label: 'Total Bookings', value: stats.totalBookings, icon: '📅' },
                { label: 'Confirmed Bookings', value: stats.confirmedBookings, icon: '✅' },
                { label: 'Total Rooms', value: stats.totalRooms, icon: '🛏️' },
                { label: 'Occupancy Rate', value: `${stats.occupancyRate}%`, icon: '📈' },
                { label: 'Total Payments', value: stats.totalPayments, icon: '💳' },
                { label: 'Average Booking Value', value: `₹${stats.avgRevenue.toLocaleString('en-IN')}`, icon: '📊' },
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="mr-2">{row.icon}</span>{row.label}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}