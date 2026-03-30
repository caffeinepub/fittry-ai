import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  ArrowLeft,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Play,
  RefreshCw,
  Server,
  Square,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ServerScreenProps {
  onBack: () => void;
}

interface ServerEntry {
  id: string;
  name: string;
  ip: string;
  status: "running" | "stopped";
  uptime: string;
}

interface Stats {
  cpu: number;
  ram: number;
  disk: number;
  netUp: number;
  netDown: number;
}

const INITIAL_SERVERS: ServerEntry[] = [
  {
    id: "vps-01",
    name: "VPS-01",
    ip: "192.168.1.10",
    status: "running",
    uptime: "99.9%",
  },
  {
    id: "vps-02",
    name: "VPS-02",
    ip: "192.168.1.11",
    status: "running",
    uptime: "98.5%",
  },
  {
    id: "vps-03",
    name: "VPS-03",
    ip: "192.168.1.12",
    status: "stopped",
    uptime: "\u2014",
  },
];

function randomBetween(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

function formatTime(d: Date) {
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function CircleRing({
  value,
  color,
  size = 56,
}: { value: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      className="-rotate-90"
      aria-hidden="true"
      role="img"
    >
      <title>Usage ring</title>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="oklch(0.22 0.022 240 / 0.4)"
        strokeWidth={6}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

export default function ServerScreen({ onBack }: ServerScreenProps) {
  const [stats, setStats] = useState<Stats>({
    cpu: 47,
    ram: 77,
    disk: 45,
    netUp: 12,
    netDown: 34,
  });
  const [servers, setServers] = useState<ServerEntry[]>(INITIAL_SERVERS);
  const [logs, setLogs] = useState<string[]>(() => [
    `[${formatTime(new Date())}] System startup complete`,
    `[${formatTime(new Date())}] All services initialized`,
    `[${formatTime(new Date())}] Health check: OK`,
  ]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Animate stats
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on log update
  useEffect(() => {
    const t = setInterval(() => {
      setStats({
        cpu: randomBetween(35, 75),
        ram: randomBetween(60, 85),
        disk: 45,
        netUp: randomBetween(5, 30),
        netDown: randomBetween(20, 80),
      });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // Terminal logs
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on log update
  useEffect(() => {
    const t = setInterval(() => {
      const now = formatTime(new Date());
      const entries = [
        `[${now}] System health check: OK`,
        `[${now}] CPU load: ${randomBetween(35, 75)}%`,
        `[${now}] Memory usage: ${(randomBetween(48, 68) / 10).toFixed(1)}GB/8GB`,
        `[${now}] Network I/O: \u2191${randomBetween(5, 30)} MB/s  \u2193${randomBetween(20, 80)} MB/s`,
        `[${now}] Disk I/O: read ${randomBetween(10, 80)} MB/s`,
        `[${now}] Firewall: all rules active`,
        `[${now}] SSL certificates: valid`,
      ];
      const entry = entries[Math.floor(Math.random() * entries.length)];
      setLogs((prev) => [...prev.slice(-49), entry]);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on log update
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleServerAction = (
    id: string,
    action: "start" | "stop" | "restart",
  ) => {
    if (action === "restart") {
      toast.success(`${id.toUpperCase()}: Restarting...`, { duration: 2500 });
      return;
    }
    setServers((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: action === "start" ? "running" : "stopped",
              uptime: action === "start" ? "100%" : "\u2014",
            }
          : s,
      ),
    );
    toast.success(
      `${id.toUpperCase()}: ${action === "start" ? "Started successfully" : "Stopped"}`,
      { duration: 2000 },
    );
  };

  const statCards = [
    {
      label: "CPU Usage",
      value: stats.cpu,
      display: `${stats.cpu}%`,
      icon: <Cpu size={14} />,
      color: "oklch(0.65 0.18 265)",
    },
    {
      label: "RAM Usage",
      value: stats.ram,
      display: `${((stats.ram / 100) * 8).toFixed(1)} GB`,
      icon: <MemoryStick size={14} />,
      color: "oklch(0.70 0.18 200)",
    },
    {
      label: "Disk",
      value: stats.disk,
      display: "45 GB",
      icon: <HardDrive size={14} />,
      color: "oklch(0.72 0.18 75)",
    },
    {
      label: "Network",
      value: Math.min(100, Math.round(stats.netDown * 1.2)),
      display: `\u2191${stats.netUp} \u2193${stats.netDown}`,
      icon: <Network size={14} />,
      color: "oklch(0.68 0.18 150)",
    },
  ];

  return (
    <div
      className="min-h-screen pb-8"
      style={{ background: "oklch(0.08 0.015 240)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
        style={{
          background: "oklch(0.10 0.015 240 / 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.22 0.022 240 / 0.4)",
        }}
      >
        <button
          type="button"
          data-ocid="server.cancel_button"
          onClick={onBack}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.18 0.05 265)" }}
          >
            <Server size={16} style={{ color: "oklch(0.75 0.18 265)" }} />
          </div>
          <span className="font-display font-bold text-lg">
            Server Dashboard
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: "oklch(0.14 0.04 150)" }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "oklch(0.72 0.18 150)" }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: "oklch(0.72 0.18 150)" }}
          >
            LIVE
          </span>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-5">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              data-ocid="server.card"
              className="rounded-2xl p-4 flex flex-col gap-3"
              style={{
                background: "oklch(0.13 0.018 240)",
                border: "1px solid oklch(0.22 0.022 240 / 0.5)",
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: card.color }}
                >
                  {card.icon}
                  {card.label}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CircleRing value={card.value} color={card.color} size={52} />
                <div>
                  <p
                    className="text-lg font-bold font-mono leading-none"
                    style={{ color: card.color }}
                  >
                    {card.display}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {card.value}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Server List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "oklch(0.13 0.018 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ borderBottom: "1px solid oklch(0.22 0.022 240 / 0.4)" }}
          >
            <Activity size={15} style={{ color: "oklch(0.65 0.18 265)" }} />
            <h3 className="font-semibold text-sm">Active Servers</h3>
            <Badge variant="secondary" className="ml-auto text-xs">
              {servers.filter((s) => s.status === "running").length} /{" "}
              {servers.length} Online
            </Badge>
          </div>
          <div
            className="divide-y"
            style={{ borderColor: "oklch(0.22 0.022 240 / 0.3)" }}
          >
            {servers.map((server, i) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                data-ocid={`server.item.${i + 1}`}
                className="px-4 py-3 flex items-center gap-3"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background:
                      server.status === "running"
                        ? "oklch(0.72 0.18 150)"
                        : "oklch(0.6 0.18 25)",
                    boxShadow:
                      server.status === "running"
                        ? "0 0 6px oklch(0.72 0.18 150 / 0.6)"
                        : "none",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{server.name}</p>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                      style={{
                        background:
                          server.status === "running"
                            ? "oklch(0.18 0.06 150)"
                            : "oklch(0.18 0.06 25)",
                        color:
                          server.status === "running"
                            ? "oklch(0.72 0.18 150)"
                            : "oklch(0.65 0.18 25)",
                      }}
                    >
                      {server.status === "running" ? "Running" : "Stopped"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {server.ip} &middot; Uptime: {server.uptime}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {server.status === "stopped" ? (
                    <Button
                      size="sm"
                      data-ocid={`server.secondary_button.${i + 1}`}
                      onClick={() => handleServerAction(server.id, "start")}
                      className="h-7 px-2.5 text-xs rounded-lg"
                      style={{
                        background: "oklch(0.18 0.06 150)",
                        color: "oklch(0.72 0.18 150)",
                      }}
                    >
                      <Play size={11} className="mr-1" />
                      Start
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        data-ocid={`server.secondary_button.${i + 1}`}
                        onClick={() => handleServerAction(server.id, "restart")}
                        className="h-7 px-2.5 text-xs rounded-lg"
                        style={{
                          background: "oklch(0.17 0.04 240)",
                          color: "oklch(0.65 0.15 240)",
                        }}
                      >
                        <RefreshCw size={11} className="mr-1" />
                        Restart
                      </Button>
                      <Button
                        size="sm"
                        data-ocid={`server.delete_button.${i + 1}`}
                        onClick={() => handleServerAction(server.id, "stop")}
                        className="h-7 px-2.5 text-xs rounded-lg"
                        style={{
                          background: "oklch(0.18 0.06 25)",
                          color: "oklch(0.65 0.18 25)",
                        }}
                      >
                        <Square size={11} className="mr-1" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Terminal Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "oklch(0.07 0.012 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          <div
            className="px-4 py-2.5 flex items-center gap-2"
            style={{
              background: "oklch(0.11 0.015 240)",
              borderBottom: "1px solid oklch(0.22 0.022 240 / 0.4)",
            }}
          >
            <div className="flex gap-1.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: "oklch(0.6 0.18 25)" }}
              />
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: "oklch(0.72 0.18 75)" }}
              />
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: "oklch(0.72 0.18 150)" }}
              />
            </div>
            <span className="text-xs text-muted-foreground ml-1 font-mono">
              Terminal Log
            </span>
          </div>
          <ScrollArea className="h-52">
            <div className="p-4 space-y-1" data-ocid="server.panel">
              {logs.map((log) => (
                <p
                  key={log}
                  className="text-xs font-mono"
                  style={{ color: "oklch(0.65 0.06 150)" }}
                >
                  {log}
                </p>
              ))}
              <div ref={logsEndRef} />
            </div>
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
}
