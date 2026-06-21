import { useState, type FormEvent } from 'react';
import { isValidStellarPublicKey, isValidAmount, STELLAR_EXPERT_TX_URL } from '../lib/stellar';
import type { TxStatus } from '../hooks/useStellarWallet';

interface SendXLMFormProps {
  isSending: boolean;
  txStatus: TxStatus;
  txHash: string | null;
  onSend: (params: { destination: string; amount: string; memo?: string }) => Promise<void>;
  onClearTx: () => void;
}

export function SendXLMForm({ isSending, txStatus, txHash, onSend, onClearTx }: SendXLMFormProps) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ destination?: string; amount?: string }>({});

  function validate(): boolean {
    const errors: { destination?: string; amount?: string } = {};
    if (!destination.trim()) {
      errors.destination = 'Required.';
    } else if (!isValidStellarPublicKey(destination.trim())) {
      errors.destination = 'Must be a valid Stellar public key (starts with G).';
    }
    if (!amount.trim()) {
      errors.amount = 'Required.';
    } else if (!isValidAmount(amount.trim())) {
      errors.amount = 'Positive number, up to 7 decimal places.';
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

  // ── Success state ──────────────────────────────────────────────────────────
  if (txStatus === 'success' && txHash) {
    return (
      <section aria-label="Transaction result">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-3 mb-4">Send XLM</p>
        <div className="rounded-lg border border-jade-ghost bg-jade-ghost px-4 py-4 space-y-3">
          <p className="text-jade font-semibold flex items-center gap-2">
            <CheckCircleIcon /> Transaction confirmed
          </p>
          <div>
            <p className="text-xs text-ink-3 mb-0.5">Hash</p>
            <p className="font-mono text-xs text-ink-2 break-all">{txHash}</p>
          </div>
          <a
            href={`${STELLAR_EXPERT_TX_URL}/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-2 underline underline-offset-2 transition-colors"
          >
            View on Stellar Expert <ExternalLinkIcon />
          </a>
        </div>
        <button
          onClick={handleReset}
          className="mt-3 text-sm text-ink-3 hover:text-ink-2 underline underline-offset-2 transition-colors"
        >
          Send another
        </button>
      </section>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <section aria-label="Send XLM">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-3 mb-4">Send XLM</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Destination — full width */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-ink-2 mb-1.5">
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
            placeholder="G…"
            disabled={isSending}
            aria-invalid={!!fieldErrors.destination}
            aria-describedby={fieldErrors.destination ? 'dest-error' : undefined}
            className="w-full rounded-lg bg-control border border-rim focus:border-gold focus:ring-1 focus:ring-gold outline-none px-3.5 py-2.5 font-mono text-sm text-ink placeholder-ink-3 disabled:opacity-50 transition-colors"
          />
          {fieldErrors.destination && (
            <p id="dest-error" className="mt-1.5 text-xs text-crimson">{fieldErrors.destination}</p>
          )}
        </div>

        {/* Amount + Memo — side by side on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-ink-2 mb-1.5">
              Amount <span className="text-ink-3 font-normal">(XLM)</span>
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
              aria-invalid={!!fieldErrors.amount}
              aria-describedby={fieldErrors.amount ? 'amount-error' : undefined}
              className="w-full rounded-lg bg-control border border-rim focus:border-gold focus:ring-1 focus:ring-gold outline-none px-3.5 py-2.5 text-sm text-ink placeholder-ink-3 disabled:opacity-50 transition-colors"
            />
            {fieldErrors.amount && (
              <p id="amount-error" className="mt-1.5 text-xs text-crimson">{fieldErrors.amount}</p>
            )}
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-ink-2 mb-1.5">
              Memo <span className="text-ink-3 font-normal">(optional)</span>
            </label>
            <input
              id="memo"
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value.slice(0, 28))}
              placeholder="e.g. stipend"
              disabled={isSending}
              className="w-full rounded-lg bg-control border border-rim focus:border-gold focus:ring-1 focus:ring-gold outline-none px-3.5 py-2.5 text-sm text-ink placeholder-ink-3 disabled:opacity-50 transition-colors"
            />
          </div>
        </div>

        {/* Error banner */}
        {txStatus === 'error' && (
          <p className="text-xs text-crimson flex items-center gap-1.5">
            <XCircleIcon /> Transaction failed. Check the error above and try again.
          </p>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSending}
            className="flex items-center gap-2 rounded-lg bg-gold text-gold-deep hover:bg-gold-2 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            {isSending ? (
              <>
                <SpinnerIcon />
                {txStatus === 'pending' ? 'Submitting…' : 'Sign in Freighter…'}
              </>
            ) : (
              <>
                Send XLM
                <ArrowRightIcon />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}
