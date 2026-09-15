import React, { useState } from 'react';
import { WalletAccount, BlockchainNetwork } from '../types';
import { generateSvgQrCode } from '../utils/qrGenerator';
import { 
  CreditCard, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink,
  Nfc,
  Layers,
  KeyRound
} from 'lucide-react';

interface GoogleWalletSectionProps {
  activeAccount: WalletAccount;
  currentNetwork: BlockchainNetwork;
}

export const GoogleWalletSection: React.FC<GoogleWalletSectionProps> = ({
  activeAccount,
  currentNetwork,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJwt, setCopiedJwt] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [passData, setPassData] = useState({
    memberAddress: activeAccount.address,
    memberName: activeAccount.ensName || 'Elder Monkey #0042',
    tier: activeAccount.tier,
    votingPower: `${activeAccount.votingPower.toLocaleString()} VP`,
    immBalance: `${activeAccount.stakedImm.toLocaleString()} $IMM`,
    primaryChain: currentNetwork === 'avalanche' ? 'Avalanche C-Chain' : 'Ethereum Mainnet',
    secondaryChain: currentNetwork === 'avalanche' ? 'Ethereum Mainnet' : 'Avalanche C-Chain',
    jwt: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyGlzc...imm_pass',
    saveUrl: 'https://pay.google.com/gp/v/save/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  });

  const qrSvg = generateSvgQrCode(
    `IMEMonkeyDAO:${activeAccount.address}:${activeAccount.tier}:${activeAccount.votingPower}`,
    200
  );

  const handleRefreshPass = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/wallet/generate-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberAddress: activeAccount.address,
          memberName: activeAccount.ensName || 'Elder Monkey #0042',
          tier: activeAccount.tier,
          votingPower: `${activeAccount.votingPower.toLocaleString()} VP`,
          immBalance: `${activeAccount.stakedImm.toLocaleString()} $IMM`,
          primaryChain: currentNetwork === 'avalanche' ? 'Avalanche C-Chain' : 'Ethereum Mainnet',
          secondaryChain: currentNetwork === 'avalanche' ? 'Ethereum Mainnet' : 'Avalanche C-Chain',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPassData((prev) => ({
          ...prev,
          jwt: data.jwt,
          saveUrl: data.saveUrl,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'link' | 'jwt') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedJwt(true);
      setTimeout(() => setCopiedJwt(false), 2000);
    }
  };

  const handleDownloadPassJson = () => {
    const payload = {
      formatVersion: 1,
      passType: 'googleWalletGenericPass',
      organization: 'I-Me-Monkey DAO',
      issuerId: '3388000000022312345',
      classId: '3388000000022312345.I_ME_MONKEY_DAO_GOVERNANCE_PASS',
      objectId: `3388000000022312345.IMM_MEMBER_${activeAccount.address.slice(0, 8)}`,
      memberData: {
        address: activeAccount.address,
        tier: activeAccount.tier,
        votingPower: activeAccount.votingPower,
        stakedImm: activeAccount.stakedImm,
        primaryChain: passData.primaryChain,
        secondaryChain: passData.secondaryChain,
      },
      verifiedBy: 'Google Antigravity Agent & Google Cloud KMS',
      issuedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IMEMonkey_GoogleWalletPass_${activeAccount.address.slice(0, 6)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Google Wallet Tokenized Pass</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            DAO Membership & Voting Power in Your Google Wallet
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Store your I-Me-Monkey DAO governance credentials, verified on-chain voting power, and soulbound membership directly in Google Wallet for Android and Wear OS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshPass}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Updating Pass...' : 'Sync On-Chain VP'}</span>
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Scan with Phone</span>
          </button>
        </div>
      </div>

      {/* Main Showcase Layout: Visual Google Wallet Pass + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Google Wallet Pass Realistic Card Preview */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-md">
            {/* Phone/Wallet simulated bezel container */}
            <div className="p-1 rounded-[32px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl shadow-black/80">
              {/* Google Wallet Native Pass Card */}
              <div className="w-full bg-[#0b0f19] text-white rounded-[28px] overflow-hidden border border-slate-700/60 p-6 flex flex-col justify-between min-h-[480px] relative">
                {/* Subtle top glare */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500"></div>

                {/* Top Google Wallet Brand header */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Official Google Wallet mini icon SVG representation */}
                      <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center p-1 shadow-sm">
                        <svg viewBox="0 0 24 24" className="w-4 h-4">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-sm tracking-tight text-slate-200">Google Wallet</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                      <Nfc className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">NFC Verified</span>
                    </div>
                  </div>

                  {/* Card Title & DAO Emblem */}
                  <div className="mt-5 flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        {passData.tier}
                      </div>
                      <h2 className="text-xl font-display font-black text-white mt-0.5">
                        I-ME-MONKEY DAO
                      </h2>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Governance & Verifiable Credential
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 p-0.5 shadow-lg">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
                        🐵
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body Data Grid */}
                <div className="my-5 grid grid-cols-2 gap-3 py-3 border-y border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                      VOTING POWER
                    </span>
                    <span className="text-base font-display font-bold text-amber-300">
                      {passData.votingPower}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                      STAKED $IMM
                    </span>
                    <span className="text-base font-display font-bold text-slate-200">
                      {passData.immBalance}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                      PRIMARY CHAIN
                    </span>
                    <span className="text-xs font-semibold text-rose-300 flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      {passData.primaryChain}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                      CROSS-CHAIN LINK
                    </span>
                    <span className="text-xs font-semibold text-sky-300 flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                      {passData.secondaryChain}
                    </span>
                  </div>
                </div>

                {/* Member ID & QR Code Barcode section */}
                <div className="flex items-end justify-between bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                      MEMBER ADDRESS
                    </span>
                    <span className="font-mono text-xs text-slate-300 block">
                      {activeAccount.address.slice(0, 6)}...{activeAccount.address.slice(-4)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Antigravity Verified • Lifetime Access
                    </span>
                  </div>

                  {/* QR Code thumbnail */}
                  <div 
                    className="cursor-pointer bg-white p-1 rounded-lg hover:scale-105 transition-transform" 
                    onClick={() => setShowQrModal(true)}
                    title="Click to enlarge QR Code"
                  >
                    <div 
                      className="w-14 h-14" 
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                  </div>
                </div>

                {/* Security Footer */}
                <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Google Cloud KMS Signed
                  </span>
                  <span>Class ID: ...IMM_GOV_PASS</span>
                </div>
              </div>
            </div>

            {/* Authentic "Add to Google Wallet" Button */}
            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href={passData.saveUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full h-12 bg-black hover:bg-neutral-900 border border-neutral-700 text-white rounded-xl flex items-center justify-center gap-3 px-5 transition-all shadow-md group"
              >
                {/* Official Google 4-Color G logo */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-sm font-semibold tracking-wide">
                  Save to Google Wallet
                </span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(passData.saveUrl, 'link')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-all"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Save Link'}</span>
                </button>

                <button
                  onClick={handleDownloadPassJson}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Innovation Breakdown & Technical Specs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Feature 1: Zero-Seed-Phrase Onboarding */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">
                  Zero-Seed-Phrase Web2 Onboarding
                </h3>
                <span className="text-xs text-amber-400 font-semibold">Web2 Simplicity × Web3 Cryptography</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              New community members no longer need to write down 12-word seed phrases or deal with RPC network configurations. By tokenizing DAO membership onto Google Wallet, users receive their verifiable cryptographic identity in seconds with biometric device protection.
            </p>
          </div>

          {/* Feature 2: Cross-Chain Dynamic Sync */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">
                  Dynamic Cross-Chain State Updates
                </h3>
                <span className="text-xs text-sky-400 font-semibold">Ethereum L1 & Avalanche C-Chain Sync</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When a member stakes $IMM on Avalanche or votes on an Ethereum proposal, the Google Wallet pass automatically updates its displayed voting power via Google Cloud Pub/Sub webhooks and Cloud KMS signed JWT pushes.
            </p>
          </div>

          {/* Feature 3: Real-World In-Person NFC Verification */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">
                  Physical Tap-In for DAO Hacker Houses
                </h3>
                <span className="text-xs text-rose-400 font-semibold">Smartwatch & Android NFC Integration</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              At ETHDenver, Avalanche Summit, or Monkey DAO Hacker Houses, members tap their phone or Wear OS watch at the door. The NFC terminal instantly validates their Genesis Elder or Gold Delegate tier without internet delays.
            </p>
          </div>

          {/* Developer API Payload Inspector */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-mono text-slate-400">Google Wallet Generic Object Payload</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(passData, null, 2), 'jwt')}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                {copiedJwt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedJwt ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>
            <pre className="mt-3 text-[11px] font-mono text-slate-400 bg-slate-900/60 p-3 rounded-lg overflow-x-auto max-h-36">
{`{
  "iss": "imm-dao-wallet@iam.gserviceaccount.com",
  "classId": "3388000000022312345.I_ME_MONKEY_DAO_GOVERNANCE_PASS",
  "memberAddress": "${activeAccount.address}",
  "tier": "${activeAccount.tier}",
  "votingPower": "${activeAccount.votingPower.toLocaleString()} VP",
  "chains": ["Ethereum", "Avalanche"],
  "signature": "GOOGLE_ANTIGRAVITY_VERIFIED"
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* QR Code Modal for Desktop Phone Scanning */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-white text-base">
                Scan with Phone Camera
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
              <div 
                className="w-48 h-48 mx-auto" 
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>

            <p className="text-xs text-slate-300">
              Open your Android phone camera or Google Lens to scan this pass and add it to your Google Wallet app instantly.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
