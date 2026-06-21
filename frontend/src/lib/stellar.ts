import {
  Horizon,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Operation,
  Asset,
  Memo,
  StrKey,
} from '@stellar/stellar-sdk';

// ── Network ──────────────────────────────────────────────────────────────────

export const STELLAR_NETWORK_NAME = 'TESTNET';
export const STELLAR_NETWORK_PASSPHRASE = Networks.TESTNET;
export const STELLAR_HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const STELLAR_EXPERT_TX_URL = 'https://stellar.expert/explorer/testnet/tx';

// ── Horizon server ────────────────────────────────────────────────────────────

export function getHorizonServer(): Horizon.Server {
  return new Horizon.Server(STELLAR_HORIZON_URL);
}

// ── Validation helpers ────────────────────────────────────────────────────────

export function isValidStellarPublicKey(value: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(value);
  } catch {
    return false;
  }
}

/** Returns true if value is a positive decimal with at most 7 decimal places. */
export function isValidAmount(value: string): boolean {
  if (!value || value.trim() === '') return false;
  // Reject scientific notation and non-numeric
  if (!/^\d+(\.\d+)?$/.test(value.trim())) return false;
  const n = parseFloat(value);
  if (isNaN(n) || n <= 0) return false;
  // Stellar supports max 7 decimal places
  const decimals = value.split('.')[1];
  if (decimals && decimals.length > 7) return false;
  return true;
}

// ── Display helpers ───────────────────────────────────────────────────────────

export function truncateKey(key: string, chars = 6): string {
  if (key.length <= chars * 2 + 3) return key;
  return `${key.slice(0, chars)}...${key.slice(-chars)}`;
}

export function formatXLM(balance: string): string {
  const n = parseFloat(balance);
  if (isNaN(n)) return balance;
  // Cap at 2 decimals for large balances to prevent display overflow
  const maxDecimals = n >= 1_000 ? 2 : 7;
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: maxDecimals });
}

// ── Horizon balance fetch ─────────────────────────────────────────────────────

export async function fetchXLMBalance(publicKey: string): Promise<string> {
  const server = getHorizonServer();
  const account = await server.loadAccount(publicKey);
  const native = account.balances.find((b) => b.asset_type === 'native');
  if (!native) throw new Error('No native XLM balance on this account.');
  return native.balance;
}

// ── Transaction building & submission ─────────────────────────────────────────

export interface SendXLMParams {
  sourcePublicKey: string;
  destination: string;
  amount: string;
  memo?: string;
}

/** Loads source account from Horizon and builds an unsigned payment XDR. */
export async function buildPaymentXDR(params: SendXLMParams): Promise<string> {
  const { sourcePublicKey, destination, amount, memo } = params;
  const server = getHorizonServer();
  const sourceAccount = await server.loadAccount(sourcePublicKey);

  const builder = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount,
      }),
    )
    .setTimeout(180);

  if (memo && memo.trim()) {
    builder.addMemo(Memo.text(memo.trim()));
  }

  return builder.build().toXDR();
}

/** Deserializes a signed XDR and submits it to Horizon Testnet. Returns the tx hash. */
export async function submitSignedXDR(signedXdr: string): Promise<string> {
  const server = getHorizonServer();
  const tx = TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK_PASSPHRASE);
  const response = await server.submitTransaction(tx);
  return response.hash;
}
