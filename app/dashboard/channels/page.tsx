'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Toast } from "@/components/Toast";
import { useToast } from "@/components/useToast";
import { useAuth } from "@/components/useAuth";

const OTA_LIST = [
  { name: 'BOOKING_COM', label: 'Booking.com', logo: '🏨' },
  { name: 'MAKEMYTRIP', label: 'MakeMyTrip', logo: '✈️' },
  { name: 'GOOGLE_HOTEL_CENTRE', label: 'Google Hotel Centre', logo: '🔍' },
]

export default function ChannelsPage() {
  useAuth();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [channels, setChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  const [syncing, setSyncing] = useState(false)
  const [pulling, setPulling] = useState(false)
  const [connectModal, setConnectModal] = useState<string | null>(null)
  const [form, setForm] = useState({ apiKey: '', apiSecret: '', propertyId: '' })

  useEffect(() => { fetchChannels() }, [])

  async function fetchChannels() {
    setLoading(true)
    try {
      const res = await fetch('/api/channels', { credentials: 'include' })
      const data = await res.json()
      setChannels(data.channels || [])
    } catch(e) {
      showToast("Channels load nahi ho sake!", "error")
    }
    setLoading(false)
  }

  async function connectChannel(name: string) {
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ...form })
      })
      if (res.ok) {
        showToast(`${OTA_LIST.find(o => o.name === name)?.label} successfully connect ho gaya! ✅`, "success")
        addLog(`✅ ${name} connected!`)
      } else {
        showToast("Channel connect nahi ho saca!", "error")
      }
    } catch(e) {
      showToast("Kuch galat hua, dobara try karo!", "error")
    }
    setConnectModal(null)
    setForm({ apiKey: '', apiSecret: '', propertyId: '' })
    fetchChannels()
  }

  async function syncAll() {
    setSyncing(true)
    showToast("Sync shuru ho gaya...", "info")
    addLog('🔄 Syncing...')
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextMonth = new Date()
      nextMonth.setDate(nextMonth.getDate() + 30)
      const res = await fetch('/api/channels/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: tomorrow.toISOString(), endDate: nextMonth.toISOString() })
      })
      const data = await res.json()
      data.results?.forEach((r: any) => addLog(`${r.success ? '✅' : '❌'} ${r.channel}: ${r.message}`))
      showToast("Sync successfully complete ho gaya! ✅", "success")
    } catch(e) {
      showToast("Sync fail ho gaya!", "error")
    }
    setSyncing(false)
    fetchChannels()
  }

  async function pullBookings() {
    setPulling(true)
    showToast("Bookings pull ho rahi hain...", "info")
    addLog('📥 Pulling bookings...')
    try {
      const res = await fetch('/api/channels/bookings', { method: 'POST' })
      const data = await res.json()
      showToast(data.message || "Bookings successfully pull ho gayi! ✅", "success")
      addLog(`✅ ${data.message || 'Bookings pulled successfully'}`)
    } catch(e) {
      showToast("Bookings pull nahi ho saki!", "error")
    }
    setPulling(false)
  }

  function addLog(msg: string) {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)])
  }

  const getChannelStatus = (name: string) => channels.find(c => c.name === name)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3 md:gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">🔗 Channel Manager</h1>
            <p className="text-gray-500 mt-1 text-sm">OTAs ko connect karo aur availability sync karo</p>
          </div>
          <div className="flex gap-2 md:gap-3">
            <button onClick={pullBookings} disabled={pulling}
              className="px-3 md:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-xs md:text-sm font-medium">
              {pulling ? '⏳ Pulling...' : '📥 Pull Bookings'}
            </button>
            <button onClick={syncAll} disabled={syncing}
              className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs md:text-sm font-medium">
              {syncing ? '⏳ Syncing...' : '🔄 Sync All'}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading channels...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {OTA_LIST.map(ota => {
              const status = getChannelStatus(ota.name)
              const isConnected = status?.isConnected
              return (
                <div key={ota.name} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-3xl md:text-4xl">{ota.logo}</span>
                      <h3 className="font-semibold text-gray-800 mt-2 text-sm md:text-base">{ota.label}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {isConnected ? '● Connected' : '○ Not Connected'}
                    </span>
                  </div>
                  <button onClick={() => setConnectModal(ota.name)}
                    className={`w-full py-2 rounded-lg text-sm font-medium ${isConnected ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {isConnected ? '⚙️ Update' : '🔌 Connect'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-4 mb-6">
            <h3 className="text-white font-medium mb-3">📋 Activity Log</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {logs.map((log, i) => (
                <p key={i} className="text-green-400 text-xs md:text-sm font-mono">{log}</p>
              ))}
            </div>
          </div>
        )}

        {connectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="font-bold text-lg mb-4">
                Connect {OTA_LIST.find(o => o.name === connectModal)?.label}
              </h3>
              <div className="space-y-3">
                <input placeholder="API Key (optional)" value={form.apiKey}
                  onChange={e => setForm({ ...form, apiKey: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input placeholder="API Secret (optional)" value={form.apiSecret}
                  onChange={e => setForm({ ...form, apiSecret: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Property ID (optional)" value={form.propertyId}
                  onChange={e => setForm({ ...form, propertyId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 Fields blank chhod sakte ho — mock mode mein kaam karega
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setConnectModal(null)}
                  className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
                <button onClick={() => connectChannel(connectModal)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm">Connect ✓</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}