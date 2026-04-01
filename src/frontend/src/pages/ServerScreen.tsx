import { Activity, ArrowLeft, Cpu, HardDrive, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onBack: () => void;
}

interface ServerInfo {
  name: string;
  status: "online" | "offline";
}

const INITIAL_SERVERS: ServerInfo[] = [
  { name: "Server 1 (Mumbai)", status: "online" },
  { name: "Server 2 (Singapore)", status: "online" },
  { name: "Server 3 (Frankfurt)", status: "offline" },
];

const LOG_MESSAGES = [
  "[OK] Health check passed",
  "[OK] Server started successfully",
  "[INFO] New connection established",
  "[WARN] Memory usage above 70%",
  "[OK] Cache cleared",
  "[INFO] Backup completed",
  "[OK] SSL certificate valid",
  "[INFO] Load balancer active",
  "[OK] Database connected",
  "[INFO] CDN sync complete",
];

interface StatBarProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isNetwork?: boolean;
}

function StatBar({ label, value, icon: Icon, color, isNetwork }: StatBarProps) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-slate-300 text-sm">{label}</span>
        </div>
        <span className={`font-bold text-sm ${color}`}>
          {isNetwork ? `${value} KB/s` : `${value}%`}
        </span>
      </div>
      {!isNetwork && (
        <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${value > 80 ? "bg-red-500" : value > 60 ? "bg-yellow-500" : "bg-green-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
}

export default function ServerScreen({ onBack }: Props) {
  const [stats, setStats] = useState({
    cpu: 42,
    ram: 68,
    disk: 55,
    network: 124,
  });
  const [servers, setServers] = useState<ServerInfo[]>(INITIAL_SERVERS);
  const [logs, setLogs] = useState<string[]>(LOG_MESSAGES.slice(0, 5));
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(25 + Math.random() * 60),
        ram: Math.floor(50 + Math.random() * 40),
        disk: Math.floor(40 + Math.random() * 40),
        network: Math.floor(50 + Math.random() * 300),
      });
      const msg = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      const time = new Date().toLocaleTimeString();
      setLogs((prev) => [
        `[${time}] ${msg.replace(/^\[\w+\] /, "")}`,
        ...prev.slice(0, 19),
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleServer = (idx: number) => {
    setServers((prev) =>
      prev.map((s, i) =>
        i === idx
          ? { ...s, status: s.status === "online" ? "offline" : "online" }
          : s,
      ),
    );
  };

  return (
    <div className="pb-10 min-h-screen">
      <div className="pt-12 px-5 pb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-slate-800/60 flex items-center justify-center"
          data-ocid="server.button"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            VPS Server Dashboard
          </h1>
          <p className="text-slate-400 text-xs">Live monitoring</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-bold">LIVE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-5 grid grid-cols-2 gap-3">
        <StatBar
          label="CPU"
          value={stats.cpu}
          icon={Cpu}
          color="text-cyan-400"
        />
        <StatBar
          label="RAM"
          value={stats.ram}
          icon={Activity}
          color="text-violet-400"
        />
        <StatBar
          label="Disk"
          value={stats.disk}
          icon={HardDrive}
          color="text-orange-400"
        />
        <StatBar
          label="Network"
          value={stats.network}
          icon={Wifi}
          color="text-green-400"
          isNetwork
        />
      </div>

      {/* Servers */}
      <div className="px-5 mb-5">
        <h3 className="text-white font-semibold mb-3">Servers</h3>
        <div className="space-y-3">
          {servers.map((s, i) => (
            <div
              key={s.name}
              className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 flex items-center gap-3"
              data-ocid={`server.item.${i + 1}`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  s.status === "online" ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{s.name}</p>
                <p
                  className={`text-xs capitalize ${s.status === "online" ? "text-green-400" : "text-red-400"}`}
                >
                  {s.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleServer(i)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                    s.status === "online"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-green-500/20 text-green-400 border border-green-500/30"
                  }`}
                  data-ocid="server.toggle"
                >
                  {s.status === "online" ? "Stop" : "Start"}
                </button>
                <button
                  type="button"
                  className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/40"
                  data-ocid="server.button"
                >
                  Restart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal */}
      <div className="px-5">
        <h3 className="text-white font-semibold mb-3">Terminal Log</h3>
        <div
          ref={logRef}
          className="bg-black/60 border border-slate-700/40 rounded-2xl p-4 h-48 overflow-y-auto font-mono text-xs space-y-1"
        >
          {logs.map((log, i) => (
            <p
              // biome-ignore lint/suspicious/noArrayIndexKey: log list is prepend-only
              key={i}
              className={
                log.includes("OK")
                  ? "text-green-400"
                  : log.includes("WARN")
                    ? "text-yellow-400"
                    : "text-slate-400"
              }
            >
              {log}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
