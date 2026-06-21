import { useState } from 'react';
import { truncateKey } from '../lib/stellar';

interface WalletPanelProps {
  publicKey: string | null;
  walletConnected: boolean;
  isConnecting: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

export function WalletPanel({
  publicKey,
  walletConnected,
  isConnecting,
  onConnect,
  onDisconnect,
}: WalletPanelProps) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
        Freighter Wallet
      </h2>

      {!walletConnected ? (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm leading-relaxed">
            Connect your Freighter wallet to interact with Ayuda Direct on Stellar Testnet.
          </p>

          <div className="rounded-lg bg-amber-950/50 border border-amber-800/50 p-3 text-xs text-amber-300">
            <span className="font-semibold">Prerequisite:</span> Install the{' '}
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-100"
            >
              Freighter browser extension
            </a>{' '}
            and switch it to <strong>Testnet</strong> before connecting.
          </div>

          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 font-semibold text-white transition-colors"
          >
            {isConnecting ? (
              <>
                <SpinnerIcon />
                Connecting…
              </>
            ) : (
              <>
                <WalletIcon />
                Connect Freighter
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-xs text-slate-400 mb-1">Connected address</p>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-sm text-teal-300 truncate flex-1">
                {truncateKey(publicKey!, 8)}
              </span>
              <button
                onClick={copyAddress}
                title="Copy full address"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
            <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Stellar Testnet
            </p>
          </div>

          <button
            onClick={onDisconnect}
            className="w-full rounded-xl border border-slate-700 hover:border-slate-500 px-4 py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

// ── Inline icons ──────────────────────────────────────────────────────────────

function WalletIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
