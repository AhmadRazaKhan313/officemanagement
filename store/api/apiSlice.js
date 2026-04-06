import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'Companies',
    'Employees',
    'Departments',
    'Invitations',
    'Orders',
    'LeaveRequests',
    'Profile',
    'Roles',
    'Permissions',
    'Users',
    'UserRoles',
    'OrgPermissions',
    'UserPermissions',
  ],
  endpoints: () => ({}),
})