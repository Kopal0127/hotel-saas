'use client'
import { useState, useEffect } from 'react'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ guestName: '', guestEmail: '', amount: '', bookingId: '' })
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchPayments() }, [])

  async function fetchPayments() {
    setLoading(true)
    const res = await fetch('/api/payments')
    const data = await res.json()
    setPayments(data.payments || [])
    setLoading(false)
  }

  async function createPayment() {
    setCreating(true)
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        amount: parseFloat(form.amount),
        bookingId: form.bookingId || null,
      })
    })
    const data = await res.json()
    if (data.success) {
      setSuccess(`✅ Payment created! Order ID: ${data.orderId}`)
      setForm({ guestName: '', guestEmail: '', amount: '', bookingId: '' })
      fetchPayments()
    }
    setCreating(false)
  }

  async function markPaid(paymentId: string) {
    await fetch('/api/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId,
        razorpayPaymentId: 'pay_mock_' + Date.now(),
        status: 'success'
      })
    })
    fetchPayments()
  }

  function generateInvoice(payment: any) {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
          .invoice-title { font-size: 20px; color: #666; }
          .invoice-no { font-size: 14px; color: #999; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f3f4f6; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          .status { background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; }
          .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">HotelPro</div>
            <div style="color:#666; margin-top:8px;">Hotel Management System</div>
          </div>
          <div style="text-align:right">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-no">#INV-${payment.id.substr(0, 8).toUpperCase()}</div>
            <div style="color:#666; margin-top:8px;">Date: ${new Date(payment.createdAt).toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        <div style="margin-bottom:30px;">
          <div style="font-weight:bold; margin-bottom:8px;">Bill To:</div>
          <div>${payment.guestName}</div>
          <div style="color:#666;">${payment.guestEmail}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hotel Booking Payment</td>
              <td>₹${payment.amount.toLocaleString('en-IN')}</td>
              <td><span class="status">${payment.status}</span></td>
            </tr>
          </tbody>
        </table>

        <div class="total">Total: ₹${payment.amount.toLocaleString('en-IN')}</div>

        <div style="margin-top:30px; padding:20px; background:#f9fafb; border-radius:8px;">
          <div><strong>Payment ID:</strong> ${payment.razorpayId || payment.orderId}</div>
          <div style="margin-top:8px;"><strong>Currency:</strong> ${payment.currency}</div>
        </div>

        <div class="footer">
          <p>Thank you for choosing HotelPro!</p>
          <p>This is a computer generated invoice — no signature required.</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(invoiceHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const statusColor: any = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">💳 Payment Gateway</h1>
        <p className="text-gray-500 mt-1">Payments manage karo aur invoices generate karo</p>
      </div>

      {/* Create Payment Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">➕ New Payment Create Karo</h2>
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Guest Name *" value={form.guestName}
            onChange={e => setForm({ ...form, guestName: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Guest Email *" value={form.guestEmail}
            onChange={e => setForm({ ...form, guestEmail: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Amount (₹) *" type="number" value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Booking ID (optional)" value={form.bookingId}
            onChange={e => setForm({ ...form, bookingId: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={createPayment} disabled={creating || !form.guestName || !form.amount}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {creating ? '⏳ Creating...' : '💳 Create Payment'}
        </button>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-gray-800">📋 All Payments</h2>
        </div>
        {loading ? (
          <p className="p-6 text-gray-400">Loading...</p>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-5xl mb-4">💳</div>
            <p>Koi payment nahi hai abhi</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Guest</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{payment.guestName}</p>
                    <p className="text-xs text-gray-500">{payment.guestEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[payment.status]}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {payment.status === 'PENDING' && (
                        <button onClick={() => markPaid(payment.id)}
                          className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          ✓ Mark Paid
                        </button>
                      )}
                      <button onClick={() => generateInvoice(payment)}
                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        🖨️ Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}