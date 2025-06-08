import React, { useCallback, useEffect, useState } from 'react'
import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'

interface ConnectWalletProps {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ openModal, closeModal }) => {
  const { wallets, activeAddress, setWalletNetwork } = useWallet()
  const [connectingWalletId, setConnectingWalletId] = useState<WalletId | null>(null)

  const isKmd = useCallback((wallet: Wallet) => wallet.id === WalletId.KMD, [])

  const handleConnectWallet = useCallback(
    async (wallet: Wallet) => {
      setConnectingWalletId(wallet.id)
      try {
        await wallet.connect()
        await setWalletNetwork('Testnet')
        closeModal()
      } catch (error) {
        console.error(`❌ Failed to connect to ${wallet.metadata.name}:`, error)
        alert(`❌ Failed to connect to ${wallet.metadata.name}. Ensure the extension/app is installed and unlocked.`)
      } finally {
        setConnectingWalletId(null)
      }
    },
    [closeModal, setWalletNetwork]
  )

  const handleDisconnectWallet = useCallback(async () => {
    const activeWallet = wallets.find((wallet) => wallet.isActive)
    if (activeWallet) {
      await activeWallet.disconnect()
    } else {
      localStorage.removeItem('@txnlab/use-wallet:v3')
      window.location.reload()
    }
  }, [wallets])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openModal) {
        closeModal()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [openModal, closeModal])

  return (
    <dialog
      id="connect_wallet_modal"
      className={`modal ${openModal ? 'modal-open' : ''}`}
      open={openModal}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      onCancel={closeModal}
    >
      <form method="dialog" className="modal-box" onSubmit={(e) => e.preventDefault()}>
        <h3 id="modal-title" className="font-bold text-2xl mb-4">
          Connect to a Wallet
        </h3>

        <div className="grid gap-3">
          {activeAddress ? (
            <>
              <Account />
              <div className="divider" />
            </>
          ) : wallets?.length > 0 ? (
            wallets.map((wallet) => (
              <button
                key={`wallet-${wallet.id}`}
                className="btn border border-teal-700 text-left flex items-center gap-3 p-3"
                type="button"
                disabled={!!connectingWalletId}
                onClick={() => handleConnectWallet(wallet)}
                aria-disabled={!!connectingWalletId}
              >
                {wallet.metadata.icon && !isKmd(wallet) ? (
                  <img
                    src={wallet.metadata.icon}
                    alt={`${wallet.metadata.name} icon`}
                    width={30}
                    height={30}
                    className="rounded"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-[30px] h-[30px] bg-gray-300 rounded" />
                )}
                <span>{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
              </button>
            ))
          ) : (
            <p className="text-red-500" role="alert">
              ⚠️ No wallets found. Please install a supported wallet like Pera, Defly, or Exodus.
            </p>
          )}
        </div>

        <div className="modal-action mt-6 grid grid-cols-2 gap-3">
          <button className="btn btn-outline" type="button" onClick={closeModal}>
            Close
          </button>
          {activeAddress && (
            <button className="btn btn-warning" type="button" onClick={handleDisconnectWallet}>
              Disconnect
            </button>
          )}
        </div>
      </form>
    </dialog>
  )
}

export default ConnectWallet
