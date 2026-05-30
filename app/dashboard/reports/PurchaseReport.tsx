"use client";
import { useState, useEffect } from "react";

export default function PurchaseReport({ hotelId }: { hotelId: string }) {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [form, setForm] = useState({ itemName: "", category: "", date: "", amount: "" });
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (hotelId) fetchPurchases(); }, [hotelId]);

  const fetchPurchases = async () => {
    const res = await fetch(`/api/purchase?hotelId=${hotelId}`);
    const data = await res.json();
    setPurchases(data.purchases || []);
  };

  const handleAdd = async () => {
    if (!form.itemName || !form.category || !form.date || !form.amount) {
      alert("Sab fields bharo!"); return;
    }
    setLoading(true);
    const res = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelId, ...form }),
    });
    if (res.ok) {
      setForm({ itemName: "", category: "", date: "", amount: "" });
      fetchPurchases();
    }
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
      {/* Form */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <input type="text" placeholder="Item Name" value={form.itemName}
          onChange={(e) => setForm({ ...form, itemName: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="text" placeholder="Category" value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="number" placeholder="Amount (₹)" value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <button onClick={handleAdd} disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-medium">
          + Add
        </button>
      </div>

      {/* Filter */}
      <div className="flex justify-end gap-3 mb-4">
        <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <button onClick={() => { setFilterFrom(""); setFilterTo(""); }}
          className="text-xs text-gray-500 hover:text-red-500 px-2">Clear</button>
      </div>

      {/* Table */}
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
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 text-xs">🗑️