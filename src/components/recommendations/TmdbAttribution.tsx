import Image from "next/image";
import Link from "next/link";

export default function TmdbAttribution() {
  return (
    <div className="mt-16 pt-8 border-t border-[#c8c4bc]/10 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-[#c8c4bc]/40">
      <Image
        src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c1b481e5895d8390a13d393dbfa404c80952d9bc603f926af68781311b6fa6bb895ad6d2e51124d511b904cf8bf95bc7b4bb3cc3b3e.svg"
        alt="TMDB"
        width={120}
        height={16}
        className="opacity-70"
        unoptimized
      />
      <p>
        This product uses the TMDB API but is not endorsed or certified by TMDB.{" "}
        <Link
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#c8c4bc]/70"
        >
          The Movie Database
        </Link>
      </p>
    </div>
  );
}
