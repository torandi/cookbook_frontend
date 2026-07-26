'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { validateAuth } from './backend/auth'

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

    validateAuth().then((valid) => {
      if (valid) {
        setAuthorized(true)
        return
      }

      const nextPath = typeof window === 'undefined'
        ? pathname
        : `${window.location.pathname}${window.location.search}`
      router.replace(`/signin?next=${encodeURIComponent(nextPath)}`)
    })

  }, [pathname, router])

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
