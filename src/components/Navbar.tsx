import React from 'react';
import { BlockchainNetwork, NetworkConfig, WalletAccount, NavTabType } from '../types';
import { 
  Wallet, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  Vote, 
  Coins, 
  Rocket, 
  Layers,
  Box,
  TreePine,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  currentNetwork: BlockchainNetwork;
  networks: Record<'ethereum' | 'avalanche', NetworkConfig>;
  onSelectNetwork: (network: BlockchainNetwork) => void;
  activeAccount: WalletAccount;
  onOpenWalletModal: () => void;
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentNetwork,
  networks,
  onSelectNetwork,
  activeAccount,
  onOpenWalletModal,
  activeTab,
  onSelectTab,
}) => {
  const net = networks[currentNetwork];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Info */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('overview')}>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-xl">🐵</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[9px] text-black font-bold">
                ✓
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg text-white tracking-tight">I-Me-Monkey DAO</span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  DApp v2.5
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Ethereum & Avalanche</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Antigravity Guard
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-sm">
            <button
              onClick={() => onSelectTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Treasury</span>
            </button>

            <button
              onClick={() => onSelectTab('proposals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'proposals'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Vote className="w-4 h-4 text-purple-400" />
              <span>Governance</span>
            </button>

            <button
              onClick={() => onSelectTab('digital-twin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'digital-twin'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Box className="w-4 h-4 text-emerald-400" />
              <span>Digital Twin</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                USD
              </span>
            </button>

            <button
              onClick={() => onSelectTab('semiotics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'semiotics'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Semiotics Lexicon</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                USD
              </span>
            </button>

            <button
              onClick={() => onSelectTab('wallet-pass')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all relative ${
                activeTab === 'wallet-pass'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Google Wallet</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Pass
              </span>
            </button>

            <button
              onClick={() => onSelectTab('startups')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'startups'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Rocket className="w-4 h-4 text-emerald-400" />
              <span>Google for Startups</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </button>

            <button
              onClick={() => onSelectTab('staking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'staking'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Coins className="w-4 h-4 text-rose-400" />
              <span>Staking & Bridge</span>
            </button>
          </nav>

          {/* Right Controls: Chain Selector & Wallet */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Chain Selector */}
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => onSelectNetwork('ethereum')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentNetwork === 'ethereum'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Ethereum"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-sky-400/20 flex items-center justify-center text-[10px] text-sky-300 font-bold">
                  Ξ
                </div>
                <span className="hidden sm:inline">Ethereum</span>
              </button>

              <button
                onClick={() => onSelectNetwork('avalanche')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentNetwork === 'avalanche'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Avalanche C-Chain"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-rose-400/20 flex items-center justify-center text-[10px] text-rose-300 font-bold">
                  ▲
                </div>
                <span className="hidden sm:inline">Avalanche</span>
              </button>
            </div>

            {/* Wallet Button */}
            <button
              onClick={onOpenWalletModal}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs text-slate-200 font-medium transition-all shadow-sm group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-110 transition-transform"></div>
              <span className="font-mono">{activeAccount.address.slice(0, 6)}...{activeAccount.address.slice(-4)}</span>
              <span className="hidden lg:inline-flex px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold text-[10px]">
                {activeAccount.immBalance.toLocaleString()} $IMM
              </span>
              <Wallet className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </button>

            {/* GitHub link */}
            <a
              href="https://github.com/I-Me-Monkey-DAO/DAO"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-700 transition-all"
              title="View I-Me-Monkey DAO GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => onSelectTab('overview')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${activeTab === 'overview' ? 'text-sky-400 font-bold' : 'text-slate-400'}`}
          >
            <Layers className="w-4 h-4" />
            <span>Treasury</span>
          </button>
          <button
            onClick={() => onSelectTab('proposals')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${activeTab === 'proposals' ? 'text-purple-400 font-bold' : 'text-slate-400'}`}
          >
            <Vote className="w-4 h-4" />
            <span>Governance</span>
          </button>
          <button
            onClick={() => onSelectTab('digital-twin')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${activeTab === 'digital-twin' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <Box className="w-4 h-4" />
            <span>Twin (USD)</span>
          </button>
          <button
            onClick={() => onSelectTab('semiotics')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${activeTab === 'semiotics' ? 'text-purple-400 font-bold' : 'text-slate-400'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Semiotics</span>
          </button>
          <button
            onClick={() => onSelectTab('wallet-pass')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${activeTab === 'wallet-pass' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <CreditCard className="w-4 h-4" />
            <span>G-Wallet</span>
          </button>
          <button
            onClick={() => onSelectTab('startups')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${activeTab === 'startups' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <Rocket className="w-4 h-4" />
            <span>Startups</span>
          </button>
          <button
            onClick={() => onSelectTab('staking')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${activeTab === 'staking' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}
          >
            <Coins className="w-4 h-4" />
            <span>Staking</span>
          </button>
        </div>
      </div>
    </header>
  );
};
