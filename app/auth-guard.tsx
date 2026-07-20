'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { validateAuth } from './backend/auth'
import error from 'next/dist/api/error'

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

      router.replace('/signin')
    })

    // router.replace('/signin')
  }, [pathname, router])

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
