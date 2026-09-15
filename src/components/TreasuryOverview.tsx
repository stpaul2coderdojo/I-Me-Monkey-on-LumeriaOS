import React from 'react';
import { TreasuryAsset, BlockchainNetwork } from '../types';
import { 
  Vault, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight, 
  Coins, 
  CreditCard, 
  Cpu, 
  Lock,
  ArrowRightLeft,
  Box,
  Trees,
  ExternalLink
} from 'lucide-react';

interface TreasuryOverviewProps {
  treasury: TreasuryAsset[];
  onNavigateToWalletPass: () => void;
  onNavigateToStartups: () => void;
  onNavigateToGovernance: () => void;
  onNavigateToDigitalTwin?: () => void;
  currentNetwork: BlockchainNetwork;
}

export const TreasuryOverview: React.FC<TreasuryOverviewProps> = ({
  treasury,
  onNavigateToWalletPass,
  onNavigateToStartups,
  onNavigateToGovernance,
  onNavigateToDigitalTwin,
  currentNetwork,
}) => {
  const totalValue = treasury.reduce((sum, item) => sum + item.usdValue, 0);
  const ethTreasury = treasury.filter((t) => t.chain === 'ethereum');
  const avaxTreasury = treasury.filter((t) => t.chain === 'avalanche');

  const ethTotal = ethTreasury.reduce((s, i) => s + i.usdValue, 0);
  const avaxTotal = avaxTreasury.reduce((s, i) => s + i.usdValue, 0);

  return (
    <div className="space-y-6">
      {/* Hero Banner with DAO Mission & Google Integrations */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-4">
            <span>🐵 I-Me-Monkey DAO</span>
            <span className="w-1 h-1 rounded-full bg-amber-400"></span>
            <span>Cross-Chain Governance Protocol</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
            Decentralized Autonomous Organization Tokenized on Google Wallet
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Bridging institutional Ethereum L1 security with sub-second Avalanche C-Chain execution. 
            Empowered by verifiable digital passes in Google Wallet and secured by Google Antigravity autonomous agents.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToWalletPass}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <CreditCard className="w-4 h-4 text-slate-950" />
              <span>Get Google Wallet Pass</span>
            </button>

            <button
              onClick={onNavigateToStartups}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm border border-slate-700 transition-all"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Google for Startups Application</span>
            </button>

            <button
              onClick={onNavigateToGovernance}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl text-sm border border-slate-800 transition-all"
            >
              <span>View Active Proposals</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            {onNavigateToDigitalTwin && (
              <button
                onClick={onNavigateToDigitalTwin}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-semibold rounded-xl text-sm border border-emerald-500/30 transition-all shadow-sm"
              >
                <Box className="w-4 h-4 text-emerald-400" />
                <span>Primate Digital Twin (USD)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Marshall Islands Haven & LumeriaOS Spotlight */}
      <div className="bg-gradient-to-r from-teal-950/40 via-slate-900/80 to-emerald-950/40 border border-teal-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20 flex-shrink-0">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Marshall Islands Primate Haven & Miyawaki Forest</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">LumeriaOS USD</span>
            </div>
            <p className="text-slate-400 mt-0.5">
              Live spatial digital twins for monkeys rehabilitated from captivity into cage-free canopies. Supported by <span className="text-slate-300 font-medium">conservationonthematrix.weebly.com</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://conservationonthematrix.weebly.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
          >
            <span>Matrix Web</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {onNavigateToDigitalTwin && (
            <button
              onClick={onNavigateToDigitalTwin}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
            >
              <span>Explore Twins</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Treasury */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>TOTAL DAO TREASURY</span>
            <Vault className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-display font-bold text-white">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +5.8% (30d)
            </span>
            <span className="text-slate-500">across 2 chains</span>
          </div>
        </div>

        {/* Ethereum Reserve */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ETHEREUM RESERVE</span>
            <span className="text-sky-400 font-bold">ETH L1</span>
          </div>
          <div className="mt-2 text-2xl font-display font-bold text-white">
            ${ethTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>420.5 ETH + 850k USDC</span>
            <span className="text-sky-400 font-mono">48.2%</span>
          </div>
        </div>

        {/* Avalanche Reserve */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>AVALANCHE RESERVE</span>
            <span className="text-rose-400 font-bold">AVAX C-Chain</span>
          </div>
          <div className="mt-2 text-2xl font-display font-bold text-white">
            ${avaxTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>34,200 AVAX + 30.7M $IMM</span>
            <span className="text-rose-400 font-mono">51.8%</span>
          </div>
        </div>

        {/* Google Antigravity Security */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ANTIGRAVITY GUARD</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-display font-bold text-emerald-400">
            99.4% Safety
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Autonomous Timelock</span>
            <span className="text-emerald-400 font-semibold">0 Exploits</span>
          </div>
        </div>
      </div>

      {/* Cross-Chain Treasury Breakdown Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-display font-bold text-white">Multi-Chain Treasury Vaults</h2>
            <p className="text-xs text-slate-400">On-chain reserves secured by dual-chain multi-sig timelocks</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Rebalance:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs">50% ETH / 50% AVAX</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold bg-slate-950/40">
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Network</th>
                <th className="px-6 py-3">Holdings</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">USD Value</th>
                <th className="px-6 py-3">Allocation</th>
                <th className="px-6 py-3">24h Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {treasury.map((asset) => (
                <tr key={`${asset.chain}-${asset.symbol}`} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                      {asset.symbol.replace('$', '').slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{asset.symbol}</div>
                      <div className="text-xs text-slate-400 font-normal">{asset.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      asset.chain === 'ethereum' 
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20' 
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                    }`}>
                      {asset.chain === 'ethereum' ? 'Ethereum Mainnet' : 'Avalanche C-Chain'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono">
                    {asset.amount.toLocaleString()} {asset.symbol}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-400">
                    ${asset.priceUsd < 1 ? asset.priceUsd.toFixed(4) : asset.priceUsd.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 font-mono font-bold text-white">
                    ${asset.usdValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full rounded-full" 
                          style={{ width: `${asset.allocationPercent}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs text-slate-400">{asset.allocationPercent}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`font-mono text-xs ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Chain Architecture & Google Antigravity Highlight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bridge & Teleporter */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interop Protocol</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                Teleporter / AWM Ready
              </span>
            </div>
            <h3 className="mt-2 text-lg font-display font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-sky-400" />
              Ethereum L1 & Avalanche Subnet Relayer
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Token holders can cast sub-second, zero-gas votes on Avalanche C-Chain, with state commitments anchored back to Ethereum mainnet. Cross-chain state updates are cryptographically attested in under 1.2 seconds.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Avg Finality: <strong className="text-slate-200">820ms</strong></span>
            <span>Relayed Messages: <strong className="text-slate-200">42,810</strong></span>
          </div>
        </div>

        {/* Google Antigravity Protocol Guard */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Autonomous Layer</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
                Google Antigravity Engine
              </span>
            </div>
            <h3 className="mt-2 text-lg font-display font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Autonomous Governance Simulation
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Before any proposal is queued for execution, Google Antigravity Agent spins up a sandboxed EVM test environment, stress-tests reentrancy vectors, and verifies treasury solvency across both ETH and AVAX chains.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Agent Status: <strong className="text-emerald-400">Monitoring 24/7</strong></span>
            <span>Automated Audits: <strong className="text-slate-200">100% Proposals</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
