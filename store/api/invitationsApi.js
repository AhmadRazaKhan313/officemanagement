import { apiSlice } from './apiSlice'
import { createClient } from '@/lib/supabase/client'

export const invitationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getInvitations: builder.query({
      queryFn: async (company_id) => {
        const supabase = createClient()
        let query = supabase
          .from('invitations')
          .select('*, companies(name), departments(name)')
          .order('created_at', { ascending: false })

        if (company_id) query = query.eq('company_id', company_id)

        const { data, error } = await query
        if (error) return { error }
        return { data }
      },
      providesTags: ['Invitations'],
    }),

    sendInvitation: builder.mutation({
      queryFn: async (invitation) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('invitations')
          .insert([invitation])
          .select('*, companies(name), departments(name)')
          .single()
        if (error) return { error }
        await fetch('/api/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            company_name: data.companies?.name,
            department_name: data.departments?.name,
            role: data.role,
            token: data.token,
          }),
        })

        return { data }
      },
      invalidatesTags: ['Invitations'],
    }),

    deleteInvitation: builder.mutation({
      queryFn: async (id) => {
        const supabase = createClient()
        const { error } = await supabase
          .from('invitations')
          .delete()
          .eq('id', id)
        if (error) return { error }
        return { data: id }
      },
      invalidatesTags: ['Invitations'],
    }),

  }),
})

export const {
  useGetInvitationsQuery,
  useSendInvitationMutation,
  useDeleteInvitationMutation,
} = invitationsApi