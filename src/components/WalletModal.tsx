import React from 'react';
import { WalletAccount, BlockchainNetwork, NetworkConfig } from '../types';
import { Wallet, Check, Copy, ExternalLink, Droplets, ShieldCheck, X } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: WalletAccount[];
  activeAccount: WalletAccount;
  onSelectAccount: (account: WalletAccount) => void;
  currentNetwork: BlockchainNetwork;
  networks: Record<'ethereum' | 'avalanche', NetworkConfig>;
  onFaucet: (type: 'imm' | 'eth' | 'avax') => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  accounts,
  activeAccount,
  onSelectAccount,
  currentNetwork,
  networks,
  onFaucet,
}) => {
  if (!isOpen) return null;

  const net = networks[currentNetwork];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-white text-base">
              Web3 Account & Faucet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Box */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Connected Identity</span>
            <span className="text-emerald-400 font-semibold">{activeAccount.tier}</span>
          </div>

          <div className="font-mono text-sm font-bold text-white">
            {activeAccount.address}
          </div>

          <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div>
              <span className="text-slate-500 block">ETH</span>
              <span className="font-mono font-bold text-slate-200">{activeAccount.ethBalance}</span>
            </div>
            <div>
              <span className="text-slate-500 block">AVAX</span>
              <span className="font-mono font-bold text-slate-200">{activeAccount.avaxBalance}</span>
            </div>
            <div>
              <span className="text-slate-500 block">$IMM</span>
              <span className="font-mono font-bold text-amber-400">{activeAccount.immBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Switch Profile Personas */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Switch Governance Persona
          </span>

          {accounts.map((acc) => {
            const isSelected = acc.address === activeAccount.address;
            return (
              <button
                key={acc.address}
                onClick={() => onSelectAccount(acc)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/40 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{acc.ensName || acc.tier}</span>
                    {isSelected && <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-bold">Active</span>}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                    {acc.address.slice(0, 8)}...{acc.address.slice(-6)} • {acc.votingPower.toLocaleString()} VP
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-400">
                  {acc.stakedImm.toLocaleString()} Staked
                </div>
              </button>
            );
          })}
        </div>

        {/* Testnet Faucet */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
            <Droplets className="w-3.5 h-3.5" />
            <span>Developer Testnet Faucet</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onFaucet('imm')}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-amber-300 transition-colors"
            >
              +10k $IMM
            </button>

            <button
              onClick={() => onFaucet('eth')}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-sky-300 transition-colors"
            >
              +1.0 ETH
            </button>

            <button
              onClick={() => onFaucet('avax')}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-rose-300 transition-colors"
            >
              +25 AVAX
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
