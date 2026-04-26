"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("Email aur password daalo!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("staffToken", data.token);
        localStorage.setItem("staff", JSON.stringify(data.staff));
        router.push("/staff-dashboard");
      } else {
        setError(data.error || "Login nahi ho saka!");
      }
    } catch (error) {
      setError("Kuch galat hua, dobara try karo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">HotelPro</h1>
          <p className="text-gray-500 mt-2 text-sm">Staff Login Portal</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="apna email daalo"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="apna password daalo"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              ❌ {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Login ho raha hai..." : "Login Karo"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          <a href="/forgot-password?type=staff" className="text-blue-500 hover:underline">
            Forgot Password?
          </a>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          Hotel Owner?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Owner Login
          </a>
        </p>
      </div>
    </div>
  );
}