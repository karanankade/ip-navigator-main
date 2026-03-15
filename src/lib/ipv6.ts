// IPv6 Calculation Engine

export interface IPv6Result {
  isValid: boolean;
  address: string;
  cidr: number;
  expanded: string;
  compressed: string;
  networkPrefix: string;
  firstAddress: string;
  lastAddress: string;
  totalAddresses: string;
  ipType: string;
}

export function validateIPv6(ip: string): boolean {
  try {
    expandIPv6(ip);
    return true;
  } catch {
    return false;
  }
}

export function expandIPv6(ip: string): string {
  let parts = ip.split("::");
  if (parts.length > 2) throw new Error("Invalid IPv6");

  let groups: string[];
  if (parts.length === 2) {
    const left = parts[0] ? parts[0].split(":") : [];
    const right = parts[1] ? parts[1].split(":") : [];
    const missing = 8 - left.length - right.length;
    if (missing < 0) throw new Error("Invalid IPv6");
    groups = [...left, ...Array(missing).fill("0"), ...right];
  } else {
    groups = ip.split(":");
  }

  if (groups.length !== 8) throw new Error("Invalid IPv6");

  return groups
    .map((g) => {
      if (!/^[0-9a-fA-F]{1,4}$/.test(g)) throw new Error("Invalid IPv6 group");
      return g.padStart(4, "0").toLowerCase();
    })
    .join(":");
}

export function compressIPv6(expanded: string): string {
  const groups = expanded.split(":").map((g) => g.replace(/^0+/, "") || "0");

  // Find longest run of zeros
  let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (groups[i] === "0") {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }
    } else {
      curStart = -1; curLen = 0;
    }
  }

  if (bestLen <= 1) return groups.join(":");

  const left = groups.slice(0, bestStart).join(":");
  const right = groups.slice(bestStart + bestLen).join(":");
  return `${left}::${right}`;
}

function ipv6ToBigIntArray(expanded: string): number[] {
  return expanded.split(":").map((g) => parseInt(g, 16));
}

function bigIntArrayToIPv6(groups: number[]): string {
  return groups.map((g) => g.toString(16).padStart(4, "0")).join(":");
}

export function getIPv6Type(expanded: string): string {
  const groups = ipv6ToBigIntArray(expanded);
  if (groups.every((g) => g === 0)) return "Unspecified (::)";
  if (groups.slice(0, 7).every((g) => g === 0) && groups[7] === 1) return "Loopback (::1)";
  if (groups[0] === 0xfe80) return "Link-Local";
  if (groups[0] >= 0xfc00 && groups[0] <= 0xfdff) return "Unique Local";
  if (groups[0] >= 0x2000 && groups[0] <= 0x3fff) return "Global Unicast";
  if (groups[0] === 0xff00 || (groups[0] & 0xff00) === 0xff00) return "Multicast";
  return "Reserved";
}

export function calculateIPv6(address: string, cidr: number): IPv6Result {
  try {
    if (cidr < 0 || cidr > 128) throw new Error("Invalid CIDR");
    const expanded = expandIPv6(address);
    const compressed = compressIPv6(expanded);
    const groups = ipv6ToBigIntArray(expanded);

    // Calculate network prefix
    const prefixGroups = [...groups];
    const lastGroups = [...groups];

    for (let bit = 0; bit < 128; bit++) {
      const groupIdx = Math.floor(bit / 16);
      const bitInGroup = 15 - (bit % 16);
      if (bit >= cidr) {
        prefixGroups[groupIdx] &= ~(1 << bitInGroup);
        lastGroups[groupIdx] |= 1 << bitInGroup;
      }
    }

    const totalBits = 128 - cidr;
    let totalAddresses: string;
    if (totalBits <= 53) {
      totalAddresses = Math.pow(2, totalBits).toLocaleString();
    } else {
      totalAddresses = `2^${totalBits}`;
    }

    return {
      isValid: true,
      address,
      cidr,
      expanded,
      compressed,
      networkPrefix: compressIPv6(bigIntArrayToIPv6(prefixGroups)),
      firstAddress: compressIPv6(bigIntArrayToIPv6(prefixGroups)),
      lastAddress: compressIPv6(bigIntArrayToIPv6(lastGroups)),
      totalAddresses,
      ipType: getIPv6Type(expanded),
    };
  } catch {
    return {
      isValid: false,
      address, cidr,
      expanded: "-", compressed: "-", networkPrefix: "-",
      firstAddress: "-", lastAddress: "-", totalAddresses: "-", ipType: "-",
    };
  }
}
