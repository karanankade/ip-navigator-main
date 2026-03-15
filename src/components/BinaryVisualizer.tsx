import { useState, useMemo } from "react";
import { calculateIPv4 } from "@/lib/ipv4";

export function BinaryVisualizer() {
  const [ip, setIp] = useState("192.168.1.10");
  const [cidr, setCidr] = useState(24);

  const result = useMemo(() => calculateIPv4(ip, cidr), [ip, cidr]);

  const allBits = result.isValid ? result.binaryOctets.join("") : "";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Binary Visualizer</h2>
        <p className="text-sm text-muted-foreground mt-1">Visualize network and host bits in an IP address</p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">IP Address</label>
            <input type="text" value={ip} onChange={(e) => setIp(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">CIDR (/{cidr})</label>
            <input type="range" min="0" max="32" value={cidr} onChange={(e) => setCidr(Number(e.target.value))}
              className="w-full accent-primary mt-2" />
          </div>
        </div>
      </div>

      {result.isValid && (
        <>
          {/* Legend */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-network" />
              <span className="text-xs font-medium text-muted-foreground">Network Bits ({cidr})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-host" />
              <span className="text-xs font-medium text-muted-foreground">Host Bits ({32 - cidr})</span>
            </div>
          </div>

          {/* Binary Grid */}
          <div className="bg-code rounded-lg p-6">
            <div className="grid grid-cols-4 gap-4">
              {result.binaryOctets.map((octet, octetIdx) => (
                <div key={octetIdx} className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center font-mono">
                    Octet {octetIdx + 1} ({ip.split(".")[octetIdx]})
                  </p>
                  <div className="flex justify-center gap-0.5">
                    {octet.split("").map((bit, bitIdx) => {
                      const globalBit = octetIdx * 8 + bitIdx;
                      const isNetwork = globalBit < cidr;
                      return (
                        <div
                          key={bitIdx}
                          className={`w-7 h-8 flex items-center justify-center font-mono text-sm font-bold rounded-sm ${
                            isNetwork ? "bg-network/20 text-network" : "bg-host/20 text-host"
                          }`}
                        >
                          {bit}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bit position labels */}
            <div className="mt-4 pt-4 border-t border-sidebar-border">
              <div className="flex flex-wrap gap-1 justify-center">
                {allBits.split("").map((_, i) => (
                  <div key={i} className={`w-3 h-1.5 rounded-full ${i < cidr ? "bg-network/60" : "bg-host/60"}`} />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground font-mono">Bit 0</span>
                <span className="text-xs text-muted-foreground font-mono">Bit 31</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-lg border border-border p-4 text-center">
              <p className="text-3xl font-bold text-network">{cidr}</p>
              <p className="text-xs text-muted-foreground mt-1">Network Bits</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4 text-center">
              <p className="text-3xl font-bold text-host">{32 - cidr}</p>
              <p className="text-xs text-muted-foreground mt-1">Host Bits</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
