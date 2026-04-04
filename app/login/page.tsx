"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/Toast";
import { useToast } from "@/components/useToast";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    hotelName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Validation function
  const validate = () => {
    if (!form.email) {
      showToast("Email daalna zaroori hai!", "error");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showToast("Sahi email daalo!", "error");
      return false;
    }
    if (!form.password) {
      showToast("Password daalna zaroori hai!", "error");
      return false;
    }
    if (form.password.length < 6) {
      showToast("Password kam se kam 6 characters ka hona chahiye!", "error");
      return false;
    }
    if (!isLogin) {
      if (!form.name) {
        showToast("Naam daalna zaroori hai!", "error");
        return false;
      }
      if (!form.hotelName) {
        showToast("Hotel ka naam daalna zaroori hai!", "error");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    if (!isLogin) {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Account ban gaya! Ab login karo.", "success");
        setTimeout(() => setIsLogin(true), 2000);
      } else {
        showToast(data.error || "Register nahi ho saka!", "error");
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
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        showToast(data.error || "Login nahi ho saka!", "error");
      }
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
            {isLogin ? "Apne account mein login karo" : "Naya account banao"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              !isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">

          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Aapka naam"
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Hotel Name</label>
              <input
                type="text"
                name="hotelName"
                placeholder="Aapke hotel ka naam"
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Login Karo" : "Account Banao"}
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isLogin ? "Account nahi hai? " : "Pehle se account hai? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-medium hover:underline"
          >
            {isLogin ? "Register karo" : "Login karo"}
          </button>
        </p>

      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}