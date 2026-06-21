import { useState, type FormEvent } from 'react';
import { isValidStellarPublicKey, isValidAmount, STELLAR_EXPERT_TX_URL } from '../lib/stellar';
import type { TxStatus } from '../hooks/useStellarWallet';

interface SendXLMFormProps {
  walletConnected: boolean;
  isSending: boolean;
  txStatus: TxStatus;
  txHash: string | null;
  onSend: (params: { destination: string; amount: string; memo?: string }) => Promise<void>;
  onClearTx: () => void;
}

export function SendXLMForm({
  walletConnected,
  isSending,
  txStatus,
  txHash,
  onSend,
  onClearTx,
}: SendXLMFormProps) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ destination?: string; amount?: string }>({});

  function validate(): boolean {
    const errors: { destination?: string; amount?: string } = {};
    if (!destination.trim()) {
      errors.destination = 'Destination address is required.';
    } else if (!isValidStellarPublicKey(destination.trim())) {
      errors.destination = 'Must be a valid Stellar public key starting with G.';
    }
    if (!amount.trim()) {
      errors.amount = 'Amount is required.';
    } else if (!isValidAmount(amount.trim())) {
      errors.amount = 'Must be a positive number with up to 7 decimal places.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSend({ destination: destination.trim(), amount: amount.trim(), memo: memo.trim() });
  }

  function handleReset() {
    setDestination('');
    setAmount('');
    setMemo('');
    setFieldErrors({});
    onClearTx();
  }

  if (!walletConnected) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
          Send XLM
        </h2>
        <p className="text-slate-500 text-sm">Connect your wallet to send XLM.</p>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────

  if (txStatus === 'success' && txHash) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
          Send XLM
        </h2>
        <div className="rounded-xl bg-emerald-950/50 border border-emerald-800/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircleIcon />
            Transaction confirmed
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Transaction hash</p>
            <p className="font-mono text-xs text-slate-300 break-all">{txHash}</p>
          </div>
          <a
            href={`${STELLAR_EXPERT_TX_URL}/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 underline"
          >
            View on Stellar Expert
            <ExternalLinkIcon />
          </a>
        </div>
        <button
          onClick={handleReset}
          className="mt-4 w-full rounded-xl border border-slate-700 hover:border-slate-500 px-4 py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
        >
          Send another transaction
        </button>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
        Send XLM
      </h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Destination */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-slate-300 mb-1.5">
            Destination address
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              if (fieldErrors.destination) setFieldErrors((p) => ({ ...p, destination: undefined }));
            }}
            placeholder="G..."
            disabled={isSending}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none px-4 py-3 font-mono text-sm text-slate-100 placeholder-slate-500 disabled:opacity-50 transition-colors"
          />
          {fieldErrors.destination && (
            <p className="mt-1.5 text-xs text-red-400">{fieldErrors.destination}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1.5">
            Amount (XLM)
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (fieldErrors.amount) setFieldErrors((p) => ({ ...p, amount: undefined }));
            }}
            placeholder="0.0000000"
            disabled={isSending}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none px-4 py-3 text-sm text-slate-100 placeholder-slate-500 disabled:opacity-50 transition-colors"
          />
          {fieldErrors.amount && (
            <p className="mt-1.5 text-xs text-red-400">{fieldErrors.amount}</p>
          )}
        </div>

        {/* Memo (optional) */}
        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-slate-300 mb-1.5">
            Memo{' '}
            <span className="text-slate-500 font-normal">(optional, max 28 chars)</span>
          </label>
          <input
            id="memo"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value.slice(0, 28))}
            placeholder="e.g. stipend payment"
            disabled={isSending}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none px-4 py-3 text-sm text-slate-100 placeholder-slate-500 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Error banner */}
        {txStatus === 'error' && (
          <div className="rounded-xl bg-red-950/50 border border-red-800/50 p-3 text-sm text-red-300 flex items-start gap-2">
            <XCircleIcon className="mt-0.5 shrink-0" />
            <span>Transaction failed. Check the error message above and try again.</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSending}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 font-semibold text-white transition-colors"
        >
          {isSending ? (
            <>
              <SpinnerIcon />
              {txStatus === 'pending' ? 'Submitting…' : 'Waiting for signature…'}
            </>
          ) : (
            <>
              <SendIcon />
              Send XLM
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ── Inline icons ──────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}
