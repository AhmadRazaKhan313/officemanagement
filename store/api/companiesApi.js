import { apiSlice } from './apiSlice'
import { createClient } from '@/lib/supabase/client'

export const companiesApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
getCompanies: builder.query({
  queryFn: async () => {
 const supabase = createClient()
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return { error }
    return { data }
  },
  providesTags: ['Companies'],
}),


 addCompany: builder.mutation({
  queryFn: async (company) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('companies')
      .insert([{ ...company, status: 'pending' }])
      .select()
      .single()
    if (error) return { error }

    // Auto invite owner
    if (data && company.owner_email) {
      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .insert([{
          company_id: data.id,
          email: company.owner_email,
          role: 'org_admin',
          status: 'pending',
        }])
        .select()
        .single()

      if (!invError && invitation) {
        await fetch('/api/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: company.owner_email,
            name: company.owner_name,
            company_name: company.name,
            role: 'Organization Admin',
            token: invitation.token,
          }),
        })
      }
    }

    return { data }
  },
  invalidatesTags: ['Companies'],
}),

    updateCompany: builder.mutation({
      queryFn: async ({ id, ...updates }) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('companies')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Companies'],
    }),

    approveCompany: builder.mutation({
      queryFn: async ({ id, approved_by }) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('companies')
          .update({
            status: 'active',
            approved_by,
            approved_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Companies'],
    }),

    rejectCompany: builder.mutation({
      queryFn: async (id) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('companies')
          .update({ status: 'rejected' })
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Companies'],
    }),

    deleteCompany: builder.mutation({
      queryFn: async (id) => {
        const supabase = createClient()
        const { error } = await supabase
          .from('companies')
          .delete()
          .eq('id', id)
        if (error) return { error }
        return { data: id }
      },
      invalidatesTags: ['Companies'],
    }),

  inviteOwner: builder.mutation({
  queryFn: async ({ company_id, company_name, owner_name, owner_email }) => {
    const supabase = createClient()

    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert([{
        company_id,
        email: owner_email,
        role: 'org_admin',
        status: 'pending',
      }])
      .select()
      .single()

    if (error) return { error }

    const res = await fetch('/api/send-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: owner_email,
        name: owner_name,
        company_name,
        role: 'Organization Admin',
        token: invitation.token,
      }),
    })

    if (!res.ok) return { error: { message: 'Failed to send invite email' } }

    return { data: invitation }
  },
  invalidatesTags: ['Companies'],
}),

  }),
})

export const {
  useGetCompaniesQuery,
  useAddCompanyMutation,
  useUpdateCompanyMutation,
  useApproveCompanyMutation,
  useRejectCompanyMutation,
  useDeleteCompanyMutation,
  useInviteOwnerMutation,
} = companiesApi