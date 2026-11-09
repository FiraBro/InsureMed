import { FiSettings, FiMail, FiRefreshCw } from "react-icons/fi";

export default function MaintenancePage() {
  const handleRefresh = () => window.location.reload();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] p-6 font-sans">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <div className="relative z-10 w-full max-w-xl text-center">
        {/* Brand Logo / Name */}
        <div className="mb-12 flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            I
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            InsuTrack <span className="text-blue-600">Pro</span>
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          {/* Animated Icon Container */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-blue-500 opacity-10 rounded-3xl rotate-12 animate-pulse" />
            <div className="absolute inset-0 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200">
              <FiSettings className="text-white text-4xl animate-[spin_8s_linear_infinite]" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Scheduled Maintenance
          </h1>

          <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-sm mx-auto">
            We are currently performing routine system updates to improve
            performance and security. We apologize for the temporary
            inconvenience.
          </p>

          {/* Progress Indicator */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8 overflow-hidden">
            <div className="bg-blue-600 h-full w-2/3 rounded-full animate-[progress_3s_ease-in-out_infinite]" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-semibold transition-all active:scale-95"
            >
              <FiRefreshCw size={18} />
              Check Status
            </button>

            <a
              href="mailto:support@insutrack.com"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all"
            >
              <FiMail size={18} />
              Contact Support
            </a>
          </div>
        </div>

        {/* Footer Status */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
            System Status: Updating
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
