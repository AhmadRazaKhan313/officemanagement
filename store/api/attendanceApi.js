import { apiSlice } from './apiSlice'
import { createClient } from '@/lib/supabase/client'

export const attendanceApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    getTodayAttendance: builder.query({
      queryFn: async (employee_id) => {
        const supabase = createClient()
        const today = new Date().toISOString().split('T')[0]
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employee_id)
          .eq('date', today)
          .maybeSingle()
        if (error) return { error }
        return { data }
      },
      providesTags: ['Attendance'],
    }),

    getAttendanceHistory: builder.query({
      queryFn: async ({ employee_id, limit = 30 }) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employee_id)
          .order('date', { ascending: false })
          .limit(limit)
        if (error) return { error }
        return { data }
      },
      providesTags: ['Attendance'],
    }),

    checkIn: builder.mutation({
      queryFn: async ({ employee_id, company_id }) => {
        const supabase = createClient()
        const today = new Date().toISOString().split('T')[0]
        const now = new Date().toISOString()

        const { data, error } = await supabase
          .from('attendance')
          .upsert([{
            employee_id,
            company_id,
            date: today,
            check_in: now,
            status: 'present',
          }], { onConflict: 'employee_id,date' })
          .select()
          .single()

        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Attendance'],
    }),

    checkOut: builder.mutation({
      queryFn: async ({ attendance_id, check_in, break_minutes = 0 }) => {
        const supabase = createClient()
        const now = new Date()
        const checkInTime = new Date(check_in)
        const totalMinutes = (now - checkInTime) / 1000 / 60
        const workMinutes = totalMinutes - break_minutes
        const totalHours = Math.max(0, workMinutes / 60).toFixed(2)

        const { data, error } = await supabase
          .from('attendance')
          .update({
            check_out: now.toISOString(),
            total_hours: parseFloat(totalHours),
            break_minutes,
          })
          .eq('id', attendance_id)
          .select()
          .single()

        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Attendance'],
    }),

    startBreak: builder.mutation({
      queryFn: async (attendance_id) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('attendance')
          .update({ break_start: new Date().toISOString() })
          .eq('id', attendance_id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Attendance'],
    }),

    endBreak: builder.mutation({
      queryFn: async ({ attendance_id, break_start }) => {
        const supabase = createClient()
        const now = new Date()
        const breakStartTime = new Date(break_start)
        const breakMins = Math.round((now - breakStartTime) / 1000 / 60)

        const { data: current } = await supabase
          .from('attendance')
          .select('break_minutes')
          .eq('id', attendance_id)
          .single()

        const totalBreak = (current?.break_minutes || 0) + breakMins

        const { data, error } = await supabase
          .from('attendance')
          .update({
            break_end: now.toISOString(),
            break_minutes: totalBreak,
            break_start: null,
          })
          .eq('id', attendance_id)
          .select()
          .single()

        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Attendance'],
    }),

    getCompanyAttendance: builder.query({
      queryFn: async ({ company_id, date }) => {
        const supabase = createClient()
        const today = date || new Date().toISOString().split('T')[0]
        const { data, error } = await supabase
          .from('attendance')
          .select('*, employees(full_name, email, departments(name))')
          .eq('company_id', company_id)
          .eq('date', today)
          .order('check_in', { ascending: true })
        if (error) return { error }
        return { data }
      },
      providesTags: ['Attendance'],
    }),

  }),
})

export const {
  useGetTodayAttendanceQuery,
  useGetAttendanceHistoryQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useStartBreakMutation,
  useEndBreakMutation,
  useGetCompanyAttendanceQuery,
} = attendanceApi