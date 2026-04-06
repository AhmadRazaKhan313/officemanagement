import { apiSlice } from './apiSlice'
import { createClient } from '@/lib/supabase/client'

export const employeesApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    getEmployees: builder.query({
      queryFn: async () => {
        const supabase = createClient()

        const { data: employees, error } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) return { error }
        if (!employees) return { data: [] }

        const { data: companies } = await supabase
          .from('companies')
          .select('id, name')

        const { data: departments } = await supabase
          .from('departments')
          .select('id, name')

        const data = employees.map(emp => ({
          ...emp,
          companies: companies?.find(c => c.id === emp.company_id) || null,
          departments: departments?.find(d => d.id === emp.department_id) || null,
        }))

        return { data }
      },
      providesTags: ['Employees'],
    }),

    addEmployee: builder.mutation({
      queryFn: async (employee) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('employees')
          .insert([employee])
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Employees'],
    }),

    updateEmployee: builder.mutation({
      queryFn: async ({ id, ...updates }) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('employees')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Employees'],
    }),

    deleteEmployee: builder.mutation({
      queryFn: async (id) => {
        const supabase = createClient()
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', id)
        if (error) return { error }
        return { data: id }
      },
      invalidatesTags: ['Employees'],
    }),
inviteEmployee: builder.mutation({
  queryFn: async ({ employee_id, email, name, company_id, company_name, department_name }) => {
    const supabase = createClient()

    // Invitation create karo
    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert([{
        company_id,
        email,
        role: 'employee',
        status: 'pending',
      }])
      .select()
      .single()

    if (error) return { error }

    // Email bhejo
    const res = await fetch('/api/send-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        company_name,
        role: 'Employee',
        token: invitation.token,
      }),
    })

    if (!res.ok) return { error: { message: 'Failed to send invite email' } }

    return { data: invitation }
  },
  invalidatesTags: ['Employees'],
}),
    promoteToManager: builder.mutation({
      queryFn: async ({ employee_id, department_id }) => {
        const supabase = createClient()

        const { data: employee } = await supabase
          .from('employees')
          .select('profile_id')
          .eq('id', employee_id)
          .single()

        if (employee?.profile_id) {
          await supabase
            .from('profiles')
            .update({ role: 'manager' })
            .eq('id', employee.profile_id)
        }

        const { data, error } = await supabase
          .from('departments')
          .update({ manager_id: employee_id })
          .eq('id', department_id)
          .select()
          .single()

        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Employees', 'Departments'],
    }),

  }),
})

export const {
  useGetEmployeesQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  usePromoteToManagerMutation,
  useInviteEmployeeMutation,
} = employeesApi