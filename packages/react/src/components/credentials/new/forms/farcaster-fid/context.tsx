import { createContext, useContext, useEffect, useState } from 'react'
import { useCredentials } from '../../../../../providers'
import { CredentialType, Vault } from '@anonworld/common'
import { FarcasterAuth } from '../components/siwf-field'

const LOCAL_STORAGE_KEY = 'farcaster-auth'

interface NewFarcasterFidContextValue {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  fid: number
  setFid: (fid: number) => void
  handleAddCredential: () => void
  isLoading: boolean
  error: string | undefined
  connectFarcaster: (profile: FarcasterAuth) => void
  disconnectFarcaster: () => void
  farcasterAuth: FarcasterAuth | undefined
  parentId?: string
}

const NewFarcasterFidContext = createContext<NewFarcasterFidContextValue | null>(null)

export function NewFarcasterFidProvider({
  children,
  isOpen,
  setIsOpen,
  parentId,
  vault,
}: {
  children: React.ReactNode
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  parentId?: string
  vault?: Vault
}) {
  const { add, addToVault } = useCredentials()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [fid, setFid] = useState<number>(0)

  const [farcasterAuth, setFarcasterAuth] = useState<FarcasterAuth>()

  useEffect(() => {
    const auth = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (auth) {
      setFarcasterAuth(JSON.parse(auth))
    }
  }, [])

  const connectFarcaster = async (auth: FarcasterAuth) => {
    setFarcasterAuth(auth)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(auth))
  }

  const disconnectFarcaster = async () => {
    setFarcasterAuth(undefined)
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  }

  const handleAddCredential = async () => {
    if (!fid || !farcasterAuth) return
    try {
      setIsLoading(true)
      if (!fid) {
        throw new Error('No fid connected')
      }

      const credential = await add(
        CredentialType.FARCASTER_FID,
        {
          verifiedFid: BigInt(fid),
          address: farcasterAuth.profile.custody,
          signature: farcasterAuth.signature,
          message: farcasterAuth.message,
        },
        parentId
      )

      if (vault) {
        await addToVault(vault, credential)
      }

      setIsLoading(false)
      setIsOpen(false)
    } catch (e) {
      setError((e as Error).message ?? 'Failed to add credential')
      setIsLoading(false)
    }
  }

  return (
    <NewFarcasterFidContext.Provider
      value={{
        isOpen,
        setIsOpen,
        fid,
        setFid,
        handleAddCredential,
        isLoading,
        error,
        connectFarcaster,
        disconnectFarcaster,
        farcasterAuth,
        parentId,
      }}
    >
      {children}
    </NewFarcasterFidContext.Provider>
  )
}

export function useNewFarcasterFid() {
  const context = useContext(NewFarcasterFidContext)
  if (!context) {
    throw new Error('useNewFarcasterFid must be used within a NewFarcasterFidProvider')
  }
  return context
}
