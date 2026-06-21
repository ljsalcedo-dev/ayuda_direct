import { useStellarWallet } from './hooks/useStellarWallet';
import { WalletPanel } from './components/WalletPanel';
import { BalanceCard } from './components/BalanceCard';
import { SendXLMForm } from './components/SendXLMForm';

export default function App() {
  const wallet = useStellarWallet();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Ayuda Direct</h1>
            <p className="text-xs text-slate-400">Leak-proof cash assistance · Stellar Testnet</p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-teal-900/50 border border-teal-700/50 px-3 py-1 text-xs font-medium text-teal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            Testnet
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* Error banner (global) */}
        {wallet.error && (
          <div className="rounded-xl bg-red-950/60 border border-red-800/60 px-4 py-3 text-sm text-red-300 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{wallet.error}</span>
          </div>
        )}

        {/* Intro callout — only shown when disconnected */}
        {!wallet.walletConnected && (
          <div className="rounded-2xl bg-gradient-to-br from-teal-950/60 to-slate-900 border border-teal-800/40 p-6">
            <h2 className="text-xl font-bold text-white mb-2">
              Direct aid, on-chain
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-prose">
              Ayuda Direct removes middlemen from government and NGO cash-assistance programs.
              A program pool is funded once; enrolled beneficiaries claim their stipend directly
              from the smart contract — no manual batch runs, no discretionary delays, every
              peso verifiable on Stellar.
            </p>
            <p className="mt-3 text-sm text-teal-400">
              Contract:{' '}
              <a
                href="https://stellar.expert/explorer/testnet/contract/CA27HN2BIH67SBM3PHD3DVYJAFM4SRYUVN5ZGNVCZCEE6ZBHBJSLUA6T"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono underline hover:text-teal-300"
              >
                CA27HN2B…UA6T
              </a>
            </p>
          </div>
        )}

        {/* Three-column card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <WalletPanel
            publicKey={wallet.publicKey}
            walletConnected={wallet.walletConnected}
            isConnecting={wallet.isConnecting}
            onConnect={wallet.connect}
            onDisconnect={wallet.disconnect}
          />

          <BalanceCard
            balance={wallet.balance}
            isLoading={wallet.isLoadingBalance}
            walletConnected={wallet.walletConnected}
            onRefresh={wallet.refreshBalance}
          />

          <div className="md:col-span-2 lg:col-span-1">
            <SendXLMForm
              walletConnected={wallet.walletConnected}
              isSending={wallet.isSending}
              txStatus={wallet.txStatus}
              txHash={wallet.txHash}
              onSend={wallet.sendXLM}
              onClearTx={wallet.clearTx}
            />
          </div>
        </div>

        {/* About section */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">
            How it works
          </h2>
          <ol className="space-y-2 text-sm text-slate-300">
            <li className="flex gap-2">
              <span className="text-teal-500 font-bold shrink-0">1.</span>
              A government unit or NGO <strong>funds</strong> the on-chain pool once.
            </li>
            <li className="flex gap-2">
              <span className="text-teal-500 font-bold shrink-0">2.</span>
              The admin <strong>enrolls</strong> beneficiaries — any Stellar address.
            </li>
            <li className="flex gap-2">
              <span className="text-teal-500 font-bold shrink-0">3.</span>
              Each beneficiary <strong>claims</strong> their fixed stipend directly from the contract,
              at most once per period — enforced by the ledger clock, no operator needed.
            </li>
          </ol>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        Ayuda Direct · MIT © Lance Jericho Salcedo · Stellar Testnet only
      </footer>
    </div>
  );
}
