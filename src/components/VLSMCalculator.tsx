import { useState } from "react";
import { calculateVLSM, validateIPv4 } from "@/lib/ipv4";
import { generateVLSMReport, downloadAsFile } from "@/lib/export";
import { Download, Plus, Trash2 } from "lucide-react";

interface Requirement {
  id: number;
  name: string;
  hosts: number;
}

let nextId = 3;

export function VLSMCalculator() {
  const [baseNetwork, setBaseNetwork] = useState("192.168.1.0");
  const [baseCidr, setBaseCidr] = useState(24);
  const [requirements, setRequirements] = useState<Requirement[]>([
    { id: 1, name: "Sales", hosts: 50 },
    { id: 2, name: "Engineering", hosts: 100 },
  ]);

  const addReq = () => {
    setRequirements([...requirements, { id: nextId++, name: `Subnet ${requirements.length + 1}`, hosts: 10 }]);
  };

  const removeReq = (id: number) => {
    setRequirements(requirements.filter((r) => r.id !== id));
  };

  const updateReq = (id: number, field: "name" | "hosts", value: string | number) => {
    setRequirements(requirements.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const isValidBase = validateIPv4(baseNetwork) && baseCidr >= 0 && baseCidr <= 30;
  const result = isValidBase && requirements.length > 0
    ? calculateVLSM(baseNetwork, baseCidr, requirements.map((r) => ({ name: r.name, hosts: r.hosts })))
    : null;

  const handleDownload = () => {
    if (!result) return;
    const report = generateVLSMReport(result, baseNetwork, baseCidr);
    downloadAsFile(report, `vlsm-report-${baseNetwork}-${baseCidr}.txt`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">VLSM Calculator</h2>
          <p className="text-sm text-muted-foreground mt-1">Variable Length Subnet Masking — allocate subnets efficiently</p>
        </div>
        {result && (
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Download className="h-4 w-4" /> Download Report
          </button>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Base Network</label>
            <input type="text" value={baseNetwork} onChange={(e) => setBaseNetwork(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">CIDR (/{baseCidr})</label>
            <input type="range" min="8" max="30" value={baseCidr} onChange={(e) => setBaseCidr(Number(e.target.value))}
              className="w-full accent-primary mt-2" />
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Host Requirements</h3>
          <button onClick={addReq} className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80">
            <Plus className="h-3.5 w-3.5" /> Add Subnet
          </button>
        </div>
        {requirements.map((req) => (
          <div key={req.id} className="flex items-center gap-3 bg-card rounded-lg border border-border p-3">
            <input type="text" value={req.name} onChange={(e) => updateReq(req.id, "name", e.target.value)}
              className="flex-1 px-2 py-1 bg-background border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Hosts:</span>
              <input type="number" min="1" value={req.hosts} onChange={(e) => updateReq(req.id, "hosts", Number(e.target.value))}
                className="w-20 px-2 py-1 bg-background border border-input rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button onClick={() => removeReq(req.id)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Results */}
      {result && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Subnet", "Hosts", "CIDR", "Network", "Broadcast", "Mask"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((s, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-2 px-3 font-medium text-foreground">{s.name}</td>
                  <td className="py-2 px-3 font-mono text-muted-foreground">{s.neededHosts} / {s.allocatedSize - 2}</td>
                  <td className="py-2 px-3 font-mono text-foreground">/{s.cidr}</td>
                  <td className="py-2 px-3 font-mono text-foreground">{s.networkAddress}</td>
                  <td className="py-2 px-3 font-mono text-foreground">{s.broadcastAddress}</td>
                  <td className="py-2 px-3 font-mono text-muted-foreground">{s.subnetMask}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result === null && isValidBase && requirements.length > 0 && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p className="text-sm text-foreground font-medium">Not enough address space in /{baseCidr} to allocate all requested subnets.</p>
        </div>
      )}
    </div>
  );
}
