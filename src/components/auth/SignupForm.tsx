"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signup } from "@/actions/auth";

export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    const res = await signup(formData);

    if (res?.error) {
      toast.error(res.error);
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/login?registered=true");
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
        <label className="block text-sm font-medium text-[#c8c4bc]/70 mb-1">Name</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-lg px-4 py-2.5 text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#8b3a2a] transition-all"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#c8c4bc]/70 mb-1">Email</label>
        <input 
          type="email" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-lg px-4 py-2.5 text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#8b3a2a] transition-all"
          placeholder="name@example.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-[#c8c4bc]/70 mb-1">Password</label>
        <input 
          type="password" 
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          minLength={8}
          className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-lg px-4 py-2.5 text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#8b3a2a] transition-all"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#c8c4bc]/70 mb-1">Confirm Password</label>
        <input 
          type="password" 
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          required
          minLength={8}
          className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-lg px-4 py-2.5 text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#8b3a2a] transition-all"
          placeholder="••••••••"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#8b3a2a] hover:bg-[#8b3a2a] text-[#c8c4bc] font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {loading ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
