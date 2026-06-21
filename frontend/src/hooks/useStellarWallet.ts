import { useState, useCallback, useEffect } from 'react';
import {
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess,
  getAddress as freighterGetAddress,
  getNetworkDetails as freighterGetNetworkDetails,
  signTransaction as freighterSignTransaction,
  isBrowser,
} from '@stellar/freighter-api';
import {
  fetchXLMBalance,
  buildPaymentXDR,
  submitSignedXDR,
  isValidStellarPublicKey,
  isValidAmount,
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_NETWORK_NAME,
} from '../lib/stellar';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

export interface WalletState {
  publicKey: string | null;
  walletConnected: boolean;
  balance: string | null;
  isConnecting: boolean;
  isLoadingBalance: boolean;
  isSending: boolean;
  error: string | null;
  txHash: string | null;
  txStatus: TxStatus;
}

export interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  sendXLM: (params: { destination: string; amount: string; memo?: string }) => Promise<void>;
  clearTx: () => void;
}

const STORAGE_KEY = 'ayuda_direct_wallet_pk';

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const obj = err as Record<string, unknown>;
    if (typeof obj['message'] === 'string') return obj['message'];
    if (typeof obj['error'] === 'string') return obj['error'];
  }
  return 'Unknown error.';
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useStellarWallet(): WalletState & WalletActions {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');

  // ── Internal: load balance for a given key ──────────────────────────────

  const loadBalance = useCallback(async (key: string) => {
    setIsLoadingBalance(true);
    setError(null);
    try {
      const bal = await fetchXLMBalance(key);
      setBalance(bal);
    } catch (err) {
      const msg = extractMessage(err);
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setBalance(null);
        setError(
          'Account not found on Testnet. Fund it at https://friendbot.stellar.org then refresh.',
        );
      } else {
        setError(`Balance error: ${msg}`);
      }
    } finally {
      setIsLoadingBalance(false);
    }
  }, []);

  // ── Restore session on mount ────────────────────────────────────────────

  useEffect(() => {
    if (!isBrowser) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    (async () => {
      try {
        const { isConnected } = await freighterIsConnected();
        if (!isConnected) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        const addrResult = await freighterGetAddress();
        if (addrResult.error || !addrResult.address) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        // Only restore if the active wallet matches the stored key
        if (addrResult.address === stored) {
          setPublicKey(addrResult.address);
          loadBalance(addrResult.address);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    })();
  }, [loadBalance]);

  // ── Connect ─────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    if (!isBrowser) {
      setError('Freighter is only available in the browser.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // 1. Check Freighter is installed
      const connResult = await freighterIsConnected();
      if (connResult.error) {
        setError(
          'Freighter extension not detected. Install it from freighter.app and switch to Testnet.',
        );
        return;
      }

      // 2. Request permission + get address in one call
      const accessResult = await freighterRequestAccess();
      if (accessResult.error) {
        setError(`Connection declined: ${extractMessage(accessResult.error)}`);
        return;
      }
      if (!accessResult.address) {
        setError('No address returned. Make sure Freighter is unlocked.');
        return;
      }

      // 3. Verify the wallet is on Testnet
      const netResult = await freighterGetNetworkDetails();
      if (netResult.error) {
        setError(`Could not read Freighter network: ${extractMessage(netResult.error)}`);
        return;
      }
      if (!netResult.network.toUpperCase().includes(STELLAR_NETWORK_NAME)) {
        setError(
          `Freighter is on "${netResult.network}". Please switch it to Testnet and reconnect.`,
        );
        return;
      }

      setPublicKey(accessResult.address);
      localStorage.setItem(STORAGE_KEY, accessResult.address);
      await loadBalance(accessResult.address);
    } catch (err) {
      setError(`Connection failed: ${extractMessage(err)}`);
    } finally {
      setIsConnecting(false);
    }
  }, [loadBalance]);

  // ── Disconnect ───────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setBalance(null);
    setError(null);
    setTxHash(null);
    setTxStatus('idle');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ── Refresh balance ──────────────────────────────────────────────────────

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    await loadBalance(publicKey);
  }, [publicKey, loadBalance]);

  // ── Send XLM ─────────────────────────────────────────────────────────────

  const sendXLM = useCallback(
    async ({
      destination,
      amount,
      memo,
    }: {
      destination: string;
      amount: string;
      memo?: string;
    }) => {
      if (!publicKey) {
        setError('Wallet not connected.');
        return;
      }
      if (!isValidStellarPublicKey(destination)) {
        setError('Invalid destination address. Must be a valid Stellar public key (G...).');
        return;
      }
      if (destination === publicKey) {
        setError('Cannot send XLM to your own address.');
        return;
      }
      if (!isValidAmount(amount)) {
        setError('Amount must be a positive number with at most 7 decimal places.');
        return;
      }

      setIsSending(true);
      setError(null);
      setTxHash(null);
      setTxStatus('pending');

      try {
        // Build unsigned XDR
        const xdr = await buildPaymentXDR({
          sourcePublicKey: publicKey,
          destination,
          amount,
          memo,
        });

        // Sign with Freighter
        const signResult = await freighterSignTransaction(xdr, {
          networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
          address: publicKey,
        });

        if (signResult.error) {
          setError(`Signing declined: ${extractMessage(signResult.error)}`);
          setTxStatus('error');
          return;
        }

        // Submit to Horizon Testnet
        const hash = await submitSignedXDR(signResult.signedTxXdr);
        setTxHash(hash);
        setTxStatus('success');

        // Refresh balance to reflect the deduction
        await loadBalance(publicKey);
      } catch (err) {
        setError(`Transaction failed: ${extractMessage(err)}`);
        setTxStatus('error');
      } finally {
        setIsSending(false);
      }
    },
    [publicKey, loadBalance],
  );

  // ── Clear tx state ───────────────────────────────────────────────────────

  const clearTx = useCallback(() => {
    setTxHash(null);
    setTxStatus('idle');
    setError(null);
  }, []);

  return {
    publicKey,
    walletConnected: publicKey !== null,
    balance,
    isConnecting,
    isLoadingBalance,
    isSending,
    error,
    txHash,
    txStatus,
    connect,
    disconnect,
    refreshBalance,
    sendXLM,
    clearTx,
  };
}
