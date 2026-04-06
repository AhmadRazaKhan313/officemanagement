import { useSelector } from 'react-redux'

export function usePermission(permissionKey) {
  const { profile } = useSelector((state) => state.auth)

  // Super admin ko sab permissions hain
  if (profile?.role === 'super_admin') return true

  // Baaki check baad mein implement hongi
  return false
}

export function useRole() {
  const { profile } = useSelector((state) => state.auth)
  return profile?.role || 'employee'
}

export function useIsSuperAdmin() {
  const { profile } = useSelector((state) => state.auth)
  return profile?.role === 'super_admin'
}

export function useIsOrgAdmin() {
  const { profile } = useSelector((state) => state.auth)
  return profile?.role === 'org_admin'
}

export function useIsEmployee() {
  const { profile } = useSelector((state) => state.auth)
  return profile?.role === 'employee'
}