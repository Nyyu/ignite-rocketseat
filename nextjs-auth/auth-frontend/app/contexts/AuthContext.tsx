"use client"

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react"
import { useRouter } from "next/navigation"

import { parseCookies } from "nookies"

import { api, destroyAuthCookies, updateAuthCookies } from "../services/api"

export interface AuthContextProps {
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => void
  isAuthenticated: boolean
  user: Partial<User>
}
export interface AuthProviderProps {
  children: ReactNode
}

type SignInCredentials = {
  email: string
  password: string
}
export type User = {
  email: string
  permissions: string[]
  roles: string[]
}

let authBroadcast: BroadcastChannel

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter()

  const [user, setUser] = useState<Partial<User>>({})
  const isAuthenticated = !!user?.email

  useEffect(() => {
    authBroadcast = new BroadcastChannel("auth")

    authBroadcast.onmessage = (event) => {
      const { data } = event

      switch (data) {
        case "sign-out":
          handleSignOut({
            callBroadcast: false,
          })
          break

        default:
          break
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const { "next-auth.token": token } = parseCookies()

    if (!!token) {
      const handleGetSession = async () => {
        try {
          const response = await api.get("/me")

          const { email, permissions, roles } = response.data
          setUser({ email, permissions, roles })
        } catch (error) {
          console.error(error)

          // as the axios intercepts the error related to expired token, within block we just need to concern ourselves with the other ones
          handleSignOut()
        }
      }
      handleGetSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignIn = async (credentials: SignInCredentials) => {
    try {
      const response = await api.post("/sessions", credentials)

      const { permissions, roles, token, refreshToken } = response?.data

      // update cookies && auth header
      updateAuthCookies(
        {
          authToken: token,
          authRefreshToken: refreshToken,
        },
        undefined,
        api
      )

      setUser({
        email: credentials.email,
        permissions,
        roles,
      })

      authBroadcast && authBroadcast.postMessage("sign-in")

      router.push("/profile")
    } catch (error) {
      console.error(error)
    }
  }
  const handleSignOut = (options?: { callBroadcast?: boolean }) => {
    const { callBroadcast = true } = options

    destroyAuthCookies(undefined, api)
    setUser({})

    callBroadcast && authBroadcast && authBroadcast.postMessage("sign-out")

    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        signIn: handleSignIn,
        signOut: handleSignOut,
        isAuthenticated,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
