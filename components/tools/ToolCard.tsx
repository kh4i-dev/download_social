import React from "react";

interface ToolCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function ToolCard({ title, description, children, className = "" }: ToolCardProps) {
  return (
    <div className={`glass-panel border border-[#232332] bg-[#161622] rounded-2xl relative overflow-hidden transition-all duration-500 shadow-[0_30px_100px_rgba(0,0,0,0.6)] hover-scale-effect p-6 md:p-8 w-full max-w-4xl ${className}`}>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 font-display">{title}</h2>
          <p className="text-xs text-zinc-400 mt-1">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
