import { useStellarWallet } from './hooks/useStellarWallet';
import { WalletPanel } from './components/WalletPanel';
import { BalanceCard } from './components/BalanceCard';
import { SendXLMForm } from './components/SendXLMForm';

const CONTRACT_ID = 'CA27HN2BIH67SBM3PHD3DVYJAFM4SRYUVN5ZGNVCZCEE6ZBHBJSLUA6T';
const CONTRACT_EXPLORER = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`;

export default function App() {
  const wallet = useStellarWallet();

  return (
    <div className="min-h-screen bg-canvas flex flex-col">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="border-b border-rim-dim px-6 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-ink tracking-tight">Ayuda Direct</span>
            <span className="text-xs font-medium text-ink-3 border border-rim-dim rounded px-1.5 py-0.5 leading-none">
              Testnet
            </span>
          </div>
          <WalletPanel
            variant="header"
            publicKey={wallet.publicKey}
            walletConnected={wallet.walletConnected}
            isConnecting={wallet.isConnecting}
            onConnect={wallet.connect}
            onDisconnect={wallet.disconnect}
          />
        </div>
      </header>

      {/* ── Global error banner ───────────────────────────────────────────── */}
      {wallet.error && (
        <div className="border-b border-crimson-ghost bg-crimson-ghost px-6 py-2.5">
          <p className="max-w-3xl mx-auto text-sm text-crimson">{wallet.error}</p>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1">

        {wallet.walletConnected ? (
          /* Connected state: balance + send form */
          <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
            <BalanceCard
              balance={wallet.balance}
              isLoading={wallet.isLoadingBalance}
              onRefresh={wallet.refreshBalance}
            />

            <hr className="border-rim-dim" />

            <SendXLMForm
              isSending={wallet.isSending}
              txStatus={wallet.txStatus}
              txHash={wallet.txHash}
              onSend={wallet.sendXLM}
              onClearTx={wallet.clearTx}
            />
          </div>
        ) : (
          /* Disconnected state: centered connect prompt */
          <div className="max-w-xl mx-auto px-6 py-16 flex flex-col items-start">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-3 mb-6">
              Stellar Testnet
            </p>

            <h1 className="text-3xl font-bold text-ink leading-snug mb-3">
              Direct aid, on-chain.
            </h1>
            <p className="text-ink-2 leading-relaxed mb-8 max-w-sm">
              A program pool is funded once. Enrolled beneficiaries claim their stipend
              directly from the contract, at most once per period, with no middlemen.
            </p>

            <WalletPanel
              variant="page"
              publicKey={wallet.publicKey}
              walletConnected={wallet.walletConnected}
              isConnecting={wallet.isConnecting}
              onConnect={wallet.connect}
              onDisconnect={wallet.disconnect}
            />

            <p className="mt-8 text-xs text-ink-3">
              Contract:{' '}
              <a
                href={CONTRACT_EXPLORER}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono hover:text-ink-2 underline underline-offset-2 transition-colors"
              >
                {CONTRACT_ID.slice(0, 8)}…{CONTRACT_ID.slice(-4)}
              </a>
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-rim-dim px-6 py-5">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-ink-3">
          <ol className="flex items-center gap-2 flex-wrap">
            <li className="flex items-center gap-2">
              <span className="font-semibold text-gold">1</span> Fund
            </li>
            <li className="text-rim">→</li>
            <li className="flex items-center gap-2">
              <span className="font-semibold text-gold">2</span> Enroll
            </li>
            <li className="text-rim">→</li>
            <li className="flex items-center gap-2">
              <span className="font-semibold text-gold">3</span> Claim
            </li>
            <li className="text-rim">·</li>
            <li>No middlemen. Every disbursement on-chain.</li>
          </ol>
          <p>MIT © Lance Jericho Salcedo</p>
        </div>
      </footer>

    </div>
  );
}
