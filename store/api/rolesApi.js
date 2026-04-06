import { apiSlice } from './apiSlice'
import { createClient } from '@/lib/supabase/client'

export const rolesApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    // Get all roles with their permissions
    getRoles: builder.query({
      queryFn: async () => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('roles')
          .select(`
            *,
            role_permissions(
              id,
              permissions(id, key, label, description, module)
            )
          `)
          .order('created_at', { ascending: true })
        if (error) return { error }
        return { data }
      },
      providesTags: ['Roles'],
    }),

    getPermissions: builder.query({
      queryFn: async () => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('permissions')
          .select('*')
          .order('module', { ascending: true })
        if (error) return { error }
        return { data }
      },
      providesTags: ['Permissions'],
    }),

    updateRolePermissions: builder.mutation({
      queryFn: async ({ role_id, permission_ids }) => {
        const supabase = createClient()
        const { error: deleteError } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', role_id)

        if (deleteError) return { error: deleteError }
        if (permission_ids.length > 0) {
          const inserts = permission_ids.map(permission_id => ({
            role_id,
            permission_id,
          }))

          const { error: insertError } = await supabase
            .from('role_permissions')
            .insert(inserts)

          if (insertError) return { error: insertError }
        }

        return { data: { role_id, permission_ids } }
      },
      invalidatesTags: ['Roles'],
    }),

  }),
})

export const {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useUpdateRolePermissionsMutation,
} = rolesApi