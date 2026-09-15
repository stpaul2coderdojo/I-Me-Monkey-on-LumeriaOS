import React from 'react';
import { BlockchainNetwork, NetworkConfig } from '../types';
import { Activity, ShieldCheck, Cpu, ExternalLink, Zap } from 'lucide-react';

interface NetworkBannerProps {
  currentNetwork: BlockchainNetwork;
  networks: Record<'ethereum' | 'avalanche', NetworkConfig>;
}

export const NetworkBanner: React.FC<NetworkBannerProps> = ({ currentNetwork, networks }) => {
  const net = networks[currentNetwork];
  const otherNet = networks[currentNetwork === 'ethereum' ? 'avalanche' : 'ethereum'];

  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Chain Live Telemetry */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200">{net.name}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[11px]">
              Block #{net.currentBlock.toLocaleString()}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Gas: <strong className="text-slate-200">{net.avgGas}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-3">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Antigravity:</span>
            <span className="text-emerald-400 font-medium bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/50">
              Active Guard
            </span>
          </div>
        </div>

        {/* Right: Cross-Chain Link & Explorer */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <span>Linked Chain:</span>
            <span className="text-slate-200 font-medium">{otherNet.shortName} (AWM Bridge Ready)</span>
          </div>

          <a
            href={`${net.explorerUrl}/address/${net.immTokenAddress}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors"
          >
            <span>{net.explorerName}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
