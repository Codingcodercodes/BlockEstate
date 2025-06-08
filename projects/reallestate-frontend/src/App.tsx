import './styles/App.css'
import React, { useMemo, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import {
  WalletManager,
  WalletProvider,
  WalletId,
  SupportedWallet,
} from '@txnlab/use-wallet-react'

// Pages and Components
import Home from './Home'

// Dynamically import pages to optimize load time
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const DigiLockerCallback = React.lazy(() => import('./pages/DigiLockerCallBack'))
const PropertyList = React.lazy(() => import('./components/propertylist'))
const PropertyDetail = React.lazy(() => import('./components/propertydetail'))

// Utils for Algorand configuration
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

const useWalletManager = () => {
  const [walletManager, setWalletManager] = useState<WalletManager | null>(null)

  useEffect(() => {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const supportedWallets = getSupportedWallets(algodConfig)

    const manager = new WalletManager({
      wallets: supportedWallets,
      defaultNetwork: algodConfig.network,
      networks: {
        [algodConfig.network]: {
          algod: {
            baseServer: algodConfig.server,
            port: String(algodConfig.port),
            token: String(algodConfig.token),
          },
        },
      },
      options: {
        resetNetwork: true,
      },
    })

    setWalletManager(manager)
  }, [])

  return walletManager
}

const getSupportedWallets = (algodConfig: ReturnType<typeof getAlgodConfigFromViteEnvironment>): SupportedWallet[] => {
  const isLocal = algodConfig.network === 'localnet'

  if (isLocal) {
    const kmdConfig = getKmdConfigFromViteEnvironment()
    return [
      {
        id: WalletId.KMD,
        options: {
          baseServer: kmdConfig.server,
          token: String(kmdConfig.token),
          port: String(kmdConfig.port),
        },
      },
    ]
  }

  // For other networks, return the predefined supported wallets
  return [
    { id: WalletId.EXODUS },
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
  ]
}

const App: React.FC = () => {
  const walletManager = useWalletManager()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (walletManager) {
      setLoading(false)
    }
  }, [walletManager])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <WalletProvider manager={walletManager}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/digilocker/callback" element={<DigiLockerCallback />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
          </Routes>
        </Router>
      </WalletProvider>
    </SnackbarProvider>
  )
}

export default App
