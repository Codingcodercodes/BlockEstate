import React, { useState } from 'react';
import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils';
import { useWallet } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs';

interface TransactInterface {
  openModal: boolean;
  setModalState: (value: boolean) => void;
}

const Transact: React.FC<TransactInterface> = ({ openModal, setModalState }) => {
  const [loading, setLoading] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('');

  const { enqueueSnackbar } = useSnackbar();
  const { transactionSigner, activeAddress } = useWallet();

  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = AlgorandClient.fromConfig({ algodConfig });

  const isValidAlgorandAddress = (address: string) =>
    /^[A-Z2-7]{58}$/.test(address);

  const handleSubmitAlgo = async () => {
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect your wallet first.', { variant: 'warning' });
      return;
    }

    if (!isValidAlgorandAddress(receiverAddress)) {
      enqueueSnackbar('Invalid receiver address.', { variant: 'error' });
      return;
    }

    const amountValue = Number(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      enqueueSnackbar('Please enter a valid ALGO amount.', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      enqueueSnackbar('Sending transaction...', { variant: 'info' });

      const result = await algorand.send.payment({
        sender: activeAddress,
        receiver: receiverAddress.trim(),
        amount: algo(amountValue),
        signer: transactionSigner,
      });

      enqueueSnackbar(`✅ Transaction sent: ${result.txIds[0]}`, { variant: 'success' });

      // Reset form on success
      setReceiverAddress('');
      setAmount('');
      setModalState(false);
    } catch (error: any) {
      enqueueSnackbar(`❌ Transaction failed: ${error.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      id="transact_modal"
      className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}
      style={{ display: openModal ? 'block' : 'none' }}
    >
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">💸 Send ALGO Transaction</h3>
        <br />
        <input
          type="text"
          data-test-id="receiver-address"
          placeholder="Recipient Wallet Address"
          className="input input-bordered w-full mb-3"
          value={receiverAddress}
          onChange={(e) => setReceiverAddress(e.target.value)}
          disabled={loading}
        />
        <input
          type="number"
          step="0.000001"
          data-test-id="algo-amount"
          placeholder="Amount in ALGO"
          className="input input-bordered w-full mb-3"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />

        <div className="modal-action flex flex-col gap-2">
          <button
            data-test-id="send-algo"
            className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
            onClick={handleSubmitAlgo}
            type="button"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner" /> : `Send ${amount || '...'} ALGO`}
          </button>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              if (!loading) setModalState(false);
            }}
          >
            Close
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default Transact;
