import { useState, useMemo } from "react";
import { calculateIPv4, generateIPRange } from "@/lib/ipv4";
import { downloadCSV } from "@/lib/export";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE = 100;

export function IPRangeGenerator() {
  const [ip, setIp] = useState("192.168.1.0");
  const [cidr, setCidr] = useState(24);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const result = useMemo(() => calculateIPv4(ip, cidr), [ip, cidr]);
  const range = useMemo(() => {
    if (!result.isValid) return { ips: [], total: 0 };
    return generateIPRange(result.networkId, result.broadcastAddress, page, PER_PAGE);
  }, [result, page]);

  const filtered = search
    ? range.ips.filter((ip) => ip.includes(search))
    : range.ips;

  const totalPages = Math.ceil(range.total / PER_PAGE);

  const handleExportAll = () => {
    if (!result.isValid) return;
    const allIPs = generateIPRange(result.networkId, result.broadcastAddress, 1, range.total);
    downloadCSV(allIPs.ips, `ip-range-${result.networkId}-${cidr}.csv`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">IP Range Generator</h2>
          <p className="text-sm text-muted-foreground mt-1">List all usable IPs between Network and Broadcast addresses</p>
        </div>
        {result.isValid && range.total > 0 && range.total <= 65536 && (
          <button onClick={handleExportAll} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Network Address</label>
            <input type="text" value={ip} onChange={(e) => { setIp(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">CIDR (/{cidr})</label>
            <input type="range" min="16" max="30" value={cidr} onChange={(e) => { setCidr(Number(e.target.value)); setPage(1); }}
              className="w-full accent-primary mt-2" />
          </div>
        </div>
      </div>

      {result.isValid && range.total > 0 && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search IPs..."
                className="w-full pl-10 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{range.total.toLocaleString()} total</span>
          </div>

          <div className="bg-code rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
              {filtered.map((ip) => (
                <span key={ip} className="font-mono text-xs text-code-foreground py-0.5">{ip}</span>
              ))}
            </div>
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">No matching IPs found.</p>}
          </div>

          {totalPages > 1 && !search && (
            <div className="flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-30 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-30 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {result.isValid && range.total > 65536 && (
        <p className="text-xs text-warning">⚠ CSV export disabled for ranges larger than 65,536 IPs to prevent browser freezing.</p>
      )}
    </div>
  );
}
