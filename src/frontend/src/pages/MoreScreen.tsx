import { ChevronRight, Info, LogOut, Server, Video } from "lucide-react";
import { useLocalAuth } from "../hooks/useLocalAuth";

interface Props {
  onLogout: () => void;
  onOpenServer: () => void;
  onGenerateVideo: () => void;
}

export default function MoreScreen({
  onLogout,
  onOpenServer,
  onGenerateVideo,
}: Props) {
  const { user } = useLocalAuth();
  const year = new Date().getFullYear();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const menuItems = [
    {
      icon: Server,
      label: "Server Dashboard",
      sub: "VPS monitoring & controls",
      onClick: onOpenServer,
      color: "text-cyan-400",
    },
    {
      icon: Video,
      label: "Generate Video",
      sub: "VisionVideo AI · Replicate powered",
      onClick: onGenerateVideo,
      color: "text-pink-400",
    },
    {
      icon: Info,
      label: "About FitTry AI",
      sub: "Version 25 · Fully free",
      onClick: () => {},
      color: "text-violet-400",
    },
  ];

  return (
    <div className="pb-24 min-h-screen">
      <div className="pt-12 px-5 pb-5">
        <h1 className="text-2xl font-bold font-display text-white">More</h1>
      </div>

      {/* Profile Card */}
      <div className="px-5 mb-6">
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <span className="text-violet-300 font-bold text-xl font-display">
              {initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">
              {user?.name ?? "User"}
            </p>
            <p className="text-slate-400 text-sm truncate">{user?.contact}</p>
            <span className="inline-block bg-green-500/15 text-green-400 text-xs px-2 py-0.5 rounded-full mt-1">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-5 mb-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="w-full flex items-center gap-4 bg-slate-800/60 border border-slate-700/40 rounded-2xl px-4 py-4 hover:border-slate-600/60 transition-all text-left"
            data-ocid="more.button"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center ${item.color}`}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{item.label}</p>
              <p className="text-slate-500 text-xs">{item.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-5">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl py-3.5 font-semibold hover:bg-red-500/20 transition-all"
          data-ocid="more.delete_button"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <footer className="px-5 mt-8 text-center text-slate-600 text-xs">
        © {year} built with 🖤 ai agent
      </footer>
    </div>
  );
}
