import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import { getGenreList } from "@/lib/tmdb";
import ProfileForm from "@/components/profile/ProfileForm";
import { Settings } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const userDoc = await User.findById(session.user.id).lean<IUser>();
  if (!userDoc) return <div className="text-center mt-20 text-[#c8c4bc]/50">User not found</div>;

  const { genres } = await getGenreList();

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-8 h-8 text-[#c8c4bc]/50" />
          Profile Settings
        </h1>
        <p className="text-[#c8c4bc]/50 mt-2">Manage your public profile and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <ProfileForm user={userDoc} genres={genres} />
        </div>
        
        {/* Simple User Card Preview */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-gradient-to-b from-[#1a1a1a] to-[#1a1a1a] border border-[#c8c4bc]/10 p-6 rounded-2xl sticky top-24">
            <h3 className="text-sm font-semibold text-[#c8c4bc]/50 uppercase tracking-wider mb-6">Profile Preview</h3>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#8b3a2a] to-#8b3a2a rounded-full flex items-center justify-center text-3xl font-bold text-[#c8c4bc] shadow-xl shadow-[#8b3a2a]/20 mb-4">
                {userDoc.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-[#c8c4bc]">{userDoc.name}</h2>
              <p className="text-sm text-[#c8c4bc]/50 mt-1">{userDoc.email}</p>
              
              {userDoc.bio && (
                <p className="text-sm text-[#c8c4bc]/70 mt-4 italic">"{userDoc.bio}"</p>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-[#c8c4bc]/10">
              <p className="text-xs text-[#c8c4bc]/40 text-center">
                Member since {new Date(userDoc.createdAt).getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
