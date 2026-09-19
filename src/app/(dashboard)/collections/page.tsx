import { getUserCollections } from "@/actions/collections";
import { FolderHeart, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";

export default async function CollectionsPage() {
  const collections = await getUserCollections();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderHeart className="w-8 h-8 text-[#8b3a2a]" />
          My Collections
        </h1>
        {/* We can use the modal from anywhere, but here we just show existing ones */}
      </div>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collections.map((col: any) => (
            <Link key={col._id} href={`/collections/${col._id}`}>
              <div className="group bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-2xl overflow-hidden hover:border-[#8b3a2a] transition-all hover:-translate-y-1">
                <div className="aspect-video relative bg-[#1a1a1a]">
                  {col.coverImage ? (
                    <Image 
                      src={getImageUrl(col.coverImage, "w500")}
                      alt={col.name}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FolderHeart className="w-8 h-8 text-[#c8c4bc]/30" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1">{col.name}</h3>
                  <p className="text-sm text-[#c8c4bc]/50 mt-1">{col.movies.length} movies</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-[#c8c4bc]/50 mt-20 bg-[#1a1a1a] p-12 rounded-2xl border border-[#c8c4bc]/10">
          <p className="text-xl font-medium text-[#c8c4bc] mb-2">No collections yet.</p>
          <p className="text-sm">Go to a movie's details page and click the Folder icon to create one!</p>
        </div>
      )}
    </div>
  );
}
