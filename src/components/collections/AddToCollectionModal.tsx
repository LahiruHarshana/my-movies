"use client";
import { useState } from "react";
import { Plus, X, FolderHeart } from "lucide-react";
import { addMovieToCollection, createCollection } from "@/actions/collections";
import { toast } from "sonner";

export default function AddToCollectionModal({ 
  movie, 
  collections, 
  isOpen, 
  onClose 
}: { 
  movie: any, 
  collections: any[], 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newColName, setNewColName] = useState("");

  if (!isOpen) return null;

  const handleAdd = async (colId: string) => {
    setLoading(true);
    const res = await addMovieToCollection(colId, {
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path
    });
    if (res?.error) toast.error(res.error);
    else {
      toast.success("Added to collection!");
      onClose();
    }
    setLoading(false);
  };

  const handleCreateAndAdd = async () => {
    if (!newColName.trim()) return;
    setLoading(true);
    const createFormData = new FormData();
    createFormData.append("name", newColName);
    
    const createRes = await createCollection(createFormData);
    if (createRes?.error) {
      toast.error(createRes.error);
      setLoading(false);
      return;
    }
    
    // Add movie to newly created collection
    if (createRes.collectionId) {
      const addRes = await addMovieToCollection(createRes.collectionId, {
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path
      });
      if (addRes?.error) toast.error(addRes.error);
      else {
        toast.success("Collection created & movie added!");
        onClose();
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-2xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#c8c4bc]/50 hover:text-[#c8c4bc]"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FolderHeart className="w-5 h-5 text-[#8b3a2a]" />
          Add to Collection
        </h2>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-6">
          {collections.length > 0 ? (
            collections.map(col => (
              <button
                key={col._id}
                onClick={() => handleAdd(col._id)}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#c8c4bc]/5 hover:bg-[#c8c4bc]/10 border border-transparent transition-colors text-left"
              >
                <span className="font-medium text-[#c8c4bc]/90">{col.name}</span>
                {col.movies.some((m: any) => m.tmdbId === movie.id) ? (
                  <span className="text-xs text-[#8b3a2a] font-semibold bg-[#8b3a2a]/10 px-2 py-1 rounded-md">Added</span>
                ) : (
                  <Plus className="w-4 h-4 text-[#c8c4bc]/50" />
                )}
              </button>
            ))
          ) : (
            <p className="text-sm text-[#c8c4bc]/50 text-center py-4">No collections yet.</p>
          )}
        </div>

        {isCreating ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder="Collection name..."
              className="flex-1 bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-xl px-4 py-2 text-sm text-[#c8c4bc] focus:outline-none focus:border-[#8b3a2a]"
              autoFocus
            />
            <button
              onClick={handleCreateAndAdd}
              disabled={loading || !newColName.trim()}
              className="bg-[#8b3a2a] hover:bg-[#8b3a2a] text-[#c8c4bc] px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 text-[#c8c4bc]/50 hover:text-[#c8c4bc] hover:border-white/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Create New Collection</span>
          </button>
        )}
      </div>
    </div>
  );
}
