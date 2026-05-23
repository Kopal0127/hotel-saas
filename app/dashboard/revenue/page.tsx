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
  const [activeTab, setActiveTab] = useState('revenue')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    isActive: false,
    nextDayDiscount: 0, nextDayUnsold: 80, nextDayMarkup: 0, nextDayBooked: 40,
    first12Discount: 0, first12Unsold: 60, first12Markup: 0, first12Booked: 40,
    middleDiscount: 0, middleUnsold: 40, middleMarkup: 0, middleBooked: 40,
    lastDiscount: 0, lastUnsold: 40, lastMarkup: 0, lastBooked: 40,
  })
  const [serpApiKey, setSerpApiKey] = useState('')
  const [savingKey, setSavingKey] = useState(false)
  const [competitors, setCompetitors] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [addingComp, setAddingComp] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [myRate, setMyRate] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/hotels', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.hotels?.[0]) {
          setHotelId(data.hotels[0].id)
          setSerpApiKey(data.hotels[0].serpApiKey || '')
        }
      })
  }, [])

  useEffect(() => {
    if (!hotelId) return
    fetchSettings()
    fetchCompetitors()
    fetchMyRate()
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

  async function fetchCompetitors() {
    const res = await fetch(`/api/competitors?hotelId=${hotelId}`)
    const data = await res.json()
    if (Array.isArray(data)) setCompetitors(data)
  }

  async function fetchMyRate() {
    const token = localStorage.getItem('token')
    const today = new Date().toISOString().split('T')[0]
    const res = await fetch(`/api/rates?hotelId=${hotelId}&date=${today}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.ratePlans?.length > 0) {
      const prices = data.ratePlans.map((r: any) => r.price).filter((p: number) => p > 0)
      if (prices.length > 0) setMyRate(Math.min(...prices))
    }
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
    if (data.success) showToast('Settings save ho gayi! ✅', 'success')
    else showToast('Save nahi ho saka!', 'error')
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

  async function saveSerpKey() {
    setSavingKey(true)
    const token = localStorage.getItem('token')
    const res = await fetch('/api/hotels/serp-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ hotelId, serpApiKey })
    })
    const data = await res.json()
    if (data.success) showToast('SerpAPI key save ho gayi! ✅', 'success')
    else showToast('Save nahi ho saka!', 'error')
    setSavingKey(false)
  }

  async function addCompetitor() {
    if (!newName || !newLocation) return showToast('Naam aur location dono bharo!', 'error')
    setAddingComp(true)
    const res = await fetch('/api/competitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId, name: newName, location: newLocation })
    })
    const data = await res.json()
    if (data.id) {
      setCompetitors(prev => [...prev, data])
      setNewName('')
      setNewLocation('')
      showToast('Competitor add ho gaya! ✅', 'success')
    } else {
      showToast(data.error || 'Add nahi ho saka!', 'error')
    }
    setAddingComp(false)
  }

  async function deleteCompetitor(id: string) {
    await fetch(`/api/competitors?id=${id}`, { method: 'DELETE' })
    setCompetitors(prev => prev.filter((c: any) => c.id !== id))
    showToast('Competitor delete ho gaya!', 'success')
  }

  async function fetchNow() {
    if (!serpApiKey) return showToast('Pehle SerpAPI key save karo!', 'error')
    setFetching(true)
    const res = await fetch('/api/rate-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId })
    })
    const data = await res.json()
    if (data.success) {
      await fetchCompetitors()
      showToast('Rates fetch ho gayi! ✅', 'success')
    } else {
      showToast(data.error || 'Fetch nahi ho saka!', 'error')
    }
    setFetching(false)
  }

  const slotData = [
    {
      key: 'nextDay', label: 'Next Day Booking', time: '12:01 AM — Kal ki date ke liye', emoji: '📅', color: 'green',
      discount: settings.nextDayDiscount, unsoldKey: 'nextDayUnsold', unsold: settings.nextDayUnsold,
      markup: settings.nextDayMarkup, bookedKey: 'nextDayBooked', booked: settings.nextDayBooked,
      discountKey: 'nextDayDiscount', markupKey: 'nextDayMarkup',
    },
    {
      key: 'first12', label: 'First 12 Hours Booking', time: '12:01 AM – 11:59 AM', emoji: '🌅', color: 'blue',
      discount: settings.first12Discount, unsoldKey: 'first12Unsold', unsold: settings.first12Unsold,
      markup: settings.first12Markup, bookedKey: 'first12Booked', booked: settings.first12Booked,
      discountKey: 'first12Discount', markupKey: 'first12Markup',
    },
    {
      key: 'middle', label: 'Middle Hours Booking', time: '12:01 PM – 6:00 PM', emoji: '☀️', color: 'orange',
      discount: settings.middleDiscount, unsoldKey: 'middleUnsold', unsold: settings.middleUnsold,
      markup: settings.middleMarkup, bookedKey: 'middleBooked', booked: settings.middleBooked,
      discountKey: 'middleDiscount', markupKey: 'middleMarkup',
    },
    {
      key: 'last', label: 'Last Minute Booking', time: '6:01 PM – 11:30 PM', emoji: '🌙', color: 'purple',
      discount: settings.lastDiscount, unsoldKey: 'lastUnsold', unsold: settings.lastUnsold,
      markup: settings.lastMarkup, bookedKey: 'lastBooked', booked: settings.lastBooked,
      discountKey: 'lastDiscount', markupKey: 'lastMarkup',
    },
  ]

  const colorMap: any = {
    green: { bg: 'bg-green-50', border: 'border-green-200', header: 'bg-green-600', input: 'focus:border-green-400' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', header: 'bg-blue-600', input: 'focus:border-blue-400' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', header: 'bg-orange-500', input: 'focus:border-orange-400' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', header: 'bg-purple-600', input: 'focus:border-purple-400' },
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📈 Revenue Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Auto discount aur competitor rate tracking</p>
          </div>
          {activeTab === 'revenue' && (
            <button onClick={toggleActivate}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${settings.isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>
              {settings.isActive ? '⏸ Deactivate' : '▶ Activate'}
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6 bg-white border border-gray-200 rounded-xl p-1">
          <button onClick={() => setActiveTab('revenue')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'revenue' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            📈 Revenue Manager
          </button>
          <button onClick={() => setActiveTab('tracker')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'tracker' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            🔍 Rate Tracker
          </button>
        </div>

        {activeTab === 'revenue' && (
          <>
            <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${settings.isActive ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'}`}>
              <span className="text-2xl">{settings.isActive ? '🟢' : '⚪'}</span>
              <div>
                <p className={`font-semibold text-sm ${settings.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                  {settings.isActive ? 'Revenue Manager Active Hai' : 'Revenue Manager Inactive Hai'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {settings.isActive ? 'Auto discount aaj se apply hoga — rates page pe push hoga' : 'Activate karo toh auto discount shuru hoga'}
                </p>
              </div>
            </div>

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
                <div className="space-y-4 mb-6">
                  {slotData.map(slot => {
                    const c = colorMap[slot.color]
                    return (
                      <div key={slot.key} className={`rounded-2xl border ${c.border} overflow-hidden`}>
                        <div className={`${c.header} px-6 py-4 flex items-center justify-between`}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{slot.emoji}</span>
                            <div>
                              <h3 className="font-bold text-white">{slot.label}</h3>
                              <p className="text-white/80 text-xs">{slot.time}</p>
                            </div>
                          </div>
                          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Aaj ke liye</span>
                        </div>
                        <div className={`${c.bg} px-6 py-5`}>
                          <div className="mb-5">
                            <p className="text-xs font-bold text-red-600 mb-3">📉 Discount Settings</p>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-2">💰 Discount % <span className="font-normal text-gray-400">(base price pe lagega)</span></label>
                                <div className="flex items-center gap-2">
                                  <input type="number" min="0" max="100" value={slot.discount}
                                    onChange={e => setSettings(prev => ({ ...prev, [slot.discountKey]: parseFloat(e.target.value) || 0 }))}
                                    className={`w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none ${c.input} bg-white`} />
                                  <span className="text-gray-500 text-sm">%</span>
                                </div>
                                {slot.discount > 0 && <p className="text-xs text-gray-400 mt-1">e.g. ₹1000 → ₹{(1000 - (1000 * slot.discount) / 100).toFixed(0)}</p>}
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-2">🏨 Unsold Threshold % <span className="font-normal text-gray-400">(itne % unsold hone par)</span></label>
                                <div className="flex items-center gap-2">
                                  <input type="number" min="0" max="100" value={slot.unsold}
                                    onChange={e => setSettings(prev => ({ ...prev, [slot.unsoldKey]: parseFloat(e.target.value) || 0 }))}
                                    className={`w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none ${c.input} bg-white`} />
                                  <span className="text-gray-500 text-sm">%</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Agar {slot.unsold}%+ rooms unsold hain toh discount lagega</p>
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-gray-200 my-4"></div>
                          <div>
                            <p className="text-xs font-bold text-green-600 mb-3">📈 Markup Settings</p>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-2">💹 Markup % <span className="font-normal text-gray-400">(base price pe badhega)</span></label>
                                <div className="flex items-center gap-2">
                                  <input type="number" min="0" max="100" value={slot.markup}
                                    onChange={e => setSettings(prev => ({ ...prev, [slot.markupKey]: parseFloat(e.target.value) || 0 }))}
                                    className={`w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none ${c.input} bg-white`} />
                                  <span className="text-gray-500 text-sm">%</span>
                                </div>
                                {slot.markup > 0 && <p className="text-xs text-gray-400 mt-1">e.g. ₹1000 → ₹{(1000 + (1000 * slot.markup) / 100).toFixed(0)}</p>}
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-2">🎯 Booked Threshold % <span className="font-normal text-gray-400">(itne % booked hone par)</span></label>
                                <div className="flex items-center gap-2">
                                  <input type="number" min="0" max="100" value={slot.booked}
                                    onChange={e => setSettings(prev => ({ ...prev, [slot.bookedKey]: parseFloat(e.target.value) || 0 }))}
                                    className={`w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none ${c.input} bg-white`} />
                                  <span className="text-gray-500 text-sm">%</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Agar {slot.booked}%+ rooms booked hain toh markup lagega</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button onClick={saveSettings} disabled={saving}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving ? '⏳ Saving...' : '💾 Settings Save Karo'}
                </button>
              </>
            )}
          </>
        )}

        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-base font-bold text-gray-800 mb-1">🔑 SerpAPI Key</h2>
              <p className="text-xs text-gray-400 mb-4">serpapi.com pe free account banao — 250 searches/month free hain</p>
              <div className="flex gap-3">
                <input type="text" value={serpApiKey} onChange={e => setSerpApiKey(e.target.value)}
                  placeholder="Apni SerpAPI key yahan daalo..."
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                <button onClick={saveSerpKey} disabled={savingKey}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {savingKey ? '⏳' : '💾 Save'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-800">🏨 Competitors ({competitors.length}/8)</h2>
                  <p className="text-xs text-gray-400">Max 8 competitors add kar sakte ho</p>
                </div>
                {serpApiKey && competitors.length > 0 && (
                  <button onClick={fetchNow} disabled={fetching}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-50">
                    {fetching ? '⏳ Fetching...' : '🔄 Fetch Now'}
                  </button>
                )}
              </div>

              {competitors.length < 8 && (
                <div className="flex gap-3 mb-5">
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="Hotel naam (e.g. Hotel Taj)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                  <input type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)}
                    placeholder="Location (e.g. Mumbai)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                  <button onClick={addCompetitor} disabled={addingComp}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                    {addingComp ? '⏳' : '+ Add'}
                  </button>
                </div>
              )}

              {competitors.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">🏨</p>
                  <p className="text-sm">Koi competitor nahi — upar se add karo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {competitors.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.location}</p>
                      </div>
                      <button onClick={() => deleteCompetitor(c.id)}
                        className="text-red-400 hover:text-red-600 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-red-50">
                        🗑 Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {competitors.some((c: any) => c.rates) && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-800">📊 Rate Comparison</h2>
                  {myRate && (
                    <span className="bg-blue-100 text-blue-700 text-sm font-bold px-4 py-1.5 rounded-full">
                      Tumhara Rate: ₹{myRate}
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-2 text-gray-500 font-semibold">Competitor</th>
                        <th className="text-left py-3 px-2 text-gray-500 font-semibold">Price</th>
                        <th className="text-left py-3 px-2 text-gray-500 font-semibold">OTA</th>
                        <th className="text-left py-3 px-2 text-gray-500 font-semibold">Rating</th>
                        <th className="text-left py-3 px-2 text-gray-500 font-semibold">vs Tumhara</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitors.map((c: any) => {
                        const rate = c.rates
                        const diff = rate?.price && myRate ? rate.price - myRate : null
                        return (
                          <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <p className="font-semibold text-gray-800">{c.name}</p>
                              <p className="text-xs text-gray-400">{c.location}</p>
                            </td>
                            <td className="py-3 px-2 font-bold text-gray-800">
                              {rate?.price ? `₹${rate.price}` : <span className="text-gray-300 font-normal">—</span>}
                            </td>
                            <td className="py-3 px-2 text-gray-500">{rate?.source || '—'}</td>
                            <td className="py-3 px-2">
                              {rate?.rating ? <span className="text-yellow-500 font-semibold">⭐ {rate.rating}</span> : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="py-3 px-2">
                              {diff !== null ? (
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${diff > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                  {diff > 0 ? `+₹${diff} zyada` : `-₹${Math.abs(diff)} kam`}
                                </span>
                              ) : <span className="text-gray-300 text-xs">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {competitors[0]?.rates?.fetchedAt && (
                  <p className="text-xs text-gray-400 mt-4 text-right">
                    Last Updated: {new Date(competitors[0].rates.fetchedAt).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}