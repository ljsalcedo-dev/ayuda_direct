import { formatXLM } from '../lib/stellar';

interface BalanceCardProps {
  balance: string | null;
  isLoading: boolean;
  walletConnected: boolean;
  onRefresh: () => Promise<void>;
}

export function BalanceCard({ balance, isLoading, walletConnected, onRefresh }: BalanceCardProps) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          XLM Balance
        </h2>
        {walletConnected && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh balance"
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <RefreshIcon spinning={isLoading} />
          </button>
        )}
      </div>

      {!walletConnected ? (
        <p className="text-slate-500 text-sm">Connect your wallet to see your balance.</p>
      ) : isLoading ? (
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg bg-slate-800 animate-pulse" />
          <div className="h-4 w-24 rounded-lg bg-slate-800 animate-pulse" />
        </div>
      ) : balance !== null ? (
        <div className="min-w-0">
          <p className="text-2xl font-bold text-white tabular-nums truncate" title={`${formatXLM(balance)} XLM`}>
            {formatXLM(balance)}
          </p>
          <p className="text-sm text-slate-400 mt-1">XLM · Stellar Testnet</p>
        </div>
      ) : (
        <div className="rounded-lg bg-amber-950/50 border border-amber-800/50 p-3 text-sm text-amber-300">
          Account not funded yet. Get free Testnet XLM at{' '}
          <a
            href="https://friendbot.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium hover:text-amber-100"
          >
            friendbot.stellar.org
          </a>
          , then click refresh.
        </div>
      )}
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"
      />
    </svg>
  );
}
