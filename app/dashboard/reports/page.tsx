'use client'
import { useState, useEffect } from 'react'

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const [hotelsRes, roomsRes, bookingsRes, paymentsRes] = await Promise.all([
        fetch('/api/hotels'),
        fetch('/api/rooms'),
        fetch('/api/bookings'),
        fetch('/api/payments'),
      ])
      const hotels = await hotelsRes.json()
      const hotelId = hotels.hotels?.[0]?.id

      const rooms = await fetch(`/api/rooms?hotelId=${hotelId}`).then(r => r.json())
      const bookings = await fetch(`/api/bookings?hotelId=${hotelId}`).then(r => r.json())
      const payments = await paymentsRes.json()

      const allBookings = bookings.bookings || []
      const allPayments = payments.payments || []
      const allRooms = rooms.rooms || []

      // Revenue calculation
      const totalRevenue = allPayments
        .filter((p: any) => p.status === 'COMPLETED')
        .reduce((sum: number, p: any) => sum + p.amount, 0)

      // Monthly revenue
      const monthlyRevenue: any = {}
      allPayments
        .filter((p: any) => p.status === 'COMPLETED')
        .forEach((p: any) => {
          const month = new Date(p.createdAt).toLocaleString('en-IN', { month: 'short', year: '2-digit' })
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount
        })

      // Booking status breakdown
      const statusCount: any = {}
      allBookings.forEach((b: any) => {
        statusCount[b.status] = (statusCount[b.status] || 0) + 1
      })

      // Occupancy rate
      const confirmedBookings = allBookings.filter((b: any) => b.status === 'CONFIRMED').length
      const occupancyRate = allRooms.length > 0 ? Math.round((confirmedBookings / allRooms.length) * 100) : 0

      setStats({
        totalRevenue,
        totalBookings: allBookings.length,
        totalRooms: allRooms.length,
        totalPayments: allPayments.length,
        confirmedBookings,
        occupancyRate,
        monthlyRevenue,
        statusCount,
        avgRevenue: allPayments.length > 0 ? Math.round(totalRevenue / allPayments.length) : 0,
      })
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-screen">
      <p className="text-gray-400 text-lg">📊 Loading reports...</p>
    </div>
  )

  const maxRevenue = Math.max(...Object.values(stats.monthlyRevenue as any).map(Number), 1)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📊 Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Hotel performance ka complete overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-gray-500 text-sm">Total Revenue</div>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
          <div className="text-gray-500 text-sm">Total Bookings</div>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-3xl mb-2">🏨</div>
          <div className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</div>
          <div className="text-gray-500 text-sm">Occupancy Rate</div>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-2xl font-bold text-gray-900">₹{stats.avgRevenue.toLocaleString('en-IN')}</div>
          <div className="text-gray-500 text-sm">Avg Payment</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">💹 Monthly Revenue</h2>
          {Object.keys(stats.monthlyRevenue).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Abhi koi revenue data nahi hai</p>
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
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${(revenue / maxRevenue) * 100}%` }}
                    />
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
              <p>Abhi koi booking nahi hai</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.statusCount).map(([status, count]: any) => {
                const colors: any = {
                  CONFIRMED: 'bg-green-500',
                  PENDING: 'bg-yellow-500',
                  CANCELLED: 'bg-red-500',
                  COMPLETED: 'bg-blue-500',
                }
                const total = Object.values(stats.statusCount).reduce((a: any, b: any) => a + b, 0) as number
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{status}</span>
                      <span className="font-medium">{count} ({Math.round((count/total)*100)}%)</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-3">
                      <div
                        className={`${colors[status] || 'bg-gray-500'} h-3 rounded-full`}
                        style={{ width: `${(count / total) * 100}%` }}
                      />
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
              { label: 'Average Payment', value: `₹${stats.avgRevenue.toLocaleString('en-IN')}`, icon: '📊' },
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
  )
}