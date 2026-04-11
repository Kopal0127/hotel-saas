"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get("type") || "owner";

  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOTP = async () => {
    if (!email) { setError("Email daalo!"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userType }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OTP bhej diya! Email check karo");
        setStep("otp");
      } else {
        setError(data.error || "Kuch galat hua!");
      }
    } catch {
      setError("Kuch galat hua, dobara try karo!");
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!otp) { setError("OTP daalo!"); return; }
    if (!newPassword) { setError("Naya password daalo!"); return; }
    if (newPassword.length < 6) { setError("Password kam se kam 6 characters ka hona chahiye!"); return; }
    if (newPassword !== confirmPassword) { setError("Dono passwords match nahi kar rahe!"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword, userType }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("success");
        setMessage("Password successfully reset ho gaya!");
      } else {
        setError(data.error || "Kuch galat hua!");
      }
    } catch {
      setError("Kuch galat hua, dobara try karo!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">HotelPro</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {userType === "staff" ? "Staff Password Reset" : "Password Reset"}
          </p>
        </div>

        {step === "email" && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🔐</div>
              <h2 className="text-lg font-semibold text-gray-800">Forgot Password?</h2>
              <p className="text-gray-500 text-sm mt-1">Apna email daalo — OTP bhej denge!</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input type="email" placeholder="apna email daalo" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">❌ {error}</div>}
            <button onClick={handleSendOTP} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? "OTP bhej rahe hain..." : "OTP Bhejo 📧"}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              <a href={userType === "staff" ? "/staff-login" : "/login"} className="text-blue-500 hover:underline">
                Wapas Login pe jao
              </a>
            </p>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">📧</div>
              <h2 className="text-lg font-semibold text-gray-800">OTP Check Karo</h2>
              {message && <p className="text-green-600 text-sm mt-1">{message}</p>}
              <p className="text-gray-500 text-sm mt-1"><b>{email}</b> pe OTP bheja hai</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">OTP (6 digits)</label>
              <input type="text" placeholder="123456" value={otp} maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-center text-2xl tracking-widest font-bold" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Naya Password</label>
              <input type="password" placeholder="naya password daalo" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password Confirm Karo</label>
              <input type="password" placeholder="dobara password daalo" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">❌ {error}</div>}
            <button onClick={handleResetPassword} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Reset ho raha hai..." : "Password Reset Karo 🔐"}
            </button>
            <button onClick={() => { setStep("email"); setError(""); }}
              className="w-full text-gray-500 text-sm hover:text-blue-600">
              Wapas jao
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-semibold text-gray-800">Password Reset Ho Gaya!</h2>
            <p className="text-green-600">{message}</p>
            <button onClick={() => router.push(userType === "staff" ? "/staff-login" : "/login")}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700">
              Login Karo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}