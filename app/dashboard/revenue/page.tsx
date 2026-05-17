'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/useAuth'
import { Toast } from '@/components/Toast'
import { useToast } from '@/components/useToast'

export default function RevenuePage() {
  useAuth()
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()
  const [hotelId, setHotelId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    isActive: false,
    first12Discount: 0,
    first12Occupancy: 60,
    middleDiscount: 0,
    middleOccupancy: 40,
    lastDiscount: 0,
    lastOccupancy: 40,
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/hotels', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.hotels?.[0]) {
          setHotelId(data.hotels[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (!hotelId) return
    fetchSettings()
  }, [hotelId])

  async function fetchSettings() {
    setLoading(true)
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/revenue-settings?hotelId=${hotelId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.settings) setSettings(data.settings)
    setLoading(false)
  }

  async function saveSettings() {
    setSaving(true)
    const token = localStorage.getItem('token')
    const res = await fetch('/api/revenue-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ hotelId, ...settings })
    })
    const data = await res.json()
    if (data.success) {
      showToast('Settings save ho gayi! ✅', 'success')
    } else {
      showToast('Save nahi ho saka!', 'error')
    }
    setSaving(false)
  }

  async function toggleActivate() {
    const newActive = !settings.isActive
    setSettings(prev => ({ ...prev, isActive: newActive }))
    const token = localStorage.getItem('token')
    await fetch('/api/revenue-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ hotelId, ...settings, isActive: newActive })
    })
    showToast(newActive ? '✅ Revenue Manager Activate ho gaya!' : '⏸ Revenue Manager Deactivate ho gaya!', newActive ? 'success' : 'info')
  }

  const slotData = [
    {
      key: 'first12',
      label: 'First 12 Hours Booking',
      time: '12:01 AM – 11:59 AM',
      emoji: '🌅',
      color: 'blue',
      discount: settings.first12Discount,
      occupancy: settings.first12Occupancy,
      discountKey: 'first12Discount',
      occupancyKey: 'first12Occupancy',
    },
    {
      key: 'middle',
      label: 'Middle Hours Booking',
      time: '12:01 PM – 6:00 PM',
      emoji: '☀️',
      color: 'orange',
      discount: settings.middleDiscount,
      occupancy: settings.middleOccupancy,
      discountKey: 'middleDiscount',
      occupancyKey: 'middleOccupancy',
    },
    {
      key: 'last',
      label: 'Last Minute Booking',
      time: '6:01 PM – 11:30 PM',
      emoji: '🌙',
      color: 'purple',
      discount: settings.lastDiscount,
      occupancy: settings.lastOccupancy,
      discountKey: 'lastDiscount',
      occupancyKey: 'lastOccupancy',
    },
  ]

  const colorMap: any = {
    blue: {
      bg: 'bg-blue-50', border: 'border-blue-200', header: 'bg-blue-600',
      badge: 'bg-blue-100 text-blue-700', input: 'focus:border-blue-400'
    },
    orange: {
      bg: 'bg-orange-50', border: 'border-orange-200', header: 'bg-orange-500',
      badge: 'bg-orange-100 text-orange-700', input: 'focus:border-orange-400'
    },
    purple: {
      bg: 'bg-purple-50', border: 'border-purple-200', header: 'bg-purple-600',
      badge: 'bg-purple-100 text-purple-700', input: 'focus:border-purple-400'
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3 md:gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push('/login')} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📈 Revenue Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Auto discount — unsold rooms ke liye time-based price update</p>
          </div>
          <button
            onClick={toggleActivate}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              settings.isActive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {settings.isActive ? '⏸ Deactivate' : '▶ Activate'}
          </button>
        </div>

        {/* Status Banner */}
        <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
          settings.isActive ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'
        }`}>
          <span className="text-2xl">{settings.isActive ? '🟢' : '⚪'}</span>
          <div>
            <p className={`font-semibold text-sm ${settings.isActive ? 'text-green-700' : 'text-gray-500'}`}>
              {settings.isActive ? 'Revenue Manager Active Hai' : 'Revenue Manager Inactive Hai'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {settings.isActive
                ? 'Auto discount aaj se apply hoga — rates page pe push hoga'
                : 'Activate karo toh auto discount shuru hoga'}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700">
            💡 <b>Kaise kaam karta hai:</b> Har time slot pe system check karta hai ki kitne % rooms unsold hain.
            Agar unsold % aapke set threshold se zyada hai, toh automatically discounted price rates page pe push ho jaati hai.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-2">⏳</div>
            <p>Loading settings...</p>
          </div>
        ) : (
          <>
            {/* Time Slot Cards */}
            <div className="space-y-4 mb-6">
              {slotData.map(slot => {
                const c = colorMap[slot.color]
                return (
                  <div key={slot.key} className={`rounded-2xl border ${c.border} overflow-hidden`}>
                    {/* Card Header */}
                    <div className={`${c.header} px-6 py-4 flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{slot.emoji}</span>
                        <div>
                          <h3 className="font-bold text-white">{slot.label}</h3>
                          <p className="text-white/80 text-xs">{slot.time}</p>
                        </div>
                      </div>
                      <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                        Aaj ke liye
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className={`${c.bg} px-6 py-5`}>
                      <div className="grid grid-cols-2 gap-6">
                        {/* Discount % */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-2">
                            💰 Discount %
                            <span className="ml-1 font-normal text-gray-400">(base price pe lagega)</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number" min="0" max="100"
                              value={slot.discount}
                              onChange={e => setSettings(prev => ({ ...prev, [slot.discountKey]: parseFloat(e.target.value) || 0 }))}
                              className={`w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none ${c.input} bg-white`}
                            />
                            <span className="text-gray-500 text-sm font-medium">%</span>
                          </div>
                          {slot.discount > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              e.g. ₹1000 → ₹{(1000 - (1000 * slot.discount) / 100).toFixed(0)}
                            </p>
                          )}
                        </div>

                        {/* Occupancy Threshold */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-2">
                            🏨 Occupancy Threshold %
                            <span className="ml-1 font-normal text-gray-400">(itne % unsold hone par)</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number" min="0" max="100"
                              value={slot.occupancy}
                              onChange={e => setSettings(prev => ({ ...prev, [slot.occupancyKey]: parseFloat(e.target.value) || 0 }))}
                              className={`w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none ${c.input} bg-white`}
                            />
                            <span className="text-gray-500 text-sm font-medium">%</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Agar {slot.occupancy}%+ rooms unsold hain toh discount lagega
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Save Button */}
            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? '⏳ Saving...' : '💾 Settings Save Karo'}
            </button>
          </>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}