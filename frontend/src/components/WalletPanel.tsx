import { useState } from 'react';
import { truncateKey } from '../lib/stellar';

interface WalletPanelProps {
  /** 'header' = compact inline widget for the site header when connected.
   *  'page'   = full connect UI shown in the main content area. */
  variant: 'header' | 'page';
  publicKey: string | null;
  walletConnected: boolean;
  isConnecting: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

export function WalletPanel({
  variant,
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

  // ── Header variant: compact strip used inside the <header> ─────────────
  if (variant === 'header') {
    if (!walletConnected || !publicKey) return null;
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={copyAddress}
          title={publicKey}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-ink-2 hover:text-ink hover:bg-panel transition-colors"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-jade shrink-0" />
          {truncateKey(publicKey, 6)}
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
        <button
          onClick={onDisconnect}
          className="rounded-md px-3 py-1 text-xs font-medium text-ink-3 border border-rim hover:border-rim hover:text-ink hover:bg-panel transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // ── Page variant: full connect UI in the main content area ──────────────
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-topaz-ghost bg-topaz-ghost px-4 py-3 text-sm text-topaz flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0 text-base leading-none">!</span>
        <span>
          Install the{' '}
          <a
            href="https://freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 font-medium hover:text-ink transition-colors"
          >
            Freighter extension
          </a>{' '}
          and switch it to <strong className="font-semibold">Testnet</strong> before connecting.
        </span>
      </div>

      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold text-gold-deep hover:bg-gold-2 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 text-sm font-semibold transition-colors"
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
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function WalletIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
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
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-jade" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
