"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";
import { Toast } from "@/components/Toast";
import { useToast } from "@/components/useToast";

interface InventoryItem {
  id: string;
  itemName: string;
  description: string | null;
  category: string;
  quantity: number;
  status: string;
  createdAt: string;
}
interface Category {
  id: string;
  name: string;
}

export default function InventoryPage() {
  useAuth();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [hotelId, setHotelId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [form, setForm] = useState({
    itemName: "",
    description: "",
    category: "",
    quantity: "0",
    status: "IN_STOCK",
  });

    useEffect(() => {
    fetchHotelAndItems();
  }, []);

  const fetchHotelAndItems = async () => {
    try {
      const res = await fetch("/api/hotels");
      const data = await res.json();
      if (data.hotels && data.hotels.length > 0) {
        const hId = data.hotels[0].id;
        setHotelId(hId);
        fetchItems(hId);
        fetchCategories(hId);
      }
    } catch (error) {
      showToast("Data load nahi ho saka!", "error");
    }
  };

  const fetchItems = async (hId: string) => {
    try {
      const res = await fetch(`/api/inventory?hotelId=${hId}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      showToast("Items load nahi ho sake!", "error");
    } finally {
      setLoading(false);
    }
  };
  const fetchCategories = async (hId: string) => {
    try {
      const res = await fetch(`/api/inventory-categories?hotelId=${hId}`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      showToast("Categories load nahi ho saki!", "error");
    }
  };
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      showToast("Category name daalo!", "error");
      return;
    }
    setCategoryLoading(true);
    try {
      const res = await fetch("/api/inventory-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId, name: newCategoryName.trim() }),
      });
      if (res.ok) {
        showToast("✅ Category add ho gayi!", "success");
        setNewCategoryName("");
        fetchCategories(hotelId);
      } else {
        showToast("❌ Kuch galat hua!", "error");
      }
    } catch (error) {
      showToast("❌ Error!", "error");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Category delete karna chahte ho?")) return;
    try {
      const res = await fetch(`/api/inventory-categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("✅ Category delete ho gayi!", "success");
        fetchCategories(hotelId);
      } else {
        showToast("❌ Delete nahi ho saka!", "error");
      }
    } catch (error) {
      showToast("❌ Error!", "error");
    }
  };

  const handleSubmit = async () => {
    if (!form.itemName) {
      showToast("Item name daalo!", "error");
      return;
    }

    try {
      const method = editItem ? "PUT" : "POST";
      const body = editItem
        ? { id: editItem.id, ...form }
        : { hotelId, ...form };

      const res = await fetch("/api/inventory", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(editItem ? "✅ Item update ho gaya!" : "✅ Item add ho gaya!", "success");
        resetForm();
        fetchItems(hotelId);
      } else {
        showToast("❌ Kuch galat hua!", "error");
      }
    } catch (error) {
      showToast("❌ Error!", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete karna chahte ho?")) return;
    try {
      const res = await fetch(`/api/inventory?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("✅ Item delete ho gaya!", "success");
        fetchItems(hotelId);
      }
    } catch (error) {
      showToast("❌ Delete nahi ho saka!", "error");
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({
      itemName: item.itemName,
      description: item.description || "",
      category: item.category,
      quantity: item.quantity.toString(),
      status: item.status,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ itemName: "", description: "", category: "General", quantity: "0", status: "IN_STOCK" });
    setEditItem(null);
    setShowForm(false);
  };

  const filteredItems = items.filter(item => {
    const matchSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === "ALL" || item.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const statusColors: any = {
    IN_STOCK: "bg-green-100 text-green-700",
    LOW_STOCK: "bg-yellow-100 text-yellow-700",
    OUT_OF_STOCK: "bg-red-100 text-red-700",
  };

  const statusLabels: any = {
    IN_STOCK: "🟢 In Stock",
    LOW_STOCK: "🟡 Low Stock",
    OUT_OF_STOCK: "🔴 Out of Stock",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3">
          <button onClick={() => router.push("/dashboard/rooms")} className="text-sm text-gray-600 hover:text-blue-600">
            ← Rooms
          </button>
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">
            Dashboard
          </button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📦 Stock Inventory</h2>
            <p className="text-sm text-gray-500 mt-1">Hotel ka saara inventory manage karo</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium"
            >
              + Add Category
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-purple-700 font-medium"
            >
              + Add New Inventory
            </button>
          </div>
        </div>
        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🗂️ Manage Categories</h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Add new category */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Nayi category ka naam..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={categoryLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {categoryLoading ? "..." : "Add"}
                </button>
              </div>

              {/* Categories list */}
              <div className="max-h-64 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-6">Koi category nahi hai abhi</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                        <span className="text-sm text-gray-700">{cat.name}</span>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-red-400 hover:text-red-600 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editItem ? "✏️ Item Edit Karo" : "➕ Naya Item Add Karo"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Towel, Soap, Bedsheet"
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <input
                  type="text"
                  placeholder="e.g. White cotton towel 500gsm"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                >
                 {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="IN_STOCK">🟢 In Stock</option>
                  <option value="LOW_STOCK">🟡 Low Stock</option>
                  <option value="OUT_OF_STOCK">🔴 Out of Stock</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                {editItem ? "✅ Update" : "✅ Add Item"}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="🔍 Item search karo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 bg-white"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 bg-white"
          >
            <option value="ALL">All Categories</option>
           {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Items</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-yellow-600">{items.filter(i => i.status === "LOW_STOCK").length}</p>
            <p className="text-xs text-gray-500 mt-1">Low Stock</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-red-600">{items.filter(i => i.status === "OUT_OF_STOCK").length}</p>
            <p className="text-xs text-gray-500 mt-1">Out of Stock</p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
            <div className="text-5xl mb-4">📦</div>
            <p>Koi item nahi mila</p>
            <p className="text-sm mt-1">Upar button se items add karo!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{item.itemName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-500">{item.description || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{item.quantity}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}