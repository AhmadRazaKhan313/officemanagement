import { apiSlice } from './apiSlice'
import { createClient } from '@/lib/supabase/client'

export const leaveApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    getLeaveRequests: builder.query({
      queryFn: async (company_id) => {
        const supabase = createClient()
        let query = supabase
          .from('leave_requests')
          .select('*, employees(full_name, email)')
          .order('created_at', { ascending: false })
        if (company_id) query = query.eq('company_id', company_id)
        const { data, error } = await query
        if (error) return { error }
        return { data }
      },
      providesTags: ['LeaveRequests'],
    }),

    addLeaveRequest: builder.mutation({
      queryFn: async (leave) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('leave_requests')
          .insert([leave])
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['LeaveRequests'],
    }),

    updateLeaveStatus: builder.mutation({
      queryFn: async ({ id, status, reviewed_by }) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('leave_requests')
          .update({ status, reviewed_by, reviewed_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['LeaveRequests'],
    }),

  }),
})

export const {
  useGetLeaveRequestsQuery,
  useAddLeaveRequestMutation,
  useUpdateLeaveStatusMutation,
} = leaveApi