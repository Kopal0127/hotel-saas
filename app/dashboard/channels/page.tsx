'use client'
import { useState, useEffect } from 'react'

const OTA_LIST = [
  { name: 'BOOKING_COM', label: 'Booking.com', logo: '🏨' },
  { name: 'MAKEMYTRIP', label: 'MakeMyTrip', logo: '✈️' },
  { name: 'GOOGLE_HOTEL_CENTRE', label: 'Google Hotel Centre', logo: '🔍' },
]

export default function ChannelsPage() {
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
      console.error(e)
    }
    setLoading(false)
  }

  async function connectChannel(name: string) {
    await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ...form })
    })
    setConnectModal(null)
    setForm({ apiKey: '', apiSecret: '', propertyId: '' })
    fetchChannels()
    addLog(`✅ ${name} connected!`)
  }

  async function syncAll() {
    setSyncing(true)
    addLog('🔄 Syncing...')
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
    setSyncing(false)
    fetchChannels()
  }

  async function pullBookings() {
    setPulling(true)
    addLog('📥 Pulling bookings...')
    const res = await fetch('/api/channels/bookings', { method: 'POST' })
    const data = await res.json()
    addLog(`✅ ${data.message || 'Bookings pulled successfully'}`)
    setPulling(false)
  }

  function addLog(msg: string) {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)])
  }

  const getChannelStatus = (name: string) => channels.find(c => c.name === name)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🔗 Channel Manager</h1>
          <p className="text-gray-500 mt-1">OTAs ko connect karo aur availability sync karo</p>
        </div>
        <div className="flex gap-3">
          <button onClick={pullBookings} disabled={pulling}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium">
            {pulling ? '⏳ Pulling...' : '📥 Pull Bookings'}
          </button>
          <button onClick={syncAll} disabled={syncing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {syncing ? '⏳ Syncing...' : '🔄 Sync All'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading channels...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {OTA_LIST.map(ota => {
            const status = getChannelStatus(ota.name)
            const isConnected = status?.isConnected
            return (
              <div key={ota.name} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-4xl">{ota.logo}</span>
                    <h3 className="font-semibold text-gray-800 mt-2">{ota.label}</h3>
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
              <p key={i} className="text-green-400 text-sm font-mono">{log}</p>
            ))}
          </div>
        </div>
      )}

      {connectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
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
  )
}