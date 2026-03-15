import { Network, Globe, Shield, List, ArrowLeftRight, Binary, GitBranch, type LucideIcon } from "lucide-react";

export type Tool = "ipv4" | "ipv6" | "validator" | "range" | "cidr" | "binary" | "vlsm";

interface NavItem {
  id: Tool;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: "ipv4", label: "IPv4 Calculator", icon: Network },
  { id: "ipv6", label: "IPv6 Calculator", icon: Globe },
  { id: "validator", label: "IP Validator", icon: Shield },
  { id: "range", label: "IP Range List", icon: List },
  { id: "cidr", label: "CIDR Converter", icon: ArrowLeftRight },
  { id: "binary", label: "Binary Visualizer", icon: Binary },
  { id: "vlsm", label: "VLSM Calculator", icon: GitBranch },
];

interface AppSidebarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export function AppSidebar({ activeTool, onToolChange }: AppSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Network className="h-6 w-6 text-sidebar-primary" />
            <div>
              <h1 className="text-sm font-bold text-sidebar-primary-foreground">Smart IP</h1>
              <p className="text-xs text-sidebar-muted">Subnet Calculator</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onToolChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTool === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-muted">All calculations are performed locally in your browser.</p>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden bg-card border-b border-border overflow-x-auto">
        <div className="flex items-center gap-1 p-2 min-w-max">
          <Network className="h-5 w-5 text-primary mx-2 flex-shrink-0" />
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onToolChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeTool === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
