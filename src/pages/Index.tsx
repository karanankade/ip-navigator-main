import { useState } from "react";
import { AppSidebar, type Tool } from "@/components/AppSidebar";
import { IPv4Calculator } from "@/components/IPv4Calculator";
import { IPv6Calculator } from "@/components/IPv6Calculator";
import { IPValidator } from "@/components/IPValidator";
import { IPRangeGenerator } from "@/components/IPRangeGenerator";
import { CIDRConverter } from "@/components/CIDRConverter";
import { BinaryVisualizer } from "@/components/BinaryVisualizer";
import { VLSMCalculator } from "@/components/VLSMCalculator";

const tools: Record<Tool, React.FC> = {
  ipv4: IPv4Calculator,
  ipv6: IPv6Calculator,
  validator: IPValidator,
  range: IPRangeGenerator,
  cidr: CIDRConverter,
  binary: BinaryVisualizer,
  vlsm: VLSMCalculator,
};

const Index = () => {
  const [activeTool, setActiveTool] = useState<Tool>("ipv4");
  const ActiveComponent = tools[activeTool];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeTool={activeTool} onToolChange={setActiveTool} />
      <main className="flex-1 min-h-screen">
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
};

export default Index;
