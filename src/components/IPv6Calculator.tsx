import { useState, useMemo } from "react";
import { calculateIPv6 } from "@/lib/ipv6";
import { generateIPv6Report, downloadAsFile } from "@/lib/export";
import { Download, CheckCircle, XCircle } from "lucide-react";

export function IPv6Calculator() {
  const [address, setAddress] = useState("2001:0db8:85a3::8a2e:0370:7334");
  const [cidr, setCidr] = useState(64);

  const result = useMemo(() => calculateIPv6(address, cidr), [address, cidr]);

  const handleDownload = () => {
    const report = generateIPv6Report(result);
    downloadAsFile(report, `ipv6-report-${cidr}.txt`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">IPv6 Subnet Calculator</h2>
          <p className="text-sm text-muted-foreground mt-1">Calculate IPv6 subnet details from address and prefix length</p>
        </div>
        {result.isValid && (
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Download className="h-4 w-4" /> Download Report
          </button>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">IPv6 Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="2001:db8::1"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Prefix Length (/{cidr})</label>
            <input
              type="range"
              min="0"
              max="128"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Address Forms</h3>
            <div className="space-y-2">
              {[
                ["Expanded", result.expanded],
                ["Compressed", result.compressed],
                ["IP Type", result.ipType],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{l}</span>
                  <span className="text-sm font-mono font-medium text-foreground text-right break-all">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Network Range</h3>
            <div className="space-y-2">
              {[
                ["Network Prefix", result.networkPrefix],
                ["First Address", result.firstAddress],
                ["Last Address", result.lastAddress],
                ["Total Addresses", result.totalAddresses],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{l}</span>
                  <span className="text-sm font-mono font-medium text-foreground text-right break-all">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
