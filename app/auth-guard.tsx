'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const publicRoutes = ['/signin']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const isPublicRoute = publicRoutes.includes(pathname)

    if (isPublicRoute) {
      setAuthorized(true)
      return
    }

    const storedAuth = window.localStorage.getItem('cookbook-auth')
    if (storedAuth) {
      setAuthorized(true)
      return
    }

    router.replace('/signin')
  }, [pathname, router])

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
