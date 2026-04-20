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

interface OrderItem {
  item: Item;
  qty: number;
}

export default function RoomServicePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ServiceType>("FOOD");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [hotelId, setHotelId] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online" | "Due">("Cash");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [activeView, setActiveView] = useState<"pos" | "manage">("pos");

  // Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [viewingItem, setViewingItem] = useState<Item | null>(null);
  const [selectedCatId, setSelectedCatId] = useState("");

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
      const cats = data.categories || [];
      setCategories(cats);
      if (cats.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(cats[0].id);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    setSelectedCategoryId("");
    setOrderItems([]);
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Order logic
  const addToOrder = (item: Item) => {
    setOrderItems(prev => {
      const existing = prev.find(o => o.item.id === item.id);
      if (existing) {
        return prev.map(o => o.item.id === item.id ? { ...o, qty: o.qty + 1 } : o);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (itemId: string, delta: number) => {
    setOrderItems(prev => {
      return prev
        .map(o => o.item.id === itemId ? { ...o, qty: o.qty + delta } : o)
        .filter(o => o.qty > 0);
    });
  };

  const subtotal = orderItems.reduce((sum, o) => sum + o.item.price * o.qty, 0);
  const discountAmount = Math.round(subtotal * discount / 100);
  const total = subtotal - discountAmount;

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

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
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

      <div className="px-4 md:px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">🛎️ Room Service</h2>
            <p className="text-gray-500 text-xs mt-0.5">Foods, Drinks aur Other Services</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("pos")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === "pos" ? "bg-blue-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}
            >
              🛒 POS View
            </button>
            <button
              onClick={() => setActiveView("manage")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === "manage" ? "bg-blue-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}
            >
              ⚙️ Manage
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-4">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ServiceType)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key ? `${tab.color} text-white shadow-sm` : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* POS VIEW */}
        {activeView === "pos" && (
          <div className="flex gap-4 h-[calc(100vh-220px)]">

            {/* LEFT — Categories */}
            <div className="w-48 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-y-auto flex-shrink-0">
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase">Categories</p>
              </div>
              {loading ? (
                <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
              ) : categories.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">
                  Koi category nahi<br />
                  <button onClick={() => setActiveView("manage")} className="text-blue-500 underline mt-1">Add karo</button>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedCategoryId === cat.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {cat.name}
                      <span className={`text-xs ml-1 ${selectedCategoryId === cat.id ? "text-blue-200" : "text-gray-400"}`}>
                        ({cat.items.length})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CENTER — Items */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-y-auto">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  {selectedCategory ? selectedCategory.name : "Category select karo"}
                </p>
                <span className="text-xs text-gray-400">{selectedCategory?.items.length || 0} items</span>
              </div>

              {!selectedCategory || selectedCategory.items.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="text-sm">Koi item nahi hai</p>
                  <button onClick={() => setActiveView("manage")} className="text-blue-500 text-xs underline mt-2">
                    Items add karo
                  </button>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedCategory.items.map((item) => {
                    const orderItem = orderItems.find(o => o.item.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => addToOrder(item)}
                        className={`relative border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                          orderItem ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {/* Green dot */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-gray-500">{item.itemCategory}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">{item.name}</p>
                        <p className="text-sm font-bold text-blue-600">₹{item.price}</p>

                        {/* Qty badge */}
                        {orderItem && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                            {orderItem.qty}
                          </div>
                        )}

                        {/* +/- buttons */}
                        {orderItem && (
                          <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="w-6 h-6 bg-red-100 text-red-600 rounded-full text-sm font-bold hover:bg-red-200 flex items-center justify-center"
                            >−</button>
                            <span className="text-sm font-semibold text-gray-900">{orderItem.qty}</span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-bold hover:bg-green-200 flex items-center justify-center"
                            >+</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT — Order Summary */}
            <div className="w-72 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Order Summary</h3>
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto p-3">
                {orderItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">🛒</p>
                    <p className="text-xs">No items added yet.<br />Select items from the menu.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-4 text-xs font-semibold text-gray-400 uppercase px-1">
                      <span className="col-span-2">Items</span>
                      <span className="text-center">Qty</span>
                      <span className="text-right">Price</span>
                    </div>
                    {orderItems.map((o) => (
                      <div key={o.item.id} className="grid grid-cols-4 items-center text-sm py-2 border-b border-gray-50">
                        <span className="col-span-2 text-gray-800 font-medium text-xs leading-tight">{o.item.name}</span>
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateQty(o.item.id, -1)}
                            className="w-5 h-5 bg-gray-100 rounded text-xs font-bold hover:bg-red-100 text-gray-600">−</button>
                          <span className="text-xs font-semibold w-4 text-center">{o.qty}</span>
                          <button onClick={() => updateQty(o.item.id, 1)}
                            className="w-5 h-5 bg-gray-100 rounded text-xs font-bold hover:bg-green-100 text-gray-600">+</button>
                        </div>
                        <span className="text-right text-xs font-semibold text-gray-900">₹{o.item.price * o.qty}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary Footer */}
              <div className="p-4 border-t border-gray-100 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>

                {/* Discount */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Discount %</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-blue-400"
                    min={0} max={100}
                  />
                  {discount > 0 && <span className="text-xs text-red-500">-₹{discountAmount}</span>}
                </div>

                {/* Notes */}
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="✏️ Notes..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400"
                />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-blue-600">₹{total}</span>
                </div>

                {/* Payment Method */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment Method</p>
                  <div className="flex gap-2">
                    {(["Cash", "Online", "Due"] as const).map((m) => (
                      <label key={m} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value={m}
                          checked={paymentMethod === m}
                          onChange={() => setPaymentMethod(m)}
                          className="accent-blue-600"
                        />
                        <span className="text-xs text-gray-600">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (orderItems.length === 0) return alert("Koi item add nahi kiya!");
                      alert(`Order saved!\nTotal: ₹${total}\nPayment: ${paymentMethod}`);
                      setOrderItems([]);
                      setDiscount(0);
                      setNotes("");
                    }}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      if (orderItems.length === 0) return alert("Koi item add nahi kiya!");
                      alert(`eBill generated!\nTotal: ₹${total}\nPayment: ${paymentMethod}`);
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save & eBill
                  </button>
                  <button
                    onClick={() => {
                      if (orderItems.length === 0) return alert("Koi item add nahi kiya!");
                      alert(`KOT sent!\n${orderItems.map(o => `${o.item.name} x${o.qty}`).join('\n')}`);
                    }}
                    className="w-full bg-blue-700 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors"
                  >
                    Save & Send KOT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MANAGE VIEW */}
        {activeView === "manage" && (
          <div>
            <div className="flex gap-3 mb-4">
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

            {loading ? (
              <div className="text-center py-16 text-gray-400">⏳ Loading...</div>
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
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item Category</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Min Baseline</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Updated</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {allItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-700 font-medium">{(item as any).categoryName}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{item.itemCategory}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{item.price}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.minBaseline} pcs</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.stock} pcs</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(item.stockUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${item.status === "LOW" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                              {item.status === "LOW" ? "⚠ Low" : "✓ Normal"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setViewingItem(item); setShowViewModal(true); }}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600" title="View">👁️</button>
                              <button onClick={() => {
                                setEditingItem(item);
                                setItemForm({ name: item.name, itemCategory: item.itemCategory, price: String(item.price), minBaseline: String(item.minBaseline), stock: String(item.stock) });
                                setSelectedCatId(item.categoryId);
                                setShowItemModal(true);
                              }} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600" title="Edit">✏️</button>
                              <button onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600" title="Delete">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Categories chips */}
                <div className="border-t border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                        <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                        <span className="text-xs text-gray-400">({cat.items.length})</span>
                        <button onClick={() => { setEditingCat(cat); setCatForm({ name: cat.name }); setShowCatModal(true); }}
                          className="text-blue-500 hover:text-blue-700 text-xs">✏️</button>
                        <button onClick={() => handleDeleteCategory(cat.id)}
                          className="text-red-500 hover:text-red-700 text-xs">🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingCat ? "Edit Category" : "Add Category"}</h3>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">Category Name</label>
              <input type="text" value={catForm.name} onChange={(e) => setCatForm({ name: e.target.value })}
                placeholder="e.g. Mocktails, Starters" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveCategory} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700">
                {editingCat ? "Update" : "Add Category"}
              </button>
              <button onClick={() => { setShowCatModal(false); setEditingCat(null); }} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50">
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingItem ? "Edit Item" : "Add Item"}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                <select value={selectedCatId} onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Item Category</label>
                <input type="text" value={itemForm.itemCategory} onChange={(e) => setItemForm({ ...itemForm, itemCategory: e.target.value })}
                  placeholder="e.g. Food, Drinks" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Item Name</label>
                <input type="text" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Blue Lagoon" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Price (₹)</label>
                <input type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="250" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Min Baseline</label>
                  <input type="number" value={itemForm.minBaseline} onChange={(e) => setItemForm({ ...itemForm, minBaseline: e.target.value })}
                    placeholder="5" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Stock</label>
                  <input type="number" value={itemForm.stock} onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })}
                    placeholder="20" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSaveItem} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700">
                {editingItem ? "Update Item" : "Add Item"}
              </button>
              <button onClick={() => { setShowItemModal(false); setEditingItem(null); }} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50">
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
            <button onClick={() => setShowViewModal(false)} className="w-full mt-4 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}