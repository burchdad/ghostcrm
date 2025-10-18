"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import BrandPanel from "@/components/auth/BrandPanel";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex min-h-screen">
        {/* Left: Brand Panel */}
        <BrandPanel />

        {/* Right: Authentication */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          {/* Auth Form */}
          <AuthForm isLogin={isLogin} onToggle={setIsLogin} />
        </div>
      </div>
    </div>
  );
}
