import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import React from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface TransactInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const Transact = ({ openModal, setModalState }: TransactInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [receiverAddress, setReceiverAddress] = useState<string>('')
  const [amount, setAmount] = useState<string>('') // ALGO amount input

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const handleSubmitAlgo = async () => {
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      setLoading(false)
      return
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      enqueueSnackbar('Enter a valid ALGO amount', { variant: 'error' })
      setLoading(false)
      return
    }

    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })

      const result = await algorand.send.payment({
        sender: activeAddress,
        receiver: receiverAddress,
        amount: algo(Number(amount)), // Use entered amount
        signer: transactionSigner,
      })

      enqueueSnackbar(`Transaction sent: ${result.txIds[0]}`, { variant: 'success' })
      setReceiverAddress('')
      setAmount('')
    } catch (e: any) {
      enqueueSnackbar(`Failed to send transaction: ${e.message}`, { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <dialog
      id="transact_modal"
      className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}
      style={{ display: openModal ? 'block' : 'none' }}
    >
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Send payment transaction</h3>
        <br />
        <input
          type="text"
          data-test-id="receiver-address"
          placeholder="Provide wallet address"
          className="input input-bordered w-full mb-3"
          value={receiverAddress}
          onChange={(e) => setReceiverAddress(e.target.value)}
        />
        <input
          type="number"
          step="0.000001"
          data-test-id="algo-amount"
          placeholder="Amount in ALGO"
          className="input input-bordered w-full"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="modal-action grid">
          
          <button
            data-test-id="send-algo"
            className={`btn ${receiverAddress.length === 58 && Number(amount) > 0 ? '' : 'btn-disabled'}`}
            onClick={handleSubmitAlgo}
            type="button"
          >
            {loading ? <span className="loading loading-spinner" /> : `Send ${amount || '...'} Algo`}
          </button>
          <button className="btn" onClick={() => setModalState(false)}>
            Close
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default Transact
