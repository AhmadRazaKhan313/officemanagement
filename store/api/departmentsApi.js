import { apiSlice } from './apiSlice'
import { createClient } from '@/lib/supabase/client'

export const departmentsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

   getDepartments: builder.query({
  queryFn: async (company_id) => {
    const supabase = createClient()
    let query = supabase
      .from('departments')
      .select('*, companies(name)')
      .order('created_at', { ascending: false })
    if (company_id) query = query.eq('company_id', company_id)
    const { data, error } = await query
    if (error) return { error }
    return { data }
  },
  providesTags: ['Departments'],
}),
    addDepartment: builder.mutation({
      queryFn: async (department) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('departments')
          .insert([department])
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Departments'],
    }),

    updateDepartment: builder.mutation({
      queryFn: async ({ id, ...updates }) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('departments')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Departments'],
    }),

    deleteDepartment: builder.mutation({
      queryFn: async (id) => {
        const supabase = createClient()
        const { error } = await supabase
          .from('departments')
          .delete()
          .eq('id', id)
        if (error) return { error }
        return { data: id }
      },
      invalidatesTags: ['Departments'],
    }),

  }),
})

export const {
  useGetDepartmentsQuery,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentsApi