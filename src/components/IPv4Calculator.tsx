import { useState, useMemo } from "react";
import { calculateIPv4 } from "@/lib/ipv4";
import { generateIPv4Report, downloadAsFile } from "@/lib/export";
import { Download, CheckCircle, XCircle } from "lucide-react";

export function IPv4Calculator() {
  const [ip, setIp] = useState("192.168.1.10");
  const [cidr, setCidr] = useState(24);

  const result = useMemo(() => calculateIPv4(ip, cidr), [ip, cidr]);

  const handleDownload = () => {
    const report = generateIPv4Report(result);
    downloadAsFile(report, `ipv4-report-${ip}-${cidr}.txt`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">IPv4 Subnet Calculator</h2>
          <p className="text-sm text-muted-foreground mt-1">Enter an IP address and CIDR to calculate subnet details</p>
        </div>
        {result.isValid && (
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Download className="h-4 w-4" /> Download Report
          </button>
        )}
      </div>

      {/* Input */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">IP Address</label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.10"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">CIDR (/{cidr})</label>
            <input
              type="range"
              min="0"
              max="32"
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
              className="w-full accent-primary mt-2"
            />
          </div>
          <div className="flex items-end">
            {result.isValid ? (
              <span className="flex items-center gap-1 text-accent text-sm font-medium"><CheckCircle className="h-4 w-4" /> Valid</span>
            ) : (
              <span className="flex items-center gap-1 text-destructive text-sm font-medium"><XCircle className="h-4 w-4" /> Invalid</span>
            )}
          </div>
        </div>
      </div>

      {result.isValid && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <DataCard title="Network Identity" rows={[
            ["IP Class", result.ipClass],
            ["IP Type", result.ipType],
            ["Network ID", result.networkId],
            ["Broadcast", result.broadcastAddress],
          ]} />
          <DataCard title="Addressing" rows={[
            ["Subnet Mask", result.subnetMask],
            ["Wildcard Mask", result.wildcardMask],
            ["First Usable", result.firstUsable],
            ["Last Usable", result.lastUsable],
          ]} />
          <DataCard title="Capacity" rows={[
            ["Total IPs", result.totalIPs.toLocaleString()],
            ["Usable Hosts", result.usableHosts.toLocaleString()],
            ["Network Bits", String(result.networkBits)],
            ["Host Bits", String(result.hostBits)],
          ]} />
          <div className="md:col-span-2 xl:col-span-3">
            <div className="bg-code rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Binary Representation</p>
              <p className="font-mono text-code-foreground text-lg tracking-wider">{result.binary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-mono font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
