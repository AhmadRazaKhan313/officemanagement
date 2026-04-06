import { apiSlice } from './apiSlice'
import { createClient } from '@/lib/supabase/client'

export const usersApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    getUsers: builder.query({
      queryFn: async () => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('*, companies(name)')
          .order('created_at', { ascending: false })
        if (error) return { error }
        return { data }
      },
      providesTags: ['Users'],
    }),

    getUserRoles: builder.query({
      queryFn: async (user_id) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('user_roles')
          .select('*, roles(name, label), companies(name), departments(name)')
          .eq('user_id', user_id)
        if (error) return { error }
        return { data }
      },
      providesTags: ['UserRoles'],
    }),

    assignRole: builder.mutation({
      queryFn: async ({ user_id, role_id, organization_id, department_id, assigned_by }) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('user_roles')
          .upsert([{
            user_id,
            role_id,
            organization_id: organization_id || null,
            department_id: department_id || null,
            assigned_by,
          }])
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Users', 'UserRoles'],
    }),

    removeRole: builder.mutation({
      queryFn: async (id) => {
        const supabase = createClient()
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('id', id)
        if (error) return { error }
        return { data: id }
      },
      invalidatesTags: ['Users', 'UserRoles'],
    }),

    grantOrgPermission: builder.mutation({
      queryFn: async ({ organization_id, permission_id, granted_by }) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('org_permissions')
          .upsert([{ organization_id, permission_id, granted_by }])
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['OrgPermissions'],
    }),

    revokeOrgPermission: builder.mutation({
      queryFn: async (id) => {
        const supabase = createClient()
        const { error } = await supabase
          .from('org_permissions')
          .delete()
          .eq('id', id)
        if (error) return { error }
        return { data: id }
      },
      invalidatesTags: ['OrgPermissions'],
    }),

    grantUserPermission: builder.mutation({
      queryFn: async ({ user_id, permission_id, organization_id, granted_by }) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('user_permissions')
          .upsert([{ user_id, permission_id, organization_id: organization_id || null, granted_by }])
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['UserPermissions'],
    }),

    revokeUserPermission: builder.mutation({
      queryFn: async (id) => {
        const supabase = createClient()
        const { error } = await supabase
          .from('user_permissions')
          .delete()
          .eq('id', id)
        if (error) return { error }
        return { data: id }
      },
      invalidatesTags: ['UserPermissions'],
    }),

  }),
})

export const {
  useGetUsersQuery,
  useGetUserRolesQuery,
  useAssignRoleMutation,
  useRemoveRoleMutation,
  useGrantOrgPermissionMutation,
  useRevokeOrgPermissionMutation,
  useGrantUserPermissionMutation,
  useRevokeUserPermissionMutation,
} = usersApi