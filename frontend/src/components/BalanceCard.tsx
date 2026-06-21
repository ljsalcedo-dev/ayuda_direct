import { formatXLM } from '../lib/stellar';

interface BalanceCardProps {
  balance: string | null;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function BalanceCard({ balance, isLoading, onRefresh }: BalanceCardProps) {
  return (
    <section aria-label="XLM balance">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-3">Balance</p>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh balance"
          className="flex items-center gap-1 text-xs text-ink-3 hover:text-ink-2 disabled:opacity-40 transition-colors"
        >
          <RefreshIcon spinning={isLoading} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-1">
          <div className="h-10 w-52 rounded-md bg-panel animate-pulse" />
          <div className="h-4 w-28 rounded-md bg-panel animate-pulse" />
        </div>
      ) : balance !== null ? (
        <div>
          <p
            className="text-5xl font-bold text-ink tabular-nums leading-tight"
            title={`${balance} XLM`}
          >
            {formatXLM(balance)}
          </p>
          <p className="mt-1.5 text-sm text-ink-2">
            XLM <span className="text-ink-3">·</span> Stellar Testnet
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-topaz-ghost bg-topaz-ghost px-4 py-3 text-sm text-topaz leading-relaxed">
          Account not found on Testnet. Fund it at{' '}
          <a
            href="https://friendbot.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 font-medium hover:text-ink transition-colors"
          >
            friendbot.stellar.org
          </a>
          , then refresh.
        </div>
      )}
    </section>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 ${spinning ? 'animate-spin' : ''}`}
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
