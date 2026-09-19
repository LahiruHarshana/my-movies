"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      toast.error("Invalid email or password");
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-[#c8c4bc]/70 mb-1">Email</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-lg px-4 py-2.5 text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#8b3a2a] transition-all"
          placeholder="name@example.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-[#c8c4bc]/70 mb-1">Password</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-lg px-4 py-2.5 text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#8b3a2a] transition-all"
          placeholder="••••••••"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#8b3a2a] hover:bg-[#8b3a2a] text-[#c8c4bc] font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
