import { useState } from "react";
import { validateIPv4, getIPClass, getIPType } from "@/lib/ipv4";
import { validateIPv6, expandIPv6, getIPv6Type } from "@/lib/ipv6";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function IPValidator() {
  const [input, setInput] = useState("");

  const isV4 = validateIPv4(input);
  const isV6 = validateIPv6(input);
  const hasInput = input.trim().length > 0;

  const checks = hasInput ? [
    { label: "Valid IPv4", pass: isV4 },
    { label: "Valid IPv6", pass: isV6 },
    { label: "Loopback", pass: isV4 ? input.startsWith("127.") : (isV6 && input.trim() === "::1") },
    { label: "Multicast", pass: isV4 ? (Number(input.split(".")[0]) >= 224 && Number(input.split(".")[0]) <= 239) : (isV6 && (() => { try { return expandIPv6(input).startsWith("ff"); } catch { return false; } })()) },
    { label: "Private", pass: isV4 && getIPType(input).includes("Private") },
    { label: "Reserved", pass: isV4 ? getIPType(input).includes("Reserved") : (isV6 && getIPv6Type((() => { try { return expandIPv6(input); } catch { return ""; } })()) === "Reserved") },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">IP Validator</h2>
        <p className="text-sm text-muted-foreground mt-1">Check if an IP address is valid and identify its properties</p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">IP Address (IPv4 or IPv6)</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter any IP address..."
          className="w-full px-3 py-2 bg-background border border-input rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {hasInput && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {checks.map((c) => (
            <div key={c.label} className={`flex items-center gap-2 p-3 rounded-lg border ${c.pass ? "bg-accent/10 border-accent/30" : "bg-card border-border"}`}>
              {c.pass ? <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" /> : <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              <span className={`text-sm font-medium ${c.pass ? "text-foreground" : "text-muted-foreground"}`}>{c.label}</span>
            </div>
          ))}
        </div>
      )}

      {hasInput && (isV4 || isV6) && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Details</h3>
          {isV4 && (
            <>
              <Row label="Type" value="IPv4" />
              <Row label="Class" value={getIPClass(input)} />
              <Row label="Category" value={getIPType(input)} />
            </>
          )}
          {isV6 && !isV4 && (
            <>
              <Row label="Type" value="IPv6" />
              <Row label="Category" value={getIPv6Type((() => { try { return expandIPv6(input); } catch { return ""; } })())} />
            </>
          )}
        </div>
      )}

      {hasInput && !isV4 && !isV6 && (
        <div className="flex items-center gap-2 p-4 bg-warning/10 border border-warning/30 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span className="text-sm font-medium text-foreground">Not a valid IPv4 or IPv6 address</span>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono font-medium text-foreground">{value}</span>
    </div>
  );
}
