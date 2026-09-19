"use client";
import { useState } from "react";
import { updateProfile } from "@/actions/user";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Save } from "lucide-react";

export default function ProfileForm({ 
  user, 
  genres 
}: { 
  user: any; 
  genres: { id: number; name: string }[] 
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    favoriteGenres: user.favoriteGenres || []
  });

  const toggleGenre = (id: number) => {
    setFormData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(id)
        ? prev.favoriteGenres.filter((g: number) => g !== id)
        : [...prev.favoriteGenres, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await updateProfile(formData);
    
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Profile updated successfully!");
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Basic Info */}
      <div className="bg-[#1a1a1a] border border-[#c8c4bc]/10 p-6 sm:p-8 rounded-2xl">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-[#8b3a2a]" />
          Basic Information
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#c8c4bc]/70 mb-2">Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-xl px-4 py-3 text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#8b3a2a] focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c8c4bc]/70 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about your movie tastes..."
              rows={4}
              className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-xl px-4 py-3 text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#8b3a2a] focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-[#c8c4bc]/40 mt-2">Maximum 500 characters</p>
          </div>
        </div>
      </div>

      {/* Favorite Genres */}
      <div className="bg-[#1a1a1a] border border-[#c8c4bc]/10 p-6 sm:p-8 rounded-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-1 h-6 bg-[#8b3a2a] rounded-full"></span>
            Favorite Genres
          </h2>
          <p className="text-sm text-[#c8c4bc]/50 mt-1">Select your favorite genres. We will use this to improve your recommendations!</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {genres.map(genre => {
            const isSelected = formData.favoriteGenres.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => toggleGenre(genre.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected 
                    ? "bg-[#8b3a2a] text-[#c8c4bc] shadow-lg shadow-[#8b3a2a]/20 border-transparent" 
                    : "bg-[#1a1a1a] text-[#c8c4bc]/70 border border-[#c8c4bc]/10 hover:border-[#8b3a2a]/50"
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-[#8b3a2a] hover:bg-[#8b3a2a] text-[#c8c4bc] px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-[#8b3a2a]/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
