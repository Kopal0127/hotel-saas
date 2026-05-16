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

// ✅ Mock Promotions Data — Real API baad mein
const MOCK_PROMOTIONS: Record<string, any[]> = {
  BOOKING_COM: [
    { id: 'p1', title: 'Early Bird Discount', discountType: 'PERCENTAGE', discountValue: 15, minStay: 2, startDate: '2026-06-01', endDate: '2026-08-31', status: 'ACTIVE' },
    { id: 'p2', title: 'Last Minute Deal', discountType: 'PERCENTAGE', discountValue: 20, minStay: 1, startDate: '2026-05-20', endDate: '2026-06-15', status: 'ACTIVE' },
    { id: 'p3', title: 'Weekend Getaway', discountType: 'FIXED', discountValue: 500, minStay: 2, startDate: '2026-06-01', endDate: '2026-07-31', status: 'INACTIVE' },
  ],
  MAKEMYTRIP: [
    { id: 'p4', title: 'Summer Sale', discountType: 'PERCENTAGE', discountValue: 25, minStay: 1, startDate: '2026-06-01', endDate: '2026-08-15', status: 'ACTIVE' },
    { id: 'p5', title: 'Couple Special', discountType: 'FIXED', discountValue: 300, minStay: 2, startDate: '2026-06-10', endDate: '2026-07-10', status: 'ACTIVE' },
  ],
  GOOGLE_HOTEL_CENTRE: [],
}

function PromotionsTab({ otaList }: { otaList: typeof OTA_LIST }) {
  const [selectedOta, setSelectedOta] = useState('')
  const [isPulling, setIsPulling] = useState(false)
  const [pulledPromos, setPulledPromos] = useState<any[]>([])
  const [hasPulled, setHasPulled] = useState(false)
  const [myPromos, setMyPromos] = useState<any[]>([])
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [pushingId, setPushingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    title: '', discountType: 'PERCENTAGE', discountValue: '',
    minStay: '1', startDate: '', endDate: '', targetOta: '', status: 'ACTIVE'
  })
  const [form, setForm] = useState({
    title: '', discountType: 'PERCENTAGE', discountValue: '',
    minStay: '1', startDate: '', endDate: '', targetOta: '', status: 'ACTIVE'
  })

  function handlePull() {
    if (!selectedOta) return
    setIsPulling(true)
    setHasPulled(false)
    setPulledPromos([])
    // Mock: 1.5s delay, real API baad mein
    setTimeout(() => {
      setPulledPromos(MOCK_PROMOTIONS[selectedOta] || [])
      setHasPulled(true)
      setIsPulling(false)
    }, 1500)
  }

  function handleImport(promo: any) {
    if (importedIds.has(promo.id)) return
    setImportedIds(prev => new Set([...prev, promo.id]))
    setMyPromos(prev => [...prev, { ...promo, otaSource: selectedOta, isPushed: false, localId: `imp_${promo.id}` }])
  }

  function handleSavePromo() {
    if (!form.title || !form.discountValue || !form.startDate || !form.endDate || !form.targetOta) {
      alert('Saare * fields fill karo.')
      return
    }
    const newPromo = {
      id: `local_${Date.now()}`,
      title: form.title,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minStay: parseInt(form.minStay),
      startDate: form.startDate,
      endDate: form.endDate,
      otaSource: form.targetOta,
      status: form.status,
      isPushed: false,
    }
    setMyPromos(prev => [...prev, newPromo])
    setShowForm(false)
    setForm({ title: '', discountType: 'PERCENTAGE', discountValue: '', minStay: '1', startDate: '', endDate: '', targetOta: '', status: 'ACTIVE' })
  }

  function handlePush(id: string) {
    setPushingId(id)
    // Mock: 1.2s delay, real API baad mein
    setTimeout(() => {
      setMyPromos(prev => prev.map(p => p.id === id ? { ...p, isPushed: true } : p))
      setPushingId(null)
    }, 1200)
  }

 function handleDelete(id: string) {
    if (!confirm('Yeh promotion delete karna chahte ho?')) return
    setMyPromos(prev => prev.filter(p => p.id !== id))
  }

  function handleEditOpen(promo: any) {
    if (editingId === promo.id) {
      setEditingId(null)
      return
    }
    setEditingId(promo.id)
    setEditForm({
      title: promo.title,
      discountType: promo.discountType,
      discountValue: String(promo.discountValue),
      minStay: String(promo.minStay),
      startDate: promo.startDate,
      endDate: promo.endDate,
      targetOta: promo.otaSource,
      status: promo.status,
    })
  }

  function handleEditSave(id: string) {
    if (!editForm.title || !editForm.discountValue || !editForm.startDate || !editForm.endDate || !editForm.targetOta) {
      alert('Saare * fields fill karo.')
      return
    }
    setMyPromos(prev => prev.map(p => p.id === id ? {
      ...p,
      title: editForm.title,
      discountType: editForm.discountType,
      discountValue: parseFloat(editForm.discountValue),
      minStay: parseInt(editForm.minStay),
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      otaSource: editForm.targetOta,
      status: editForm.status,
      isPushed: false,
    } : p))
    setEditingId(null)
  }

  const selectedOtaLabel = otaList.find(o => o.name === selectedOta)?.label || ''
  const selectedOtaLogo = otaList.find(o => o.name === selectedOta)?.logo || ''

  return (
    <div className="space-y-6">

      {/* Info Banner — ranking tracker jaise */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          🎁 <b>Promotions</b> — OTA se promotions pull karo ya khud banao aur OTA par push karo. Abhi demo mode hai, real API baad mein lagega.
        </p>
      </div>

      {/* Section 1: Pull from OTA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-green-600 flex items-center gap-3">
          <span className="text-2xl">📥</span>
          <div>
            <h3 className="font-bold text-white text-lg">OTA se Promotions Pull Karo</h3>
            <p className="text-white/80 text-xs">OTA select karo aur Pull karo — unke promotions hamare system mein aa jayenge</p>
          </div>
          <span className="ml-auto bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">Demo Mode</span>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <select
              value={selectedOta}
              onChange={e => { setSelectedOta(e.target.value); setPulledPromos([]); setHasPulled(false) }}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400"
            >
              <option value="">-- OTA Select Karo --</option>
              {otaList.map(o => (
                <option key={o.name} value={o.name}>{o.logo} {o.label}</option>
              ))}
            </select>
            <button
              onClick={handlePull}
              disabled={!selectedOta || isPulling}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isPulling ? '⏳ Pulling...' : '📥 Pull Promotions'}
            </button>
          </div>

          {/* Results */}
          {hasPulled && (
            pulledPromos.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-500 text-sm">{selectedOtaLogo} {selectedOtaLabel} par koi promotion nahi mila</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 font-medium">{selectedOtaLogo} {selectedOtaLabel} se <b>{pulledPromos.length}</b> promotion mila:</p>
                {pulledPromos.map(promo => {
                  const alreadyImported = importedIds.has(promo.id)
                  return (
                    <div key={promo.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${alreadyImported ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800">{promo.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${promo.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {promo.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          💰 {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% off` : `₹${promo.discountValue} off`}
                          &nbsp;·&nbsp; 🌙 Min {promo.minStay} night
                          &nbsp;·&nbsp; 📅 {promo.startDate} → {promo.endDate}
                        </p>
                      </div>
                      <button
                        onClick={() => handleImport(promo)}
                        disabled={alreadyImported}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${alreadyImported ? 'bg-green-100 text-green-700 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      >
                        {alreadyImported ? '✓ Imported' : '⬇ Import'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Section 2: My Promotions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-purple-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <h3 className="font-bold text-white text-lg">Mere Promotions</h3>
              <p className="text-white/80 text-xs">Promotions banao aur OTA par push karo</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-purple-700 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-purple-50"
          >
            {showForm ? '✕ Cancel' : '+ Naya Promotion'}
          </button>
        </div>

        <div className="p-6">
          {/* Add Form */}
          {showForm && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-5">
              <p className="text-sm font-semibold text-purple-800 mb-4">📋 Naya Promotion</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Promotion Title *</label>
                  <input type="text" placeholder="e.g. Early Bird Special"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Discount Type *</label>
                  <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Value * {form.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'}</label>
                  <input type="number" placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 500'} min="0"
                    value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Min Stay (Nights)</label>
                  <input type="number" min="1"
                    value={form.minStay} onChange={e => setForm({ ...form, minStay: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">End Date *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">OTA (Push Kahan Karna Hai) *</label>
                  <select value={form.targetOta} onChange={e => setForm({ ...form, targetOta: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                    <option value="">-- OTA Select Karo --</option>
                    {otaList.map(o => (
                      <option key={o.name} value={o.name}>{o.logo} {o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSavePromo}
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                  ✓ Save Karo
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* My Promotions List */}
          {myPromos.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
              <p className="text-2xl mb-2">🎁</p>
              <p className="text-sm font-medium text-gray-600">Koi promotion nahi hai abhi</p>
              <p className="text-xs text-gray-400 mt-1">OTA se pull karo ya naya promotion banao</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myPromos.map(promo => {
                const otaInfo = otaList.find(o => o.name === promo.otaSource)
                return (
                  <div key={promo.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    {/* Card Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800">{promo.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${promo.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {promo.status}
                          </span>
                          {promo.isPushed && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">✓ Pushed</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          💰 {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% off` : `₹${promo.discountValue} off`}
                          &nbsp;·&nbsp; 🌙 Min {promo.minStay} night
                          &nbsp;·&nbsp; 📅 {promo.startDate} → {promo.endDate}
                          &nbsp;·&nbsp; {otaInfo?.logo} {otaInfo?.label}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePush(promo.id)}
                          disabled={pushingId === promo.id}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${promo.isPushed ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' : 'bg-blue-600 text-white hover:bg-blue-700'} disabled:opacity-50`}
                        >
                          {pushingId === promo.id ? '⏳ Pushing...' : promo.isPushed ? '🔄 Re-Push' : '📤 OTA par Push'}
                        </button>
                        <button
                          onClick={() => handleEditOpen(promo)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${editingId === promo.id ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                        >
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(promo.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50">
                          🗑
                        </button>
                      </div>
                    </div>

                    {/* Inline Edit Form — expand hoga */}
                    {editingId === promo.id && (
                      <div className="border-t border-yellow-200 bg-yellow-50 p-5">
                        <p className="text-xs font-semibold text-yellow-800 mb-3">✏️ Promotion Edit Karo</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-gray-600 block mb-1">Promotion Title *</label>
                            <input type="text" placeholder="e.g. Early Bird Special"
                              value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Discount Type *</label>
                            <select value={editForm.discountType} onChange={e => setEditForm({ ...editForm, discountType: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                              <option value="PERCENTAGE">Percentage (%)</option>
                              <option value="FIXED">Fixed Amount (₹)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Value * {editForm.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'}</label>
                            <input type="number" min="0"
                              value={editForm.discountValue} onChange={e => setEditForm({ ...editForm, discountValue: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Min Stay (Nights)</label>
                            <input type="number" min="1"
                              value={editForm.minStay} onChange={e => setEditForm({ ...editForm, minStay: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                            <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                              <option value="ACTIVE">Active</option>
                              <option value="INACTIVE">Inactive</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Start Date *</label>
                            <input type="date" value={editForm.startDate} onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">End Date *</label>
                            <input type="date" value={editForm.endDate} onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-gray-600 block mb-1">OTA *</label>
                            <select value={editForm.targetOta} onChange={e => setEditForm({ ...editForm, targetOta: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                              <option value="">-- OTA Select Karo --</option>
                              {otaList.map(o => (
                                <option key={o.name} value={o.name}>{o.logo} {o.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => handleEditSave(promo.id)}
                            className="px-5 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600">
                            ✓ Save Karo
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ✅ Mock OTA Ranking Data — Real API baad mein
const OTA_RANKINGS = [
  {
    name: 'BOOKING_COM',
    label: 'Booking.com',
    logo: '🏨',
    color: 'blue',
    propertyRanking: 10,
    reviewScore: 8.5,
    totalReviews: 124,
    profileScore: 90,
    cancellationPolicy: 'Free Cancellation (24hrs)',
    currentCommission: '15%',
    conversionRate: '4.2%',
    lastUpdated: 'Today',
  },
  {
    name: 'MAKEMYTRIP',
    label: 'MakeMyTrip',
    logo: '✈️',
    color: 'red',
    propertyRanking: 7,
    reviewScore: 4.3,
    totalReviews: 89,
    profileScore: 85,
    cancellationPolicy: 'Non-Refundable',
    currentCommission: '12%',
    conversionRate: '3.8%',
    lastUpdated: 'Today',
  },
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
  const [activeTab, setActiveTab] = useState<'channels' | 'ranking' | 'promotions'>('channels')

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
        showToast("Channel connect nahi ho saka!", "error")
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
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

        {/* ✅ Tabs */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setActiveTab('channels')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'channels' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            🔗 OTA Channels
          </button>
          <button onClick={() => setActiveTab('ranking')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ranking' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            📊 OTA Ranking Tracker
          </button>
          <button onClick={() => setActiveTab('promotions')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'promotions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            🎁 Promotions
          </button>
        </div>

        {/* ✅ OTA Channels Tab */}
        {activeTab === 'channels' && (
          <>
            {loading ? (
              <p className="text-gray-400">Loading channels...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
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
          </>
        )}

        {/* ✅ OTA Ranking Tracker Tab */}
        {activeTab === 'ranking' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                📊 <b>OTA Ranking Tracker</b> — Abhi demo data dikh raha hai. Real data ke liye OTA Partner API keys add karo.
              </p>
            </div>

            {OTA_RANKINGS.map((ota) => (
              <div key={ota.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className={`px-6 py-4 flex items-center justify-between ${ota.name === 'BOOKING_COM' ? 'bg-blue-600' : 'bg-red-500'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ota.logo}</span>
                    <div>
                      <h3 className="font-bold text-white text-lg">{ota.label}</h3>
                      <p className="text-white/80 text-xs">Last Updated: {ota.lastUpdated}</p>
                    </div>
                  </div>
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Demo Data
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">🏆 Property Ranking</p>
                    <p className="text-2xl font-bold text-gray-900">#{ota.propertyRanking}</p>
                    <p className="text-xs text-gray-400">in your area</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">⭐ Review Score</p>
                    <p className="text-2xl font-bold text-yellow-500">{ota.reviewScore}</p>
                    <p className="text-xs text-gray-400">{ota.totalReviews} reviews</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">📈 Profile Score</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-green-600">{ota.profileScore}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${ota.profileScore}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">📋 Cancellation Policy</p>
                    <p className="text-sm font-semibold text-gray-800">{ota.cancellationPolicy}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">💰 Current Commission</p>
                    <p className="text-2xl font-bold text-orange-500">{ota.currentCommission}</p>
                    <p className="text-xs text-gray-400">per booking</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">🎯 Conversion Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{ota.conversionRate}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: ota.conversionRate }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Promotions Tab */}
        {activeTab === 'promotions' && (
          <PromotionsTab otaList={OTA_LIST} />
        )}

      </div>

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
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm">Connect</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
