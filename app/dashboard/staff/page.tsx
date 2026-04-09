"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/Toast";
import { useToast } from "@/components/useToast";
import { useAuth } from "@/components/useAuth";

interface Staff {
  id: string; employeeId?: string; name: string; email: string;
  phone?: string; role: string; createdAt: string;
}
interface Attendance {
  id: string; staffId: string; date: string;
  checkIn?: string; checkOut?: string;
  totalHours?: number; status: string;
  staff: { id: string; name: string; email: string };
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function StaffPage() {
  useAuth();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [hotelId, setHotelId] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"staff" | "attendance" | "report">("staff");
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Report filters
  const [reportStaff, setReportStaff] = useState("");
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  const [editAttendance, setEditAttendance] = useState<{
    staffId: string; date: string; status: string; checkIn: string; checkOut: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/hotels", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.hotels?.[0]) setHotelId(data.hotels[0].id); });
  }, []);

  useEffect(() => {
    if (hotelId) { fetchStaff(); fetchAttendance(); }
  }, [hotelId, month, year, selectedStaff]);

  async function fetchStaff() {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/staff?hotelId=${hotelId}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setStaffList(data.staff || []);
  }

  async function fetchAttendance() {
    const token = localStorage.getItem("token");
    let url = `/api/attendance?hotelId=${hotelId}&month=${month}&year=${year}`;
    if (selectedStaff) url += `&staffId=${selectedStaff}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setAttendance(data.attendance || []);
  }

  async function handleAddStaff() {
    if (!form.name || !form.email || !form.password) {
      showToast("Naam, email aur password zaroori hai!", "error"); return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, hotelId })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Staff add ho gaya! Employee ID: ${data.staff.employeeId} ✅`, "success");
      setForm({ name: "", email: "", password: "", phone: "" });
      setShowForm(false);
      fetchStaff();
    } else {
      showToast(data.error || "Error!", "error");
    }
    setLoading(false);
  }

  async function handleDeleteStaff(id: string) {
    if (!confirm("Staff delete karna chahte ho?")) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/staff?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    showToast("Staff delete ho gaya!", "success");
    fetchStaff();
  }

  async function handleManualAttendance() {
    if (!editAttendance) return;
    const token = localStorage.getItem("token");
    const res = await fetch("/api/attendance", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editAttendance)
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Attendance update ho gayi! ✅", "success");
      setEditAttendance(null);
      fetchAttendance();
    } else {
      showToast(data.error || "Error!", "error");
    }
  }

  async function downloadReport() {
    if (!reportFrom || !reportTo) {
      showToast("From aur To date select karo!", "warning"); return;
    }

    const token = localStorage.getItem("token");
    let url = `/api/attendance?hotelId=${hotelId}`;
    if (reportStaff) url += `&staffId=${reportStaff}`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();

    const from = new Date(reportFrom);
    const to = new Date(reportTo);

    const filtered = (data.attendance || []).filter((a: Attendance) => {
      const d = new Date(a.date);
      return d >= from && d <= to && (!reportStaff || a.staffId === reportStaff);
    });

    if (filtered.length === 0) {
      showToast("Is range mein koi attendance nahi mili!", "warning"); return;
    }

    const staffMap: Record<string, Staff> = {};
    staffList.forEach(s => { staffMap[s.id] = s; });

    const csv = [
      ["Employee ID", "Staff Name", "Email", "Date", "Status", "Check In", "Check Out", "Total Hours"],
      ...filtered.map((a: Attendance) => {
        const s = staffMap[a.staffId];
        return [
          s?.employeeId || "—",
          a.staff?.name || s?.name || "—",
          a.staff?.email || s?.email || "—",
          new Date(a.date).toLocaleDateString("en-IN"),
          a.status,
          a.checkIn ? new Date(a.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—",
          a.checkOut ? new Date(a.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—",
          a.totalHours ? `${a.totalHours} hrs` : "—",
        ];
      })
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url2 = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url2;
    a.download = `attendance_report_${reportFrom}_to_${reportTo}.csv`;
    a.click();
    showToast(`Report download ho gayi! ${filtered.length} records ✅`, "success");
  }

  function getDaysInMonth() { return new Date(year, month, 0).getDate(); }

  function getAttendanceForDay(staffId: string, day: number) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return attendance.find(a => a.staffId === staffId && a.date.startsWith(dateStr));
  }

  function getStatusColor(status: string) {
    if (status === "PRESENT") return "bg-green-100 text-green-700";
    if (status === "HALF_DAY") return "bg-yellow-100 text-yellow-700";
    if (status === "ABSENT") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-500";
  }

  function getMonthStats(staffId: string) {
    const sa = attendance.filter(a => a.staffId === staffId);
    return {
      present: sa.filter(a => a.status === "PRESENT").length,
      halfDay: sa.filter(a => a.status === "HALF_DAY").length,
      absent: sa.filter(a => a.status === "ABSENT").length,
      totalHours: Math.round(sa.reduce((s, a) => s + (a.totalHours || 0), 0) * 10) / 10
    };
  }

  const daysInMonth = getDaysInMonth();

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-3 md:gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</button>
          <button onClick={() => router.push("/login")} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">👥 Staff Management</h2>
          {activeTab === "staff" && (
            <button onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
              + Add Staff
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab("staff")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "staff" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
            👥 Staff List
          </button>
          <button onClick={() => setActiveTab("attendance")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "attendance" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
            📅 Attendance
          </button>
          <button onClick={() => setActiveTab("report")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "report" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
            📥 Download Report
          </button>
        </div>

        {/* Add Staff Form */}
        {activeTab === "staff" && showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Naya Staff Add Karo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Naam</label>
                <input type="text" placeholder="Staff ka naam" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                <input type="email" placeholder="staff@email.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                <input type="password" placeholder="Password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone (Optional)</label>
                <input type="text" placeholder="Phone number" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAddStaff} disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Adding..." : "Staff Add Karo"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Staff List */}
        {activeTab === "staff" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {staffList.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">👥</div>
                <p>Koi staff nahi hai — Add Staff se add karo</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Employee ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Staff</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Phone</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Role</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Joined</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map(s => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                          {s.employeeId || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.phone || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{s.role}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(s.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDeleteStaff(s.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium">
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Staff Filter</label>
                <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Sab Staff --</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.employeeId} — {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Month</label>
                <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Year</label>
                <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {staffList.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
                <div className="text-5xl mb-4">👥</div>
                <p>Pehle Staff List mein staff add karo</p>
              </div>
            ) : (
              staffList
                .filter(s => !selectedStaff || s.id === selectedStaff)
                .map(s => {
                  const stats = getMonthStats(s.id);
                  return (
                    <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">{s.employeeId}</span>
                            <p className="font-semibold text-gray-900">{s.name}</p>
                          </div>
                          <p className="text-xs text-gray-500">{s.email}</p>
                        </div>
                        <div className="flex gap-3 text-xs">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">✅ Present: {stats.present}</span>
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">🌗 Half Day: {stats.halfDay}</span>
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">❌ Absent: {stats.absent}</span>
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">⏱ {stats.totalHours} hrs</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                          <thead className="bg-white border-b border-gray-100">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Date</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Status</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Check In</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Check Out</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Total Hours</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                              const att = getAttendanceForDay(s.id, day);
                              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                              const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
                              const isFuture = new Date(dateStr) > new Date();
                              return (
                                <tr key={day} className={`border-b border-gray-50 ${isToday ? "bg-yellow-50" : ""}`}>
                                  <td className="px-4 py-2 text-xs text-gray-700">
                                    {day} {MONTHS[month - 1].slice(0, 3)}
                                    {isToday && <span className="ml-1 bg-blue-600 text-white text-xs px-1 rounded">Today</span>}
                                  </td>
                                  <td className="px-4 py-2">
                                    {isFuture ? <span className="text-xs text-gray-300">—</span>
                                      : att ? (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(att.status)}`}>
                                          {att.status === "PRESENT" ? "✅ Present" : att.status === "HALF_DAY" ? "🌗 Half Day" : "❌ Absent"}
                                        </span>
                                      ) : <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">❌ Absent</span>}
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-600">
                                    {att?.checkIn ? new Date(att.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-600">
                                    {att?.checkOut ? new Date(att.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-600">
                                    {att?.totalHours ? `${att.totalHours} hrs` : "—"}
                                  </td>
                                  <td className="px-4 py-2">
                                    {!isFuture && (
                                      <button onClick={() => setEditAttendance({
                                        staffId: s.id, date: dateStr,
                                        status: att?.status || "PRESENT",
                                        checkIn: att?.checkIn ? new Date(att.checkIn).toTimeString().slice(0, 5) : "",
                                        checkOut: att?.checkOut ? new Date(att.checkOut).toTimeString().slice(0, 5) : "",
                                      })} className="text-blue-500 hover:text-blue-700 text-xs font-medium">
                                        ✏️ Edit
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* Download Report Tab */}
        {activeTab === "report" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">📥 Attendance Report Download Karo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Staff Select Karo</label>
                <select value={reportStaff} onChange={(e) => setReportStaff(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                  <option value="">-- Sab Staff --</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.employeeId} — {s.name}</option>
                  ))}
                </select>
              </div>
              <div></div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">From Date</label>
                <input type="date" value={reportFrom}
                  onChange={(e) => setReportFrom(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">To Date</label>
                <input type="date" value={reportTo}
                  onChange={(e) => setReportTo(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700">
                📋 Report mein aayega: Employee ID, Name, Email, Date, Status, Check In, Check Out, Total Hours
              </p>
            </div>

            <button onClick={downloadReport}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
              📥 CSV Report Download Karo
            </button>
          </div>
        )}

        {/* Edit Attendance Modal */}
        {editAttendance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✏️ Attendance Edit Karo</h3>
              <p className="text-sm text-gray-500 mb-4">Date: {editAttendance.date}</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <select value={editAttendance.status}
                    onChange={(e) => setEditAttendance({ ...editAttendance, status: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                    <option value="PRESENT">✅ Present</option>
                    <option value="HALF_DAY">🌗 Half Day</option>
                    <option value="ABSENT">❌ Absent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Check In Time</label>
                  <input type="time" value={editAttendance.checkIn}
                    onChange={(e) => setEditAttendance({ ...editAttendance, checkIn: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Check Out Time</label>
                  <input type="time" value={editAttendance.checkOut}
                    onChange={(e) => setEditAttendance({ ...editAttendance, checkOut: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleManualAttendance}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 flex-1">
                  Save Karo
                </button>
                <button onClick={() => setEditAttendance(null)}
                  className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}