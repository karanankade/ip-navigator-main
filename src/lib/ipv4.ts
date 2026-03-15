// IPv4 Calculation Engine

export interface IPv4Result {
  isValid: boolean;
  ip: string;
  cidr: number;
  ipClass: string;
  networkId: string;
  subnetMask: string;
  wildcardMask: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  totalIPs: number;
  usableHosts: number;
  binary: string;
  ipType: string;
  subnetBits: number;
  hostBits: number;
  binaryOctets: string[];
  networkBits: number;
}

export function validateIPv4(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = Number(p);
    return /^\d{1,3}$/.test(p) && n >= 0 && n <= 255;
  });
}

export function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

export function numberToIP(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

export function getIPClass(ip: string): string {
  const first = Number(ip.split(".")[0]);
  if (first < 128) return "A";
  if (first < 192) return "B";
  if (first < 224) return "C";
  if (first < 240) return "D (Multicast)";
  return "E (Reserved)";
}

export function getIPType(ip: string): string {
  const parts = ip.split(".").map(Number);
  if (parts[0] === 10) return "Private (RFC 1918)";
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return "Private (RFC 1918)";
  if (parts[0] === 192 && parts[1] === 168) return "Private (RFC 1918)";
  if (parts[0] === 127) return "Loopback";
  if (parts[0] === 169 && parts[1] === 254) return "Link-Local (APIPA)";
  if (parts[0] >= 224 && parts[0] <= 239) return "Multicast";
  if (parts[0] >= 240) return "Reserved";
  return "Public";
}

export function toBinary(ip: string): string {
  return ip
    .split(".")
    .map((o) => Number(o).toString(2).padStart(8, "0"))
    .join(".");
}

export function toBinaryOctets(ip: string): string[] {
  return ip.split(".").map((o) => Number(o).toString(2).padStart(8, "0"));
}

export function calculateIPv4(ip: string, cidr: number): IPv4Result {
  const isValid = validateIPv4(ip) && cidr >= 0 && cidr <= 32;

  if (!isValid) {
    return {
      isValid: false,
      ip, cidr,
      ipClass: "-", networkId: "-", subnetMask: "-", wildcardMask: "-",
      broadcastAddress: "-", firstUsable: "-", lastUsable: "-",
      totalIPs: 0, usableHosts: 0, binary: "-", ipType: "-",
      subnetBits: 0, hostBits: 0, binaryOctets: [], networkBits: cidr,
    };
  }

  const ipNum = ipToNumber(ip);
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const network = (ipNum & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalIPs = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : totalIPs - 2;

  const defaultClassBits = (() => {
    const first = Number(ip.split(".")[0]);
    if (first < 128) return 8;
    if (first < 192) return 16;
    return 24;
  })();

  return {
    isValid: true,
    ip,
    cidr,
    ipClass: getIPClass(ip),
    networkId: numberToIP(network),
    subnetMask: numberToIP(mask),
    wildcardMask: numberToIP(wildcard),
    broadcastAddress: numberToIP(broadcast),
    firstUsable: cidr >= 31 ? numberToIP(network) : numberToIP(network + 1),
    lastUsable: cidr >= 31 ? numberToIP(broadcast) : numberToIP(broadcast - 1),
    totalIPs,
    usableHosts,
    binary: toBinary(ip),
    ipType: getIPType(ip),
    subnetBits: cidr - defaultClassBits > 0 ? cidr - defaultClassBits : 0,
    hostBits: 32 - cidr,
    binaryOctets: toBinaryOctets(ip),
    networkBits: cidr,
  };
}

export function generateIPRange(networkId: string, broadcastAddress: string, page: number, perPage: number): { ips: string[]; total: number } {
  const start = ipToNumber(networkId) + 1;
  const end = ipToNumber(broadcastAddress) - 1;
  const total = end - start + 1;
  if (total <= 0) return { ips: [], total: 0 };

  const startIdx = (page - 1) * perPage;
  const ips: string[] = [];
  for (let i = startIdx; i < Math.min(startIdx + perPage, total); i++) {
    ips.push(numberToIP(start + i));
  }
  return { ips, total };
}

export function cidrToMask(cidr: number): string {
  if (cidr < 0 || cidr > 32) return "Invalid CIDR";
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  return numberToIP(mask);
}

export function maskToCidr(mask: string): number {
  if (!validateIPv4(mask)) return -1;
  const n = ipToNumber(mask);
  let bits = 0;
  let found = false;
  for (let i = 31; i >= 0; i--) {
    if ((n >>> i) & 1) {
      if (found) return -1; // invalid mask
      bits++;
    } else {
      found = true;
    }
  }
  return bits;
}

// VLSM
export interface VLSMSubnet {
  name: string;
  neededHosts: number;
  allocatedSize: number;
  cidr: number;
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  subnetMask: string;
}

export function calculateVLSM(baseNetwork: string, baseCidr: number, requirements: { name: string; hosts: number }[]): VLSMSubnet[] | null {
  if (!validateIPv4(baseNetwork)) return null;

  const sorted = [...requirements].sort((a, b) => b.hosts - a.hosts);
  let currentNetwork = ipToNumber(baseNetwork) & ((~0 << (32 - baseCidr)) >>> 0);
  const baseEnd = (currentNetwork | ((~((~0 << (32 - baseCidr)) >>> 0)) >>> 0)) >>> 0;

  const results: VLSMSubnet[] = [];

  for (const req of sorted) {
    let hostBits = 0;
    while (Math.pow(2, hostBits) - 2 < req.hosts) hostBits++;
    const cidr = 32 - hostBits;
    const size = Math.pow(2, hostBits);
    const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;

    // Align to subnet boundary
    if (currentNetwork % size !== 0) {
      currentNetwork = Math.ceil(currentNetwork / size) * size;
    }

    const broadcast = (currentNetwork + size - 1) >>> 0;
    if (broadcast > baseEnd) return null; // not enough space

    results.push({
      name: req.name,
      neededHosts: req.hosts,
      allocatedSize: size,
      cidr,
      networkAddress: numberToIP(currentNetwork >>> 0),
      broadcastAddress: numberToIP(broadcast),
      firstUsable: numberToIP((currentNetwork + 1) >>> 0),
      lastUsable: numberToIP((broadcast - 1) >>> 0),
      subnetMask: numberToIP(mask),
    });

    currentNetwork = broadcast + 1;
  }

  return results;
}
