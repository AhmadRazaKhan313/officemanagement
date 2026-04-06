'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { createClient } from '@/lib/supabase/client'
import { setUser } from '@/store/slices/authSlice'
import DashboardTemplate from '@/components/templates/DashboardTemplate'

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, companies(name, status)')
          .eq('id', user.id)
          .single()

        dispatch(setUser({
          user: { id: user.id, email: user.email },
          profile: { ...profile, id: user.id }
        }))
      }
    }

    loadUser()
  }, [])

  return <DashboardTemplate>{children}</DashboardTemplate>
}