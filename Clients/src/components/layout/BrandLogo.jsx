import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export default function BrandLogo({ compact = false }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
      aria-label="OHIMS home"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-500 text-white shadow-[0_8px_20px_-8px_rgba(109,40,217,0.7)]">
        <Shield className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-extrabold tracking-tight text-slate-900">
          OHIMS
        </span>
        {!compact && (
          <span className="mt-0.5 hidden text-[10px] font-medium tracking-[0.14em] text-slate-400 uppercase sm:block">
            Health Insurance
          </span>
        )}
      </span>
    </Link>
  );
}
