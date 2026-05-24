"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/Toast";
import { useToast } from "@/components/useToast";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"owner" | "staff">("owner");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    hotelName: "",
  });

  const [staffForm, setStaffForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email) { showToast("Email daalna zaroori hai!", "error"); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { showToast("Sahi email daalo!", "error"); return false; }
    if (!form.password) { showToast("Password daalna zaroori hai!", "error"); return false; }
    if (form.password.length < 6) { showToast("Password kam se kam 6 characters ka hona chahiye!", "error"); return false; }
    if (isRegister) {
      if (!form.name) { showToast("Naam daalna zaroori hai!", "error"); return false; }
      if (!form.hotelName) { showToast("Hotel ka naam daalna zaroori hai!", "error"); return false; }
    }
    return true;
  };

  const handleOwnerSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    if (isRegister) {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Account ban gaya! Ab login karo.", "success");
        setTimeout(() => setIsRegister(false), 2000);
      } else {
        showToast(data.error || "Register nahi ho saca!", "error");
      }
    } else {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("tokenExpiry", String(Date.now() + 24 * 60 * 60 * 1000));
        showToast("Login successful! Dashboard pe ja rahe hain...", "success");
        setTimeout(() => { window.location.href = "/dashboard"; }, 1500);
      } else {
        showToast(data.error || "Login nahi ho saca!", "error");
      }
    }
    setLoading(false);
  };

  const handleStaffLogin = async () => {
    if (!staffForm.email) { showToast("Email daalo!", "error"); return; }
    if (!staffForm.password) { showToast("Password daalo!", "error"); return; }
    setLoading(true);
    const res = await fetch("/api/staff/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staffForm),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("staffToken", data.token);
      localStorage.setItem("staff", JSON.stringify(data.staff));
      showToast("Login successful!", "success");
      setTimeout(() => { window.location.href = "/staff-dashboard"; }, 1500);
    } else {
      showToast(data.error || "Login nahi ho saca!", "error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">HotelPro</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeTab === "owner"
              ? isRegister ? "Naya account banao" : "Apne account mein login karo"
              : "Staff login karo"}
          </p>
        </div>

        {/* Tabs — Owner | Staff */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button onClick={() => { setActiveTab("owner"); setIsRegister(false); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "owner" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>
            Owner Login
          </button>
          <button onClick={() => setActiveTab("staff")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "staff" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>
            Staff Login
          </button>
        </div>

        {/* Owner Tab */}
        {activeTab === "owner" && (
          <div className="flex flex-col gap-4">
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                <input type="text" name="name" placeholder="Aapka naam" onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input type="email" name="email" placeholder="email@example.com" onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <input type="password" name="password" placeholder="••••••••" onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              {!isRegister && (
                <div className="text-right mt-1">
                  <a href="/forgot-password?type=owner" className="text-xs text-blue-500 hover:underline">
                    Forgot Password?
                  </a>
                </div>
              )}
            </div>
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Hotel Name</label>
                <input type="text" name="hotelName" placeholder="Aapke hotel ka naam" onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            )}
            <button onClick={handleOwnerSubmit} disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-2 disabled:opacity-50">
              {loading ? "Please wait..." : isRegister ? "Account Banao" : "Login Karo"}
            </button>

            {/* Register link — sirf owner ke liye */}
            <p className="text-center text-sm text-gray-500 mt-2">
              {isRegister ? "Pehle se account hai? " : "Account nahi hai? "}
              <button onClick={() => setIsRegister(!isRegister)} className="text-blue-600 font-medium hover:underline">
                {isRegister ? "Login karo" : "Register karo"}
              </button>
            </p>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === "staff" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input type="email" placeholder="staff@email.com"
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <input type="password" placeholder="••••••••"
                onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              <div className="text-right mt-1">
                <a href="/forgot-password?type=staff" className="text-xs text-blue-500 hover:underline">
                  Forgot Password?
                </a>
              </div>
            </div>
            <button onClick={handleStaffLogin} disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-2 disabled:opacity-50">
              {loading ? "Please wait..." : "Staff Login Karo"}
            </button>
          </div>
        )}

      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}