"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (!token) {
      router.push("/login");
      return;
    }

    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      router.push("/login");
      return;
    }
  }, []);
}