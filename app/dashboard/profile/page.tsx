"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/Toast";
import { useToast } from "@/components/useToast";

export default function ProfilePage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [user, setUser] = useState({ name: "", email: "", role: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        router.push("/login");
      }
    } catch (error) {
      showToast("Profile load nahi ho saka!", "error");
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword) {
      showToast("Current password daalna zaroori hai!", "error");
      return;
    }
    if (!passwordForm.newPassword) {
      showToast("Naya password daalna zaroori hai!", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("Naya password kam se kam 6 characters ka hona chahiye!", "error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Dono passwords match nahi kar rahe!", "error");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Password successfully change ho gaya! ✅", "success");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showToast(data.error || "Password change nahi ho saka!", "error");
      }
    } catch (error) {
      showToast("Kuch galat hua, dobara try karo!", "error");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">HotelPro</h1>
        <div className="flex gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-600 hover:text-blue-600">
            Dashboard
          </button>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h2>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "profile" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
            }`}
          >
            👤 Profile Info
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "password" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
            }`}
          >
            🔒 Password Change
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mt-1 inline-block">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Email Address</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Role</p>
                <p className="text-sm font-medium text-gray-900">{user.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 w-full py-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100"
            >
              🚪 Logout
            </button>
          </div>
        )}

        {activeTab === "password" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Password Change Karo</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Naya Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Naya Password Confirm Karo</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Changing..." : "Password Change Karo"}
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}