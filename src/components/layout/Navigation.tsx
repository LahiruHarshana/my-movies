"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Film, Star, Home, Search, Bookmark, CheckCircle, LogOut, Sparkles, BarChart3, FolderHeart, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Top Rated", href: "/top-rated", icon: Star },
  { name: "Search", href: "/search", icon: Search },
  { name: "For You", href: "/recommendations", icon: Sparkles },
  { name: "Watchlist", href: "/watchlist", icon: Bookmark },
  { name: "Stats", href: "/stats", icon: BarChart3 },
  { name: "Collections", href: "/collections", icon: FolderHeart },
  { name: "Watched", href: "/watched", icon: CheckCircle },
  { name: "Profile", href: "/profile", icon: UserIcon },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#1a1a1a]/80 border-b border-[#c8c4bc]/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
              <Film className="w-6 h-6 text-[#8b3a2a]" />
            </motion.div>
            <Link href="/dashboard" className="font-sans font-medium text-base tracking-tighter text-[#c8c4bc] hover:text-white transition-colors">
              MY<span className="text-[#8b3a2a]">MOVIES</span>
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-8 font-mono text-xs uppercase tracking-widest text-[#c8c4bc]/50">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`transition-colors relative group py-1 ${
                    isActive ? "text-[#c8c4bc]" : "hover:text-[#8b3a2a]"
                  }`}
                >
                  {item.name}
                  <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-[#8b3a2a] transition-transform duration-500 origin-left ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}></div>
                </Link>
              );
            })}
          </div>
          <div className="hidden lg:flex">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="font-mono text-xs uppercase tracking-widest text-[#c8c4bc] border border-[#8b3a2a] px-4 py-2 rounded-lg hover:bg-[#8b3a2a] transition-colors flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/95 backdrop-blur-xl border-t border-[#c8c4bc]/10 z-50 pb-safe shadow-[0_-4px_30px_rgba(0,0,0,0.5)] flex overflow-x-auto snap-x" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div className="flex items-center w-full px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`snap-start flex flex-col items-center justify-center gap-1 min-w-[72px] h-16 transition-colors relative ${
                  isActive ? "text-[#c8c4bc]" : "text-[#c8c4bc]/40 hover:text-[#c8c4bc]/70"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 w-8 h-[2px] bg-[#8b3a2a] shadow-[0_0_10px_rgba(139,58,42,0.5)]" 
                  />
                )}
                <Icon className={`w-4 h-4 ${isActive ? "text-[#8b3a2a]" : ""}`} />
                <span className="text-[9px] font-mono uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
