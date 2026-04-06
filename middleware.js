import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Not logged in - Login pe bhejo
  if (!user) {
    const protectedRoutes = [
      '/Dashboard', '/Companies', '/Users', '/Employees',
      '/Departments', '/Settings', '/OrgDashboard',
      '/OrgEmployees', '/OrgDepartments', '/OrgUsers', '/OrgSettings', '/Portal'
    ]
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/Login', request.url))
    }
    return supabaseResponse
  }

  // Logged in - role check karo
  if (pathname === '/Login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const role = profile?.role

    if (role === 'super_admin') {
      return NextResponse.redirect(new URL('/Dashboard', request.url))
    } else if (role === 'org_admin' || role === 'dept_manager') {
      return NextResponse.redirect(new URL('/OrgDashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/Portal', request.url))
    }
  }

  // Super Admin sirf /Dashboard access kar sake
  if (pathname.startsWith('/OrgDashboard') || pathname.startsWith('/OrgEmployees') ||
      pathname.startsWith('/OrgDepartments') || pathname.startsWith('/OrgUsers') ||
      pathname.startsWith('/OrgSettings')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'super_admin') {
      return NextResponse.redirect(new URL('/Dashboard', request.url))
    }
    if (profile?.role === 'employee') {
      return NextResponse.redirect(new URL('/Portal', request.url))
    }
  }

  // Org Admin sirf /OrgDashboard access kar sake
  if (pathname.startsWith('/Dashboard') || pathname.startsWith('/Companies') ||
      pathname.startsWith('/Users') || pathname.startsWith('/Settings')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'org_admin' || profile?.role === 'dept_manager') {
      return NextResponse.redirect(new URL('/OrgDashboard', request.url))
    }
    if (profile?.role === 'employee') {
      return NextResponse.redirect(new URL('/Portal', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/Dashboard/:path*', '/Companies/:path*', '/Users/:path*',
    '/Employees/:path*', '/Departments/:path*', '/Settings/:path*',
    '/OrgDashboard/:path*', '/OrgEmployees/:path*', '/OrgDepartments/:path*',
    '/OrgUsers/:path*', '/OrgSettings/:path*',
    '/Portal/:path*', '/Login',
  ],
}