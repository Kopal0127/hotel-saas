"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type ServiceType = "FOOD" | "DRINKS" | "OTHER";

interface Category {
  id: string;
  name: string;
  serviceType: ServiceType;
  items: Item[];
}

interface Item {
  id: string;
  categoryId: string;
  name: string;
  itemCategory: string;
  price: number;
  minBaseline: number;
  stock: number;
  status: string;
  stockUpdated: string;
}

export default function RoomServicePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ServiceType>("FOOD");
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotelId, setHotelId] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [viewingItem, setViewingItem] = useState<Item | null>(null);
  const [selectedCatId, setSelectedCatId] = useState("");

  // Forms
  const [catForm, setCatForm] = useState({ name: "" });
  const [itemForm, setItemForm] = useState({
    name: "", itemCategory: "", price: "", minBaseline: "", stock: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const hotelsRes = await fetch("/api/hotels");
      const hotelsData = await hotelsRes.json();
      const hId = hotelsData.hotels?.[0]?.id;
      if (!hId) return;
      setHotelId(hId);

      const res = await fetch(`/api/service-categories?hotelId=${hId}&serviceType=${activeTab}`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Category CRUD
  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return alert("Category name daalo!");
    try {
      if (editingCat) {
        await fetch("/api/service-categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCat.id, name: catForm.name }),
        });
      } else {
        await fetch("/api/service-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hotelId, name: catForm.name, serviceType: activeTab }),
        });
      }
      setCatForm({ name: "" });
      setEditingCat(null);
      setShowCatModal(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Category aur uske saare items delete ho jayenge. Sure?")) return;
    await fetch(`/api/service-categories?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  // Item CRUD
  const handleSaveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.itemCategory.trim()) return alert("Sab fields bharo!");
    try {
      if (editingItem) {
        await fetch("/api/service-items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingItem.id, ...itemForm }),
        });
      } else {
        await fetch("/api/service-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId: selectedCatId, ...itemForm }),
        });
      }
      setItemForm({ name: "", itemCategory: "", price: "", minBaseline: "", stock: "" });
      setEditingItem(null);
      setShowItemModal(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Item delete karna chahte hain?")) return;
    await fetch(`/api/service-items?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const tabConfig = [
    { key: "FOOD", label: "🍽️ Foods", color: "bg-orange-500" },
    { key: "DRINKS", label: "🥤 Drinks", color: "bg-blue-500" },
    { key: "OTHER", label: "🛎️ Other Service", color: "bg-purple-500" },
  ];

  const allItems = categories.flatMap(c => c.items.map(i => ({ ...i, categoryName: c.name })));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🛎️ Room Service</h2>
          <p className="text-gray-500 text-sm mt-1">Foods, Drinks aur Other Services manage karo</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ServiceType)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? `${tab.color} text-white shadow-sm`
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => { setEditingCat(null); setCatForm({ name: "" }); setShowCatModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Add Category
          </button>
          <button
            onClick={() => {
              if (categories.length === 0) return alert("Pehle ek category banao!");
              setEditingItem(null);
              setSelectedCatId(categories[0].id);
              setItemForm({ name: "", itemCategory: "", price: "", minBaseline: "", stock: "" });
              setShowItemModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            + Add Item
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">⏳</p>
            <p>Loading...</p>
          </div>
        ) : allItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📦</p>
            <p className="font-medium">Koi item nahi hai abhi</p>
            <p className="text-sm mt-1">Upar se Category aur Item add karo!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Baseline</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">{(item as any).categoryName}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {item.itemCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.minBaseline} pcs</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.stock} pcs</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(item.stockUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          item.status === "LOW"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {item.status === "LOW" ? "⚠ Low" : "✓ Normal"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* View */}
                          <button
                            onClick={() => { setViewingItem(item); setShowViewModal(true); }}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                            title="View"
                          >
                            👁️
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setItemForm({
                                name: item.name,
                                itemCategory: item.itemCategory,
                                price: String(item.price),
                                minBaseline: String(item.minBaseline),
                                stock: String(item.stock),
                              });
                              setSelectedCatId(item.categoryId);
                              setShowItemModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Categories section neeche */}
            <div className="border-t border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                    <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                    <span className="text-xs text-gray-400">({cat.items.length} items)</span>
                    <button
                      onClick={() => { setEditingCat(cat); setCatForm({ name: cat.name }); setShowCatModal(true); }}
                      className="text-blue-500 hover:text-blue-700 text-xs"
                    >✏️</button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingCat ? "Edit Category" : "Add Category"}
            </h3>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">Category Name</label>
              <input
                type="text"
                value={catForm.name}
                onChange={(e) => setCatForm({ name: e.target.value })}
                placeholder="e.g. Food and Beverages"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveCategory}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                {editingCat ? "Update" : "Add Category"}
              </button>
              <button onClick={() => { setShowCatModal(false); setEditingCat(null); }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingItem ? "Edit Item" : "Add Item"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Item Category</label>
                <input
                  type="text"
                  value={itemForm.itemCategory}
                  onChange={(e) => setItemForm({ ...itemForm, itemCategory: e.target.value })}
                  placeholder="e.g. Food, Drinks, Fruits"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Item Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Chocolate Ice Cream"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="250"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Min Baseline</label>
                  <input
                    type="number"
                    value={itemForm.minBaseline}
                    onChange={(e) => setItemForm({ ...itemForm, minBaseline: e.target.value })}
                    placeholder="5"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Stock</label>
                  <input
                    type="number"
                    value={itemForm.stock}
                    onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })}
                    placeholder="20"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSaveItem}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors">
                {editingItem ? "Update Item" : "Add Item"}
              </button>
              <button onClick={() => { setShowItemModal(false); setEditingItem(null); }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">👁️ Item Details</h3>
            <div className="space-y-3">
              {[
                { label: "Item Name", value: viewingItem.name },
                { label: "Item Category", value: viewingItem.itemCategory },
                { label: "Price", value: `₹${viewingItem.price}` },
                { label: "Min Baseline", value: `${viewingItem.minBaseline} pcs` },
                { label: "Stock", value: `${viewingItem.stock} pcs` },
                { label: "Status", value: viewingItem.status },
                { label: "Last Updated", value: new Date(viewingItem.stockUpdated).toLocaleDateString("en-IN") },
              ].map((row, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-medium text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowViewModal(false)}
              className="w-full mt-4 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}