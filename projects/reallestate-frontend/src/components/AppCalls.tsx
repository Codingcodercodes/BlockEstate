import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import React from 'react'
import { RealestateClient } from '../artifacts/RealestateClient'
import { OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import {
  getAlgodConfigFromViteEnvironment,
  getIndexerConfigFromViteEnvironment,
} from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [loading, setLoading] = useState(false)
  const [contractInput, setContractInput] = useState('')
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()

  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })

  algorand.setDefaultSigner(transactionSigner)

  const sendAppCall = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!contractInput.trim()) {
      enqueueSnackbar('Please provide a name for the hello function.', { variant: 'warning' })
      return
    }

    setLoading(true)

    try {
      const factory = new RealestateClient({
        defaultSender: activeAddress ?? undefined,
        algorand,
      })

      const deployResult = await factory.deploy({
        onSchemaBreak: OnSchemaBreak.AppendApp,
        onUpdate: OnUpdate.AppendApp,
      })

      const { appClient } = deployResult

      const response = await appClient.send.hello({ args: { name: contractInput } })

      enqueueSnackbar(`Response from the contract: ${response.return}`, { variant: 'success' })
    } catch (e: any) {
      enqueueSnackbar(`Error: ${e.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    if (!loading) {
      setModalState(false)
      setContractInput('')
    }
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box" onSubmit={(e) => e.preventDefault()}>
        <h3 className="font-bold text-lg">Say hello to your Algorand smart contract</h3>

        <div className="my-4">
          <input
            type="text"
            placeholder="Provide input to hello function"
            className="input input-bordered w-full"
            value={contractInput}
            onChange={(e) => setContractInput(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-outline" onClick={closeModal} disabled={loading}>
            Close
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            onClick={sendAppCall}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Send application call'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AppCalls
