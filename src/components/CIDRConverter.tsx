import { useState } from "react";
import { cidrToMask, maskToCidr, validateIPv4 } from "@/lib/ipv4";
import { ArrowRight } from "lucide-react";

export function CIDRConverter() {
  const [cidrInput, setCidrInput] = useState("24");
  const [maskInput, setMaskInput] = useState("255.255.255.0");

  const cidrNum = Number(cidrInput);
  const maskResult = cidrNum >= 0 && cidrNum <= 32 ? cidrToMask(cidrNum) : "Invalid";
  const cidrResult = validateIPv4(maskInput) ? maskToCidr(maskInput) : -1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">CIDR Converter</h2>
        <p className="text-sm text-muted-foreground mt-1">Convert between CIDR notation and subnet masks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">CIDR → Subnet Mask</h3>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">CIDR Value</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/</span>
              <input type="number" min="0" max="32" value={cidrInput} onChange={(e) => setCidrInput(e.target.value)}
                className="w-20 px-3 py-2 bg-background border border-input rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm font-medium text-foreground">{maskResult}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Subnet Mask → CIDR</h3>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Subnet Mask</label>
            <div className="flex items-center gap-2">
              <input type="text" value={maskInput} onChange={(e) => setMaskInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-input rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm font-medium text-foreground">
                {cidrResult >= 0 ? `/${cidrResult}` : "Invalid mask"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Common Subnet Masks</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[8, 16, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32].map((c) => (
            <div key={c} className="flex justify-between px-3 py-1.5 bg-secondary rounded text-xs">
              <span className="font-mono text-foreground">/{c}</span>
              <span className="font-mono text-muted-foreground">{cidrToMask(c)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
