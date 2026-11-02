import { createContext, useContext } from 'react'

export const AdminAuthContext = createContext({
  status: 'loading',
  admin: null,
  login: async () => {},
  logout: async () => {},
})

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
