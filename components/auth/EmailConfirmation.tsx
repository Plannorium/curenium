'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from '@/components/Button';

interface ConfirmResponse {
  message?: string;
}

export default function EmailConfirmation() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams?.get("email") || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } else {
      const data: ConfirmResponse = await res.json();
      setError(data.message || "An error occurred.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="relative z-10 w-full max-w-md text-center bg-dark-800/50 backdrop-blur-lg border border-dark-700 rounded-2xl shadow-2xl shadow-black/20 p-8">
          <h2 className="text-3xl font-bold mb-4 text-green-400">Email Confirmed!</h2>
          <p className="text-dark-300 mb-6">
            Your email has been successfully confirmed. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/curenium-logo-bg-none.png" alt="Curenium Logo" className="h-12 w-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Confirm Your Email</h2>
          <p className="text-dark-400 mt-1">Enter the code sent to your email address.</p>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-lg border border-dark-700 rounded-2xl shadow-2xl shadow-black/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-dark-300">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                className="w-full px-4 py-2 bg-dark-700/50 border border-dark-600 rounded-lg placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300" />
            </div>
            <div className="space-y-1">
              <label htmlFor="code" className="text-sm font-medium text-dark-300">Confirmation Code</label>
              <input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required autoFocus
                className="w-full px-4 py-2 bg-dark-700/50 border border-dark-600 rounded-lg placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 text-center tracking-[0.5em] font-mono text-lg" />
            </div>
            {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
            <div className="pt-4">
              <Button type="submit" className="w-full text-base font-semibold" size="lg">
                Confirm
              </Button>
            </div>
          </form>
        </div>
        <p className="text-center text-sm text-dark-400 mt-8">
          Didn't receive a code?{' '}
          <button className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
            Resend Code
          </button>
        </p>
      </div>
    </div>
  );
}