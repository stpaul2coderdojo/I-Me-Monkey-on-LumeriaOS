import React, { useState } from 'react';
import { WalletAccount, BlockchainNetwork } from '../types';
import { 
  Coins, 
  ArrowRightLeft, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Check, 
  Cpu, 
  Clock,
  ArrowRight
} from 'lucide-react';

interface StakingBridgeSectionProps {
  activeAccount: WalletAccount;
  currentNetwork: BlockchainNetwork;
  onUpdateAccount: (updated: Partial<WalletAccount>) => void;
}

export const StakingBridgeSection: React.FC<StakingBridgeSectionProps> = ({
  activeAccount,
  currentNetwork,
  onUpdateAccount,
}) => {
  const [stakeAmount, setStakeAmount] = useState('10000');
  const [isStaking, setIsStaking] = useState(false);
  const [unclaimedRewards, setUnclaimedRewards] = useState(1420);
  const [activeTab, setActiveTab] = useState<'staking' | 'bridge'>('staking');

  // Bridge state
  const [bridgeAmount, setBridgeAmount] = useState('5000');
  const [bridgeSource, setBridgeSource] = useState<BlockchainNetwork>('ethereum');
  const [bridgeTarget, setBridgeTarget] = useState<BlockchainNetwork>('avalanche');
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStep, setBridgeStep] = useState<number | null>(null);

  const apy = currentNetwork === 'avalanche' ? 18.4 : 14.2;

  const handleStake = () => {
    const num = parseFloat(stakeAmount) || 0;
    if (num <= 0 || num > activeAccount.immBalance) return;

    setIsStaking(true);
    setTimeout(() => {
      onUpdateAccount({
        immBalance: activeAccount.immBalance - num,
        stakedImm: activeAccount.stakedImm + num,
        votingPower: activeAccount.votingPower + Math.floor(num * 1.5),
      });
      setIsStaking(false);
      setStakeAmount('');
    }, 1200);
  };

  const handleClaimRewards = () => {
    if (unclaimedRewards <= 0) return;
    onUpdateAccount({
      immBalance: activeAccount.immBalance + unclaimedRewards,
    });
    setUnclaimedRewards(0);
  };

  const handleStartBridge = () => {
    const num = parseFloat(bridgeAmount) || 0;
    if (num <= 0) return;

    setIsBridging(true);
    setBridgeStep(1);

    setTimeout(() => {
      setBridgeStep(2);
      setTimeout(() => {
        setBridgeStep(3);
        setTimeout(() => {
          setIsBridging(false);
          setBridgeStep(null);
          alert(`Successfully bridged ${num.toLocaleString()} $IMM from ${bridgeSource} to ${bridgeTarget} via Avalanche Warp Messaging!`);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>Yield & Cross-Chain Liquidity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            $IMM Token Staking & Cross-Chain Bridge
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Stake $IMM to elevate your Google Wallet membership tier and amplify voting power. 
            Seamlessly bridge between Ethereum Mainnet and Avalanche C-Chain.
          </p>
        </div>

        {/* View switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('staking')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'staking' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Staking Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('bridge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'bridge' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
            <span>Teleporter Bridge</span>
          </button>
        </div>
      </div>

      {activeTab === 'staking' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Staking Action Panel */}
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-white text-lg">Stake $IMM for Voting Power</h3>
                <span className="text-xs text-slate-400">Yield generated via protocol treasury buybacks and grant fees</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-emerald-400 block">{currentNetwork === 'avalanche' ? 'Avalanche Boost' : 'Ethereum L1'}</span>
                <span className="text-2xl font-display font-black text-white">{apy}% APY</span>
              </div>
            </div>

            {/* Balances summary */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Your Liquid $IMM:</span>
                <span className="font-mono text-base font-bold text-white">
                  {activeAccount.immBalance.toLocaleString()} $IMM
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Currently Staked:</span>
                <span className="font-mono text-base font-bold text-amber-400">
                  {activeAccount.stakedImm.toLocaleString()} $IMM
                </span>
              </div>
            </div>

            {/* Input field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Amount to Stake:</span>
                <button
                  onClick={() => setStakeAmount(activeAccount.immBalance.toString())}
                  className="text-amber-400 hover:text-amber-300 font-semibold"
                >
                  MAX ({activeAccount.immBalance.toLocaleString()})
                </button>
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-base focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-4 top-3.5 font-bold text-xs text-slate-400">
                  $IMM
                </span>
              </div>
            </div>

            {/* Staking perks breakdown */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span>Voting Power Multiplier:</span>
                <strong className="text-amber-400 font-mono">1.5x Boost</strong>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span>Lockup Period:</span>
                <strong className="text-slate-200">0 Days (Liquid Flexible Staking)</strong>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Google Wallet Pass Tier:</span>
                <strong className="text-emerald-400">{activeAccount.tier}</strong>
              </div>
            </div>

            <button
              onClick={handleStake}
              disabled={isStaking || !parseFloat(stakeAmount)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isStaking ? 'Locking in Timelock Vault...' : 'Stake $IMM & Upgrade Pass'}
            </button>
          </div>

          {/* Staking Rewards & Tier Upgrade tracker */}
          <div className="lg:col-span-5 space-y-6">
            {/* Rewards Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-white text-base">Accrued Yield Rewards</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Unclaimed Rewards:</span>
                <div className="text-2xl font-mono font-black text-emerald-400">
                  +{unclaimedRewards.toLocaleString()} $IMM
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  ~ ${(unclaimedRewards * 0.024).toFixed(2)} USD value
                </span>
              </div>

              <button
                onClick={handleClaimRewards}
                disabled={unclaimedRewards === 0}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                Claim Rewards to Wallet
              </button>
            </div>

            {/* Google Wallet Tier Progression */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-3">
              <h4 className="font-display font-bold text-white text-base">Google Wallet Pass Tiers</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="font-bold text-amber-300">Genesis Elder Monkey</span>
                  <span className="font-mono text-slate-300">200k+ $IMM (Active)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-slate-300">Gold Delegate</span>
                  <span className="font-mono text-slate-400">100k - 199k $IMM</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-slate-400">Silver Contributor</span>
                  <span className="font-mono text-slate-500">25k - 99k $IMM</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-slate-500">Bronze Hodler</span>
                  <span className="font-mono text-slate-500">1k - 24k $IMM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Cross-Chain Teleporter Bridge */
        <div className="max-w-2xl mx-auto bg-slate-900/70 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-white">Cross-Chain $IMM Teleporter</h3>
              <p className="text-xs text-slate-400">Transfer governance tokens between Ethereum L1 and Avalanche C-Chain</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
              Teleporter Ready
            </span>
          </div>

          <div className="space-y-4">
            {/* Origin & Destination Chains */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">From Origin Chain</span>
                <select
                  value={bridgeSource}
                  onChange={(e) => {
                    const src = e.target.value as BlockchainNetwork;
                    setBridgeSource(src);
                    setBridgeTarget(src === 'ethereum' ? 'avalanche' : 'ethereum');
                  }}
                  className="w-full bg-transparent font-bold text-white text-sm focus:outline-none"
                >
                  <option value="ethereum">Ethereum Mainnet (ETH)</option>
                  <option value="avalanche">Avalanche C-Chain (AVAX)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">To Destination Chain</span>
                <select
                  value={bridgeTarget}
                  disabled
                  className="w-full bg-transparent font-bold text-slate-300 text-sm focus:outline-none"
                >
                  <option value={bridgeTarget}>
                    {bridgeTarget === 'avalanche' ? 'Avalanche C-Chain (AVAX)' : 'Ethereum Mainnet (ETH)'}
                  </option>
                </select>
              </div>
            </div>

            {/* Transfer Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Transfer Amount:</span>
                <span>Balance: {activeAccount.immBalance.toLocaleString()} $IMM</span>
              </div>
              <input
                type="number"
                value={bridgeAmount}
                onChange={(e) => setBridgeAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-base focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Stepper if bridging */}
            {isBridging && (
              <div className="p-4 bg-slate-950 rounded-xl border border-sky-500/30 space-y-3 text-xs">
                <span className="font-bold text-sky-400 block">Avalanche Teleporter Pipeline:</span>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 ${bridgeStep && bridgeStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>Step 1: Locking tokens on {bridgeSource}...</span>
                  </div>
                  <div className={`flex items-center gap-2 ${bridgeStep && bridgeStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>Step 2: Google Antigravity Agent validating state attestation...</span>
                  </div>
                  <div className={`flex items-center gap-2 ${bridgeStep && bridgeStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>Step 3: Minting tokens on {bridgeTarget} C-Chain...</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleStartBridge}
              disabled={isBridging || !parseFloat(bridgeAmount)}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              {isBridging ? 'Teleporting Tokens Across Chains...' : `Teleport ${bridgeAmount} $IMM to ${bridgeTarget}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
