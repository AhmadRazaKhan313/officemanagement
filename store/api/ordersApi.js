import { apiSlice } from './apiSlice'
import { createClient } from '@/lib/supabase/client'

export const ordersApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    getOrders: builder.query({
      queryFn: async (company_id) => {
        const supabase = createClient()
        let query = supabase
          .from('orders')
          .select('*, employees(full_name), departments(name)')
          .order('created_at', { ascending: false })
        if (company_id) query = query.eq('company_id', company_id)
        const { data, error } = await query
        if (error) return { error }
        return { data }
      },
      providesTags: ['Orders'],
    }),

    addOrder: builder.mutation({
      queryFn: async (order) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('orders')
          .insert([order])
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Orders'],
    }),

    updateOrder: builder.mutation({
      queryFn: async ({ id, ...updates }) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('orders')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Orders'],
    }),

    deleteOrder: builder.mutation({
      queryFn: async (id) => {
        const supabase = createClient()
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', id)
        if (error) return { error }
        return { data: id }
      },
      invalidatesTags: ['Orders'],
    }),

  }),
})

export const {
  useGetOrdersQuery,
  useAddOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi